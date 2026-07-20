import React from 'react';
import { AppNotification } from '../types';
import { 
  X, Bell, Calendar, Play, HeartHandshake, Users, Image, Settings, Info, Trash2, CheckCheck, Sparkles 
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onTriggerTestNotification: () => void;
  onMarkSingleRead: (id: string) => void;
}

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onTriggerTestNotification,
  onMarkSingleRead
}: NotificationCenterProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'acara':
        return <Calendar size={15} className="text-emerald-500" />;
      case 'khotbah':
        return <Play size={15} className="text-red-500" />;
      case 'doa':
        return <HeartHandshake size={15} className="text-pink-500" />;
      case 'pengumuman':
        return <Bell size={15} className="text-amber-500" />;
      case 'jemaat':
        return <Users size={15} className="text-blue-500" />;
      case 'galeri':
        return <Image size={15} className="text-purple-500" />;
      case 'settings':
        return <Settings size={15} className="text-slate-500" />;
      default:
        return <Info size={15} className="text-indigo-500" />;
    }
  };

  const getNotifBg = (type: AppNotification['type']) => {
    switch (type) {
      case 'acara': return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30';
      case 'khotbah': return 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30';
      case 'doa': return 'bg-pink-50 dark:bg-pink-950/20 border-pink-100 dark:border-pink-900/30';
      case 'pengumuman': return 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30';
      case 'jemaat': return 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30';
      case 'galeri': return 'bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30';
      case 'settings': return 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/30';
      default: return 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" id="notif-center-overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 transition-all duration-300 animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-[#1A237E] text-white">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell size={20} className="text-amber-400 animate-swing" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border border-white rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="font-extrabold text-sm uppercase tracking-wider">Pusat Notifikasi</h2>
              <p className="text-[10px] text-indigo-200 font-bold block uppercase mt-0.5">
                {unreadCount} Pesan Belum Dibaca
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            id="close-notif-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar Actions */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/60 flex justify-between gap-2">
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase py-1.5 px-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
            >
              <CheckCheck size={12} /> Tandai Dibaca
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase py-1.5 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
            >
              <Trash2 size={12} /> Bersihkan
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center text-slate-300 dark:text-slate-700">
                <Bell size={28} />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-700 dark:text-slate-300 uppercase">Tidak Ada Notifikasi</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Semua pembaruan atau perubahan data yang dilakukan admin akan tercatat otomatis di sini.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onMarkSingleRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex gap-3 relative ${getNotifBg(notif.type)} ${
                  !notif.read ? 'ring-1 ring-indigo-500/20 dark:ring-indigo-400/25' : 'opacity-75'
                }`}
              >
                {/* Unread indicator */}
                {!notif.read && (
                  <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-ping-slow" />
                )}

                {/* Left Icon Block */}
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                  {getNotifIcon(notif.type)}
                </div>

                {/* Content Block */}
                <div className="space-y-1 pr-4">
                  <h4 className={`text-xs font-black tracking-tight leading-snug uppercase ${
                    !notif.read ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {notif.message}
                  </p>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold tracking-wider uppercase mt-1">
                    📅 {notif.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Simulator Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider">Demo / Sandbox Mode</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
            Gunakan tombol simulasi di bawah untuk menguji push notifikasi Android dengan efek suara (chime) dan getaran haptic secara instan.
          </p>
          <button
            onClick={onTriggerTestNotification}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-[#1A237E] hover:from-indigo-700 hover:to-[#121858] text-white font-black text-xs rounded-xl transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 mt-1"
            id="simulate-notif-btn"
          >
            🔔 Simulasikan Perubahan Admin
          </button>
        </div>
      </div>
    </div>
  );
}
