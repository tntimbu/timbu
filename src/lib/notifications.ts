import { AppNotification } from '../types';

// Synthesize a beautiful digital "ping" notification chime using Web Audio API
export const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    // Create oscillator and gain nodes
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    
    // Sweet digital double-ping chime: D5 (587.33Hz) followed by A5 (880Hz)
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880.00, now + 0.08);
    
    // Smooth volume ramp-down to avoid cracking
    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.warn("Web Audio API notification sound blocked or not supported:", e);
  }
};

// Trigger physical haptic vibration for Android/mobile devices
export const triggerVibration = () => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      // Elegant double vibration buzz: 120ms buzz, 80ms silence, 120ms buzz
      window.navigator.vibrate([120, 80, 120]);
    } catch (e) {
      console.warn("Haptic vibration blocked or not supported by device/browser:", e);
    }
  }
};

// Notification Database persistence helpers
export const getNotifications = (): AppNotification[] => {
  try {
    const saved = localStorage.getItem('cms_notifications');
    if (!saved) {
      // Seed some default greeting/initial notifications so it's not empty and demonstrates feature immediately
      const initialSeed: AppNotification[] = [
        {
          id: 'welcome-notif',
          title: 'Portal GBI ROCK Juanda Aktif',
          message: 'Selamat datang di Portal Jemaat & Pelayan! Anda akan menerima notifikasi otomatis di sini jika terdapat pembaruan warta, jadwal ibadah, atau khotbah dari admin.',
          timestamp: new Date().toLocaleString('id-ID', { hour12: false }),
          type: 'info',
          read: false
        }
      ];
      localStorage.setItem('cms_notifications', JSON.stringify(initialSeed));
      return initialSeed;
    }
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
};

export const saveNotifications = (notifications: AppNotification[]) => {
  try {
    localStorage.setItem('cms_notifications', JSON.stringify(notifications));
    
    // Update Android Web App badging icon if supported
    const unreadCount = notifications.filter(n => !n.read).length;
    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
      if (unreadCount > 0) {
        (navigator as any).setAppBadge(unreadCount).catch((err: any) => console.log('Badge error:', err));
      } else {
        (navigator as any).clearAppBadge().catch((err: any) => console.log('Badge error:', err));
      }
    }
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
};

// Add a new notification log
export const addNotification = (
  title: string,
  message: string,
  type: AppNotification['type']
): AppNotification => {
  const list = getNotifications();
  const newNotif: AppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title,
    message,
    timestamp: new Date().toLocaleString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    type,
    read: false
  };
  
  // Save to list (prepend to keep latest at top)
  const updated = [newNotif, ...list];
  saveNotifications(updated);
  
  return newNotif;
};
