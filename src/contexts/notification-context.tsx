import type { Notification } from 'src/types';

import { useState, useEffect, useContext, useCallback, createContext, type ReactNode } from 'react';

import { api } from 'src/services/api';

import { useAuth } from './auth-context';
import { useSocket } from './socket-context';

// ----------------------------------------------------------------------

type ToastNotification = Notification & { toastId: string };

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  activeToasts: ToastNotification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  dismissToast: (toastId: string) => void;
  requestPermission: () => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ----------------------------------------------------------------------

type NotificationProviderProps = {
  children: ReactNode;
};

function mapBackendNotification(n: any): Notification {
  return {
    ...n,
    id: n.id || n._id,
    read: n.read ?? n.isRead ?? false,
  };
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeToasts, setActiveToasts] = useState<ToastNotification[]>([]);
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.getNotifications();
      setNotifications(response.notifications.map(mapBackendNotification));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setActiveToasts([]);
    }
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    if (!socket) return undefined;

    socket.on('notification', (newNotif: any) => {
      const notification = mapBackendNotification({ ...newNotif, read: false });

      setNotifications((prev) => [notification, ...prev]);

      // Show in-app toast
      const toastId = `toast-${Date.now()}-${Math.random()}`;
      setActiveToasts((prev) => [...prev, { ...notification, toastId }]);

      // Auto-dismiss toast after 6 seconds
      setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.toastId !== toastId));
      }, 6000);

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new window.Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });
      }
    });

    return () => {
      socket.off('notification');
    };
  }, [socket]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismissToast = useCallback((toastId: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToasts,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        dismissToast,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
