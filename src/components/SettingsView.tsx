import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { getSettings, saveSettings, createNewDatabaseSheet, syncLocalToSheets } from '../lib/sheets';
import { googleSignIn, logout, getAccessToken } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { Settings, RefreshCw, Database, Key, HelpCircle, Check, ShieldAlert, LogIn, LogOut, Info } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  user: FirebaseUser | null;
  onUserChange: (user: FirebaseUser | null) => void;
}

export default function SettingsView({
  settings,
  onUpdateSettings,
  user,
  onUserChange
}: SettingsViewProps) {
  const [churchName, setChurchName] = useState(settings.churchName);
  const [spreadsheetId, setSpreadsheetId] = useState(settings.spreadsheetId);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [welcomeTitle, setWelcomeTitle] = useState(settings.welcomeTitle || "Selamat Datang di GBI ROCK Juanda");
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(settings.welcomeSubtitle || "Membangun jemaat yang bertumbuh, melayani dengan kasih, dan memuliakan nama Tuhan Yesus Kristus.");
  const [logoText, setLogoText] = useState(settings.logoText || "R");
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "https://images.unsplash.com/photo-1545624445-402945a677f2?auto=format&fit=crop&q=80&w=200");
  const [donationQrisUrl, setDonationQrisUrl] = useState(settings.donationQrisUrl || "");
  const [donationQrisAn, setDonationQrisAn] = useState(settings.donationQrisAn || "");
  const [donationBank1Name, setDonationBank1Name] = useState(settings.donationBank1Name || "");
  const [donationBank1No, setDonationBank1No] = useState(settings.donationBank1No || "");
  const [donationBank1An, setDonationBank1An] = useState(settings.donationBank1An || "");
  const [donationBank2Name, setDonationBank2Name] = useState(settings.donationBank2Name || "");
  const [donationBank2No, setDonationBank2No] = useState(settings.donationBank2No || "");
  const [donationBank2An, setDonationBank2An] = useState(settings.donationBank2An || "");
  const [loginTitle, setLoginTitle] = useState(settings.loginTitle || "Satu Portal untuk \nSeluruh Jemaat \n& Pelayan GBI.");
  const [loginSubtitle, setLoginSubtitle] = useState(settings.loginSubtitle || "Akses informasi ibadah raya, video khotbah, warta jemaat terbaru, daftar doa, pendaftaran RSVP acara, dan kas/donasi secara aman dan mudah.");
  const [forgotPasswordInfo, setForgotPasswordInfo] = useState(settings.forgotPasswordInfo || "Untuk keamanan akun Anda, pemulihan atau reset kata sandi (password) diproses secara manual oleh tim IT atau Sekretariat GBI. Silakan hubungi admin gereja melalui tombol WhatsApp di bawah ini.");
  const [forgotPasswordContact, setForgotPasswordContact] = useState(settings.forgotPasswordContact || "+628123456789");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [tokenPresent, setTokenPresent] = useState(false);

  useEffect(() => {
    getAccessToken().then(token => setTokenPresent(!!token));
  }, [user]);

  useEffect(() => {
    setChurchName(settings.churchName);
    setSpreadsheetId(settings.spreadsheetId);
    setApiKey(settings.apiKey);
    setWelcomeTitle(settings.welcomeTitle || "Selamat Datang di GBI ROCK Juanda");
    setWelcomeSubtitle(settings.welcomeSubtitle || "Membangun jemaat yang bertumbuh, melayani dengan kasih, dan memuliakan nama Tuhan Yesus Kristus.");
    setLogoText(settings.logoText || "R");
    setLogoUrl(settings.logoUrl || "https://images.unsplash.com/photo-1545624445-402945a677f2?auto=format&fit=crop&q=80&w=200");
    setDonationQrisUrl(settings.donationQrisUrl || "");
    setDonationQrisAn(settings.donationQrisAn || "");
    setDonationBank1Name(settings.donationBank1Name || "");
    setDonationBank1No(settings.donationBank1No || "");
    setDonationBank1An(settings.donationBank1An || "");
    setDonationBank2Name(settings.donationBank2Name || "");
    setDonationBank2No(settings.donationBank2No || "");
    setDonationBank2An(settings.donationBank2An || "");
    setLoginTitle(settings.loginTitle || "Satu Portal untuk \nSeluruh Jemaat \n& Pelayan GBI.");
    setLoginSubtitle(settings.loginSubtitle || "Akses informasi ibadah raya, video khotbah, warta jemaat terbaru, daftar doa, pendaftaran RSVP acara, dan kas/donasi secara aman dan mudah.");
    setForgotPasswordInfo(settings.forgotPasswordInfo || "Untuk keamanan akun Anda, pemulihan atau reset kata sandi (password) diproses secara manual oleh tim IT atau Sekretariat GBI. Silakan hubungi admin gereja melalui tombol WhatsApp di bawah ini.");
    setForgotPasswordContact(settings.forgotPasswordContact || "+628123456789");
  }, [settings]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      churchName: churchName.trim() || "GBI ROCK Juanda",
      spreadsheetId: spreadsheetId.trim(),
      apiKey: apiKey.trim(),
      welcomeTitle: welcomeTitle.trim(),
      welcomeSubtitle: welcomeSubtitle.trim(),
      logoText: logoText.trim(),
      logoUrl: logoUrl.trim(),
      donationQrisUrl: donationQrisUrl.trim(),
      donationQrisAn: donationQrisAn.trim(),
      donationBank1Name: donationBank1Name.trim(),
      donationBank1No: donationBank1No.trim(),
      donationBank1An: donationBank1An.trim(),
      donationBank2Name: donationBank2Name.trim(),
      donationBank2No: donationBank2No.trim(),
      donationBank2An: donationBank2An.trim(),
      loginTitle: loginTitle.trim(),
      loginSubtitle: loginSubtitle.trim(),
      forgotPasswordInfo: forgotPasswordInfo.trim(),
      forgotPasswordContact: forgotPasswordContact.trim()
    };
    onUpdateSettings(updated);
    alert('Pengaturan berhasil disimpan!');
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        onUserChange(res.user);
        alert(`Berhasil masuk sebagai ${res.user.displayName || res.user.email}`);
      }
    } catch (err: any) {
      alert(`Gagal login dengan Google: ${err.message || err}`);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      onUserChange(null);
      alert('Berhasil keluar akun Google.');
    } catch (err: any) {
      alert(`Gagal logout: ${err.message || err}`);
    }
  };

  const handleCreateNewDatabase = async () => {
    if (!user) {
      alert('Anda harus "Sign In" dengan Google terlebih dahulu untuk membuat Spreadsheet!');
      return;
    }

    const title = prompt("Masukkan nama untuk Spreadsheet baru Anda:", `${churchName} CMS Database`);
    if (!title) return;

    setIsCreatingSheet(true);
    try {
      const sheetId = await createNewDatabaseSheet(title);
      setSpreadsheetId(sheetId);
      
      const updated: AppSettings = {
        churchName,
        spreadsheetId: sheetId,
        apiKey,
        welcomeTitle,
        welcomeSubtitle,
        logoText,
        logoUrl,
        donationQrisUrl,
        donationQrisAn,
        donationBank1Name,
        donationBank1No,
        donationBank1An,
        donationBank2Name,
        donationBank2No,
        donationBank2An
      };
      onUpdateSettings(updated);

      alert(`Sukses! Google Sheets baru berhasil dibuat & dihubungkan.\n\nSpreadsheet ID: ${sheetId}\n\nSemua tabel (Jemaat, Acara, Khotbah, Doa, Pengumuman, Donasi, Admin) telah diinisialisasi beserta data awal.`);
    } catch (err: any) {
      alert(`Gagal membuat Spreadsheet database: ${err.message || err}`);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSyncData = async () => {
    if (!spreadsheetId) {
      alert('Tentukan Spreadsheet ID terlebih dahulu sebelum sinkronisasi!');
      return;
    }

    const confirmed = window.confirm('Apakah Anda yakin ingin menyinkronkan data lokal Anda ke Google Sheets? Data yang ada di Google Sheets dengan nama sheet yang sama akan ditimpa.');
    if (!confirmed) return;

    setIsSyncing(true);
    try {
      const success = await syncLocalToSheets({
        churchName,
        spreadsheetId,
        apiKey,
        welcomeTitle,
        welcomeSubtitle,
        logoText,
        logoUrl,
        donationQrisUrl,
        donationQrisAn,
        donationBank1Name,
        donationBank1No,
        donationBank1An,
        donationBank2Name,
        donationBank2No,
        donationBank2An
      });
      if (success) {
        alert('Sinkronisasi Berhasil! Semua data lokal telah diunggah ke Google Sheets.');
      } else {
        alert('Gagal menyinkronkan data. Pastikan Anda memiliki akses edit ke Spreadsheet tersebut dan sudah login Google.');
      }
    } catch (err: any) {
      alert(`Gagal sinkronisasi: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetLocal = () => {
    const confirmed = window.confirm('PERINGATAN: Ini akan mereset data lokal Anda kembali ke data bawaan GBI ROCK Juanda. Data modifikasi Anda yang tidak disinkronkan akan hilang. Lanjutkan?');
    if (confirmed) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-6 animate-fade-in" id="settings-view-container">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="settings-header">
        <h1 className="text-xl font-black uppercase tracking-tight text-[#1A237E] dark:text-white">Pengaturan Aplikasi</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Hubungkan Google Sheets API dan sesuaikan profil gereja Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-main-grid">
        
        {/* Left column: Connection configurations */}
        <div className="lg:col-span-2 space-y-6" id="settings-form-col">
          {/* Profile & Name form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="profile-card">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
              <Settings size={16} className="text-[#1A237E] dark:text-indigo-400" /> Profil Gereja & Identitas
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Nama Gereja (White-labeling)</label>
                <input 
                  type="text" 
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  placeholder="Contoh: GBI ROCK Juanda"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#1A237E] font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Kustom Logo (URL Gambar Logo Kustom)</label>
                <input 
                  type="url" 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Masukkan URL gambar logo kustom, contoh: https://images.unsplash.com/photo-1545624445-402945a677f2..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#1A237E] font-medium"
                />
                <span className="text-[9px] text-slate-400 mt-1 block font-medium">
                  Masukkan URL gambar logo gereja Anda (Unsplash, Imgur, OneDrive, atau link langsung lainnya). Gambar ini akan dirender di semua area logo aplikasi.
                </span>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Inisial Logo (Fallback Teks)</label>
                <input 
                  type="text" 
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  placeholder="Contoh: R"
                  maxLength={10}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#1A237E] font-medium"
                />
                <span className="text-[9px] text-slate-400 mt-1 block font-medium">
                  Fallback inisial (misal 'R' atau 'GBI') jika gambar logo tidak berhasil dimuat atau sebagai teks alternatif.
                </span>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Judul Banner Selamat Datang (Beranda)</label>
                <input 
                  type="text" 
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                  placeholder="Contoh: Selamat Datang di GBI ROCK Juanda"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#1A237E] font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Deskripsi/Slogan Banner Selamat Datang (Beranda)</label>
                <textarea 
                  value={welcomeSubtitle}
                  onChange={(e) => setWelcomeSubtitle(e.target.value)}
                  placeholder="Membangun jemaat yang bertumbuh, melayani dengan kasih..."
                  rows={2}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#1A237E] font-medium resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Judul Banner Halaman Login</label>
                <textarea 
                  value={loginTitle}
                  onChange={(e) => setLoginTitle(e.target.value)}
                  placeholder="Contoh: Satu Portal untuk &#10;Seluruh Jemaat &#10;& Pelayan GBI."
                  rows={3}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#1A237E] font-medium resize-none"
                />
                <span className="text-[9px] text-slate-400 mt-1 block font-medium">
                  Gunakan baris baru (Enter) untuk mengatur penataan baris teks pada halaman login banner kiri.
                </span>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Deskripsi Banner Halaman Login</label>
                <textarea 
                  value={loginSubtitle}
                  onChange={(e) => setLoginSubtitle(e.target.value)}
                  placeholder="Masukkan deskripsi di bawah judul halaman login..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#1A237E] font-medium resize-none"
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1A237E] dark:text-indigo-400">
                  🔐 Pengaturan Pemulihan Sandi (Lupa Password)
                </h3>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Petunjuk Lupa Password (Info Pemulihan)</label>
                  <textarea 
                    value={forgotPasswordInfo}
                    onChange={(e) => setForgotPasswordInfo(e.target.value)}
                    placeholder="Masukkan instruksi bagi jemaat/pelayan yang lupa password..."
                    rows={3}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#1A237E] font-medium"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block font-medium">
                    Pesan petunjuk yang akan muncul saat jemaat atau pelayan mengklik link "Lupa Password?" pada halaman login.
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Nomor WhatsApp Admin / Kontak Pemulihan</label>
                  <input 
                    type="text" 
                    value={forgotPasswordContact}
                    onChange={(e) => setForgotPasswordContact(e.target.value)}
                    placeholder="Contoh: +628123456789 atau nama/email"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#1A237E] font-medium"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block font-medium">
                    Nomor WhatsApp (gunakan format internasional seperti +628123456789) atau detail kontak sekretariat lainnya untuk tombol hubungi WhatsApp.
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Spreadsheet ID</label>
                <input 
                  type="text" 
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="Masukkan Google Spreadsheet ID..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-[#1A237E]"
                />
                <span className="text-[9px] text-slate-400 mt-1 block font-medium">
                  Bisa dikosongkan untuk menggunakan penyimpanan lokal offline (LocalStorage)
                </span>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Public Google API Key</label>
                <input 
                  type="text" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Masukkan Google API Key (Opsional)..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-[#1A237E]"
                />
                <span className="text-[9px] text-slate-400 mt-1 block font-medium">
                  Digunakan jemaat untuk membaca data secara instan jika spreadsheet disetel "Publik - Siapa saja dengan link dapat melihat"
                </span>
              </div>

              {/* Donation & Bank Customization */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1A237E] dark:text-indigo-400 flex items-center gap-1.5">
                  💳 Konfigurasi Penyaluran Donasi / Kas
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Atur informasi QRIS dan rekening bank resmi gereja Anda yang akan ditampilkan kepada jemaat pada menu Donasi.
                </p>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
                  <span className="font-extrabold text-[10px] text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">1. Metode QRIS Code</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">URL Gambar QRIS (Opsional)</label>
                      <input 
                        type="text" 
                        value={donationQrisUrl}
                        onChange={(e) => setDonationQrisUrl(e.target.value)}
                        placeholder="Contoh: https://link-gambar-qris.com/qris.jpg"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-[#1A237E] font-medium"
                      />
                      <span className="text-[8px] text-slate-400 mt-0.5 block">Kosongkan untuk tetap menggunakan QRIS GoPay bawaan.</span>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Nama Pemilik Akun QRIS (A.N.)</label>
                      <input 
                        type="text" 
                        value={donationQrisAn}
                        onChange={(e) => setDonationQrisAn(e.target.value)}
                        placeholder="Contoh: A.N. Ferdinan Moses Timbu (GoPay)"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-[#1A237E] font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
                  <span className="font-extrabold text-[10px] text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">2. Transfer Bank Utama (Bank 1)</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Nama Bank 1</label>
                      <input 
                        type="text" 
                        value={donationBank1Name}
                        onChange={(e) => setDonationBank1Name(e.target.value)}
                        placeholder="Contoh: BANK BCA"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-[#1A237E] font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">No. Rekening Bank 1</label>
                      <input 
                        type="text" 
                        value={donationBank1No}
                        onChange={(e) => setDonationBank1No(e.target.value)}
                        placeholder="Contoh: 7355287572"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-[#1A237E] font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Atas Nama (A.N.) Bank 1</label>
                      <input 
                        type="text" 
                        value={donationBank1An}
                        onChange={(e) => setDonationBank1An(e.target.value)}
                        placeholder="Contoh: GBI ROCK JUANDA"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-[#1A237E] font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
                  <span className="font-extrabold text-[10px] text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">3. Transfer Bank Alternatif (Bank 2)</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Nama Bank 2</label>
                      <input 
                        type="text" 
                        value={donationBank2Name}
                        onChange={(e) => setDonationBank2Name(e.target.value)}
                        placeholder="Contoh: BANK BRI"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-[#1A237E] font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">No. Rekening Bank 2</label>
                      <input 
                        type="text" 
                        value={donationBank2No}
                        onChange={(e) => setDonationBank2No(e.target.value)}
                        placeholder="Contoh: 493001029465533"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-[#1A237E] font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Atas Nama (A.N.) Bank 2</label>
                      <input 
                        type="text" 
                        value={donationBank2An}
                        onChange={(e) => setDonationBank2An(e.target.value)}
                        placeholder="Contoh: GBI ROCK JUANDA"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-[#1A237E] font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="px-6 py-3 bg-[#1A237E] hover:bg-[#283593] text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer w-full justify-center sm:w-auto"
              >
                <Check size={14} /> Simpan Pengaturan
              </button>
            </form>
          </div>

          {/* Database Setup Wizard */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm border-t-4 border-t-[#FFB300]" id="wizard-card">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-3 flex items-center gap-1.5">
              <Database size={16} className="text-[#FFB300]" /> Inisialisasi Google Sheet Otomatis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium leading-relaxed font-sans">
              Malas membuat tabel manual di Google Sheets? Cukup masuk dengan Google di samping kanan, lalu klik tombol di bawah untuk membuat Google Spreadsheet baru lengkap dengan seluruh tabel dan data jemaat awal otomatis!
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button 
                onClick={handleCreateNewDatabase}
                disabled={isCreatingSheet || !user}
                className={`flex-1 py-3.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !user 
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-[#FFB300] hover:bg-amber-500 text-slate-950 shadow-sm'
                }`}
              >
                <Database size={14} /> 
                {isCreatingSheet ? 'Membuat Spreadsheet...' : 'Buat Database Google Sheets Baru'}
              </button>

              <button 
                onClick={handleSyncData}
                disabled={isSyncing || !spreadsheetId || !user}
                className={`flex-1 py-3.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !user || !spreadsheetId
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-blue-50 dark:bg-indigo-950/30 text-[#1A237E] dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-100 dark:border-indigo-900/50'
                }`}
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Mengunggah...' : 'Sinkronisasi Data Lokal ke Sheets'}
              </button>
            </div>
            {!user && (
              <span className="text-[10px] text-rose-500 font-extrabold block mt-2 text-center uppercase tracking-wide">
                * Hubungkan akun Google Anda terlebih dahulu di kolom sebelah kanan untuk mengaktifkan wizard ini.
              </span>
            )}
          </div>
        </div>

        {/* Right column: Auth card & Guide */}
        <div className="space-y-6" id="settings-right-col">
          {/* Auth Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="auth-card">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-3">Google Account Integration</h2>
            
            {user ? (
              <div className="space-y-4 text-center py-2 animate-fade-in" id="user-profile-active">
                <div className="mx-auto w-14 h-14 rounded-full border-2 border-[#1A237E] p-0.5 overflow-hidden shadow-inner">
                  <img 
                    src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"} 
                    alt={user.displayName || "Google User"}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-tight">{user.displayName || 'Google User'}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                </div>
                
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-1.5 justify-center text-[9px] text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-wider">
                  <Check size={12} />
                  <span>Google Sheets API Terkoneksi</span>
                </div>

                <button 
                  onClick={handleGoogleLogout}
                  className="w-full py-3 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-600 hover:text-rose-600 text-[10px] font-black uppercase tracking-wider rounded-xl border border-slate-100 dark:border-slate-850 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={12} /> Sign Out Google
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-4 text-center text-xs" id="user-profile-inactive">
                <ShieldAlert size={32} className="mx-auto text-[#FFB300] animate-pulse" />
                <p className="text-slate-500 dark:text-slate-400 px-2 leading-relaxed font-medium">
                  Masuk dengan Google untuk menghubungkan CMS ini ke Google Drive dan Google Sheets Anda. Diperlukan hak tulis/baca untuk sinkronisasi.
                </p>
                
                {/* Official Material Style sign-in button */}
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center py-3 bg-[#1A237E] hover:bg-[#283593] text-white font-black rounded-xl uppercase tracking-wider shadow transition-all gap-2 cursor-pointer"
                >
                  <LogIn size={14} />
                  <span className="text-[10px]">Sign In with Google</span>
                </button>
              </div>
            )}
          </div>

          {/* Backup & Danger zone */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm text-xs space-y-4" id="danger-card">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">Pencadangan & Pemulihan</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium font-sans">
              Jika Anda mengalami masalah inkonsistensi data, Anda dapat melakukan reset penyimpanan lokal (LocalStorage) kembali ke data benih default.
            </p>
            <button 
              onClick={handleResetLocal}
              className="w-full py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 hover:text-rose-700 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all border border-rose-100 dark:border-rose-900/50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Reset Data Lokal Kembali ke Default
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
