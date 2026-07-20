import React, { useEffect } from 'react';
import { AppNotification } from '../types';
import { Bell, X, Calendar, Play, HeartHandshake, Users, Image as ImageIcon, Settings, Info } from 'lucide-react';

interface PushNotificationBannerProps {
  notification: AppNotification | null;
  onClose: () => void;
  logoUrl?: string;
  logoText?: string;
  churchName?: string;
}

export default function PushNotificationBanner({
  notification,
  onClose,
  logoUrl,
  logoText = 'R',
  churchName = 'GBI ROCK Juanda'
}: PushNotificationBannerProps) {
  useEffect(() => {
    if (notification) {
      // Automatically hide after 6 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'acara':
        return <Calendar size={14} className="text-emerald-400" />;
      case 'khotbah':
        return <Play size={14} className="text-red-400" />;
      case 'doa':
        return <HeartHandshake size={14} className="text-pink-400" />;
      case 'pengumuman':
        return <Bell size={14} className="text-amber-400" />;
      case 'jemaat':
        return <Users size={14} className="text-blue-400" />;
      case 'galeri':
        return <ImageIcon size={14} className="text-purple-400" />;
      case 'settings':
        return <Settings size={14} className="text-slate-400" />;
      default:
        return <Info size={14} className="text-indigo-400" />;
    }
  };

  return (
    <div 
      className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-down"
      id="android-push-banner"
    >
      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-slate-800/80 flex gap-3.5 items-start relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />

        {/* Logo / App Icon */}
        <div className="shrink-0 relative mt-0.5">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="App Logo" 
              className="w-10 h-10 object-cover rounded-xl border border-slate-700 shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 bg-[#FFB300] rounded-xl flex items-center justify-center font-black text-[#1A237E] text-base shadow-sm">
              {logoText}
            </div>
          )}
          {/* Small sub-badge icon representing category */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center border border-slate-950 shadow-md">
            {getIcon()}
          </div>
        </div>

        {/* Notification details */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black tracking-wider text-amber-400 uppercase truncate">
              {churchName}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap shrink-0">
              Sekarang
            </span>
          </div>
          <h3 className="font-extrabold text-xs text-white leading-tight mt-1 truncate uppercase tracking-tight">
            {notification.title}
          </h3>
          <p className="text-xs text-slate-300 leading-normal font-medium mt-0.5 whitespace-pre-line break-words">
            {notification.message}
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all shrink-0 mt-0.5"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
