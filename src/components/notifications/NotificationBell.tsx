'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition"
        title="Emergency Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[9px] font-mono font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel-elevated border border-slate-700 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Alert Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                  {unreadCount} new
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-1">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No active alerts.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-2.5 rounded-xl transition cursor-pointer ${
                    n.read ? 'opacity-60 hover:opacity-100 hover:bg-slate-800/40' : 'bg-slate-800/40 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      {n.type === 'urgent' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : n.type === 'success' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                      <h5 className="text-xs font-bold text-white leading-tight">{n.title}</h5>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed pl-5">{n.message}</p>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setIsOpen(false)}
                      className="text-[10px] text-cyan-400 hover:underline font-semibold block mt-1.5 pl-5"
                    >
                      View Details →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
