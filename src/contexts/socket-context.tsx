import type { ChatMessage } from 'src/types';

import { useRef, useState, useEffect, useContext, createContext, type ReactNode } from 'react';

// ----------------------------------------------------------------------

type Handler = (payload: any) => void;

/**
 * Native WebSocket client for the Cloudflare RealtimeHub (replaces socket.io).
 * Exposes a small on/off/emit shim so existing consumers keep working, with
 * JSON `{ type, ... }` messages, Clerk-token auth, and reconnect/backoff.
 */
class RealtimeClient {
  private ws: WebSocket | null = null;
  private readonly handlers = new Map<string, Set<Handler>>();
  private readonly serverUrl: string;
  private readonly businessId: string;
  private readonly getToken: () => Promise<string | null>;
  private closed = false;
  private attempts = 0;
  private heartbeat: ReturnType<typeof setInterval> | null = null;

  onStatus?: (connected: boolean) => void;

  constructor(opts: {
    serverUrl: string;
    businessId: string;
    getToken: () => Promise<string | null>;
  }) {
    this.serverUrl = opts.serverUrl;
    this.businessId = opts.businessId;
    this.getToken = opts.getToken;
  }

  async connect(): Promise<void> {
    this.closed = false;
    const token = await this.getToken();
    if (!token || this.closed) return;

    const base = this.serverUrl.replace(/^http/, 'ws');
    const url = `${base}/v1/realtime/ws?token=${encodeURIComponent(token)}&businessId=${encodeURIComponent(this.businessId)}`;
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => {
      this.attempts = 0;
      this.onStatus?.(true);
      this.heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping');
      }, 25000);
    };
    ws.onmessage = (event) => {
      if (typeof event.data !== 'string' || event.data === 'pong') return;
      try {
        const msg = JSON.parse(event.data);
        if (msg && typeof msg.type === 'string') this.dispatch(msg.type, msg);
      } catch {
        /* ignore non-JSON frames */
      }
    };
    ws.onclose = () => {
      this.onStatus?.(false);
      if (this.heartbeat) clearInterval(this.heartbeat);
      if (!this.closed) this.scheduleReconnect();
    };
    ws.onerror = () => {
      try {
        ws.close();
      } catch {
        /* already closing */
      }
    };
  }

  private scheduleReconnect(): void {
    const delay = Math.min(1000 * 2 ** this.attempts, 30000);
    this.attempts += 1;
    setTimeout(() => {
      if (!this.closed) void this.connect();
    }, delay);
  }

  private dispatch(type: string, payload: unknown): void {
    this.handlers.get(type)?.forEach((h) => h(payload));
  }

  on(type: string, handler: Handler): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  off(type: string, handler?: Handler): void {
    if (!handler) {
      this.handlers.delete(type);
      return;
    }
    this.handlers.get(type)?.delete(handler);
  }

  emit(type: string, data?: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  close(): void {
    this.closed = true;
    if (this.heartbeat) clearInterval(this.heartbeat);
    try {
      this.ws?.close();
    } catch {
      /* already closed */
    }
    this.ws = null;
  }
}

// ----------------------------------------------------------------------

type SocketContextType = {
  socket: RealtimeClient | null;
  isConnected: boolean;
  sendMessage: (chatId: string, content: string, type?: 'text' | 'file' | 'image') => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  onMessage: (callback: (message: ChatMessage) => void) => void;
  offMessage: (callback: (message: ChatMessage) => void) => void;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// ----------------------------------------------------------------------

type SocketProviderProps = {
  children: ReactNode;
  businessId: string | null;
  serverUrl?: string;
};

export function SocketProvider({
  children,
  businessId,
  serverUrl = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:8787',
}: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<RealtimeClient | null>(null);

  useEffect(() => {
    if (!businessId) return undefined;

    const client = new RealtimeClient({
      serverUrl,
      businessId,
      getToken: async () => {
        const clerk = (
          globalThis as { Clerk?: { session?: { getToken(): Promise<string | null> } } }
        ).Clerk;
        return clerk?.session ? clerk.session.getToken() : null;
      },
    });
    client.onStatus = setIsConnected;
    clientRef.current = client;
    void client.connect();

    return () => {
      client.close();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [businessId, serverUrl]);

  const sendMessage = (
    chatId: string,
    content: string,
    type: 'text' | 'file' | 'image' = 'text'
  ) => clientRef.current?.emit('sendMessage', { chatId, content, type });

  const joinChat = (chatId: string) => clientRef.current?.emit('joinChat', chatId);
  const leaveChat = (chatId: string) => clientRef.current?.emit('leaveChat', chatId);
  const onMessage = (callback: (message: ChatMessage) => void) =>
    clientRef.current?.on('message', callback as Handler);
  const offMessage = (callback: (message: ChatMessage) => void) =>
    clientRef.current?.off('message', callback as Handler);

  return (
    <SocketContext.Provider
      value={{
        socket: clientRef.current,
        isConnected,
        sendMessage,
        joinChat,
        leaveChat,
        onMessage,
        offMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
