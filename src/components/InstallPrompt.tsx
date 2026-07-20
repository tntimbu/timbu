import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, ArrowUp, Share2, PlusSquare, Info } from 'lucide-react';

interface InstallPromptProps {
  logoText?: string;
  logoUrl?: string;
  churchName?: string;
}

export default function InstallPrompt({ logoText = 'R', logoUrl, churchName = 'GBI ROCK Juanda' }: InstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'other'>('other');
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // 1. Check if user already dismissed the prompt
    const dismissed = localStorage.getItem('cms_pwa_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // 2. Identify the mobile platform
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isMobile = isAndroid || isIos || /mobile|touch/.test(ua);

    if (!isMobile) {
      // Do not show on desktop unless explicitly simulated/small viewport
      return;
    }

    if (isAndroid) {
      setPlatform('android');
    } else if (isIos) {
      setPlatform('ios');
    }

    // 3. Listen for native browser beforeinstallprompt (mostly Chrome on Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Store the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the installation banner
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback: If it's a mobile device and 3 seconds have passed, show the prompt with instructions anyway
    const timer = setTimeout(() => {
      // Check if already in standalone/PWA mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      if (!isStandalone && !localStorage.getItem('cms_pwa_dismissed')) {
        setShowPrompt(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the browser install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      // Show manual instructions modal or panel
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('cms_pwa_dismissed', 'true');
    setIsDismissed(true);
    setShowPrompt(false);
  };

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
  if (isDismissed || isStandalone || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Installation Sheet */}
      <div 
        className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50 bg-gradient-to-r from-indigo-900 to-[#1A237E] text-white p-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-indigo-700/50 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300"
        id="pwa-install-banner"
      >
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-indigo-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          title="Tutup & Jangan tampilkan lagi"
        >
          <X size={16} />
        </button>

        <div className="flex gap-3.5 items-start pr-6">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="w-12 h-12 object-cover rounded-xl shrink-0 shadow-md"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center font-black text-[#1A237E] text-xl shrink-0 shadow-md">
              {logoText}
            </div>
          )}
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-400">Pasang Aplikasi</h3>
            <h2 className="font-black text-sm text-white tracking-tight leading-tight mt-0.5">{churchName}</h2>
            <p className="text-[11px] text-indigo-150 leading-relaxed mt-1 font-medium">
              Instal aplikasi ini di HP Android Anda tanpa Play Store! Cepat, ringan, dan bisa dibuka offline.
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 mt-1">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2.5 px-4 bg-[#FFB300] hover:bg-amber-500 text-[#1A237E] font-black text-xs rounded-xl shadow-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Download size={14} /> {deferredPrompt ? 'Instal Sekarang' : 'Petunjuk Instal'}
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            className="py-2.5 px-3.5 bg-indigo-800/60 hover:bg-indigo-800 text-indigo-100 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <Info size={14} /> Cara Pasang
          </button>
        </div>
      </div>

      {/* Manual Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="pwa-instructions-modal">
          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white w-full max-w-sm rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden space-y-5 animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="bg-amber-100 dark:bg-amber-500/20 text-[#FFB300] font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider block w-max">
                Panduan Pasang
              </span>
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Pasang di Layar Utama</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Instalasi instan tanpa memerlukan Google Play Store.</p>
            </div>

            <div className="space-y-4">
              {platform === 'ios' ? (
                // iOS Safari Steps
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100/30">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-extrabold text-xs shrink-0 mt-0.5">1</div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      Ketuk tombol <strong className="text-indigo-600 dark:text-indigo-400">Bagikan (Share)</strong> <Share2 size={14} className="inline mx-0.5 text-indigo-600" /> yang berada di panel bawah browser Safari Anda.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100/30">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-extrabold text-xs shrink-0 mt-0.5">2</div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      Gulir ke bawah dan ketuk pilihan <strong className="text-indigo-600 dark:text-indigo-400">Tambahkan ke Layar Utama (Add to Home Screen)</strong> <PlusSquare size={14} className="inline mx-0.5 text-indigo-600" />.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100/30">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-extrabold text-xs shrink-0 mt-0.5">3</div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      Ketuk <strong className="text-indigo-600 dark:text-indigo-400">Tambah (Add)</strong> di pojok kanan atas. Aplikasi siap digunakan langsung dari layar utama!
                    </p>
                  </div>
                </div>
              ) : (
                // Android Chrome / Standard Android Steps
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100/30">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-extrabold text-xs shrink-0 mt-0.5">1</div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      Ketuk tombol <strong className="text-indigo-600 dark:text-indigo-400">Menu Opsi (Titik Tiga ⋮)</strong> di kanan atas browser Chrome Anda.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100/30">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-extrabold text-xs shrink-0 mt-0.5">2</div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      Pilih opsi <strong className="text-indigo-600 dark:text-indigo-400">Instal aplikasi</strong> atau <strong className="text-indigo-600 dark:text-indigo-400">Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100/30">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-extrabold text-xs shrink-0 mt-0.5">3</div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      Konfirmasikan tindakan dengan mengetuk <strong className="text-indigo-600 dark:text-indigo-400">Instal / Tambah</strong>. Selesai! Aplikasi akan muncul di beranda HP Anda.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-normal">
                💡 Keuntungan: Menghemat kuota, loading lebih cepat, dan tampilan bersih seperti aplikasi Android biasa tanpa kolom alamat browser.
              </p>
            </div>

            <button
              onClick={() => {
                setShowInstructions(false);
                handleDismiss();
              }}
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all"
            >
              Saya Mengerti, Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
