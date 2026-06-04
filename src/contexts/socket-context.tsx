import type { ChatMessage } from 'src/types';

import io from 'socket.io-client';
import { useRef, useState, useEffect, useContext, createContext, type ReactNode } from 'react';

// ----------------------------------------------------------------------

type Socket = ReturnType<typeof io>;

type SocketContextType = {
  socket: Socket | null;
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
  token: string | null;
  serverUrl?: string;
};

// Resolve the realtime server origin. In v1 the Socket.IO server runs on the SAME host/port
// as the REST API, so derive it from VITE_API_URL (stripping the "/v1" path). This avoids
// accidentally pointing at a stale VITE_SOCKET_URL (e.g. a previous deployment host).
function resolveSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      /* fall through to other options */
    }
  }
  const explicit = import.meta.env.VITE_SOCKET_URL as string | undefined;
  return explicit || 'http://localhost:4000';
}

export function SocketProvider({
  children,
  token,
  serverUrl = resolveSocketUrl(),
}: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageCallbacksRef = useRef<Set<(message: ChatMessage) => void>>(new Set());

  useEffect(() => {
    if (!token) return undefined;

    const newSocket = io(serverUrl, {
      // Backend accepts "Bearer <jwt>" (and strips it); query is a fallback for some proxies.
      auth: { token: `Bearer ${token}` },
      query: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('[socket] connected', newSocket.id, '->', serverUrl);
    });

    newSocket.on('connected', (data) => {
      console.log('[socket] joined realtime rooms', data);
    });

    newSocket.on('connect_error', (err: Error) => {
      setIsConnected(false);
      console.error(`[socket] connect_error: ${err.message} (url: ${serverUrl})`);
    });

    newSocket.io.on('reconnect', (attempt: number) => {
      console.log('[socket] reconnected after', attempt, 'attempt(s)');
    });

    newSocket.on('disconnect', (reason: string) => {
      setIsConnected(false);
      console.log('[socket] disconnected:', reason);
    });

    newSocket.on('message', (message: ChatMessage) => {
      messageCallbacksRef.current.forEach((callback) => callback(message));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, serverUrl]);

  const sendMessage = (
    chatId: string,
    content: string,
    type: 'text' | 'file' | 'image' = 'text'
  ) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', { chatId, content, type });
    }
  };

  const joinChat = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('joinChat', chatId);
    }
  };

  const leaveChat = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('leaveChat', chatId);
    }
  };

  const onMessage = (callback: (message: ChatMessage) => void) => {
    messageCallbacksRef.current.add(callback);
  };

  const offMessage = (callback: (message: ChatMessage) => void) => {
    messageCallbacksRef.current.delete(callback);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
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
