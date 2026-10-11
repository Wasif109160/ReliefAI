'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { InAppNotification } from '@/lib/types';

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  activeToast: InAppNotification | null;
  dismissToast: () => void;
}

const initialNotifications: InAppNotification[] = [
  {
    id: 'notif-1',
    targetRole: 'all',
    title: 'EVACUATION ALERT: Sector 4 Riverbanks',
    message: 'River stage has reached 19.4 ft. Citizens in Lowlands must evacuate to Redwood Valley or Civic Arena.',
    type: 'urgent',
    timestamp: '5m ago',
    read: false,
    link: '/shelters',
  },
  {
    id: 'notif-2',
    targetRole: 'volunteer',
    title: 'Mission Assignment: Water Distribution',
    message: 'Swift-water boat pilots requested at River Staging Ramp Dock B. Check mission board.',
    type: 'warning',
    timestamp: '18m ago',
    read: false,
    link: '/dashboard/volunteer',
  },
  {
    id: 'notif-3',
    targetRole: 'ngo',
    title: 'Relief Convoy Delivered: Depot Gamma',
    message: '1,200 water bladders and 500 trauma kits marked as received by Lincoln Safe Zone.',
    type: 'success',
    timestamp: '42m ago',
    read: true,
    link: '/distribution',
  },
];

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  activeToast: null,
  dismissToast: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<InAppNotification[]>(initialNotifications);
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (item: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: InAppNotification = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);
    setTimeout(() => {
      setActiveToast((current) => (current?.id === newNotif.id ? null : current));
    }, 5000);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissToast = () => setActiveToast(null);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        activeToast,
        dismissToast,
      }}
    >
      {children}
      {/* Active Toast Notification Overlay */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl glass-panel-elevated border border-red-500/50 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest block">
                {activeToast.type === 'urgent' ? '🚨 EMERGENCY DISPATCH' : 'ℹ️ NOTIFICATION'}
              </span>
              <h4 className="text-xs font-bold text-white">{activeToast.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{activeToast.message}</p>
            </div>
            <button
              onClick={dismissToast}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
