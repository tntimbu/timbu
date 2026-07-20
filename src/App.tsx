import React, { useState, useEffect } from 'react';
import { 
  ActiveTab, Jemaat, Acara, Khotbah, Doa, Pengumuman, Donasi, AdminUser, AppSettings, RsvpRecord, Foto, AppNotification 
} from './types';
import { 
  getLocalData, saveLocalData, getSettings, saveSettings, fetchFromSheets, writeToSheets, appendToSheets 
} from './lib/sheets';
import { initAuth } from './lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  getNotifications, saveNotifications, addNotification, playNotificationSound, triggerVibration 
} from './lib/notifications';

// Component Views
import DashboardView from './components/DashboardView';
import JemaatView from './components/JemaatView';
import AcaraView from './components/AcaraView';
import KhotbahView from './components/KhotbahView';
import DoaView from './components/DoaView';
import PengumumanView from './components/PengumumanView';
import DonasiView from './components/DonasiView';
import SettingsView from './components/SettingsView';
import InstallPrompt from './components/InstallPrompt';
import NotificationCenter from './components/NotificationCenter';
import PushNotificationBanner from './components/PushNotificationBanner';

// Icons
import { 
  LayoutDashboard, Users, Calendar, Play, HeartHandshake, Bell, CircleDollarSign, 
  Settings, LogIn, LogOut, Sun, Moon, Sparkles, RefreshCw, ChevronRight, Menu, X, ShieldAlert,
  HelpCircle, MessageSquare
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Settings State
  const [settings, setSettingsState] = useState<AppSettings>(getSettings());

  // Database States
  const [jemaat, setJemaat] = useState<Jemaat[]>(getLocalData<Jemaat>('jemaat'));
  const [acara, setAcara] = useState<Acara[]>(getLocalData<Acara>('acara'));
  const [khotbah, setKhotbah] = useState<Khotbah[]>(getLocalData<Khotbah>('khotbah'));
  const [doa, setDoa] = useState<Doa[]>(getLocalData<Doa>('doa'));
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>(getLocalData<Pengumuman>('pengumuman'));
  const [donasi, setDonasi] = useState<Donasi[]>(getLocalData<Donasi>('donasi'));
  const [admins, setAdmins] = useState<AdminUser[]>(getLocalData<AdminUser>('admin'));
  const [rsvps, setRsvps] = useState<RsvpRecord[]>(() => getLocalData<RsvpRecord>('rsvp'));
  const [fotos, setFotos] = useState<Foto[]>(() => getLocalData<Foto>('foto'));

  // Loading & Sync States
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Authentication States
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  
  // App Role Authentication (for Staff/Admin login with credentials in sheet "Admin")
  const [appUser, setAppUser] = useState<AdminUser | null>(() => {
    const saved = sessionStorage.getItem('cms_app_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'Jemaat' | 'Staff/Admin'>('Jemaat');
  const [loginUsername, setLoginUsername] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Notification System States
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getNotifications());
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);
  const [activeBannerNotification, setActiveBannerNotification] = useState<AppNotification | null>(null);

  const triggerNotification = (title: string, message: string, type: AppNotification['type']) => {
    const newNotif = addNotification(title, message, type);
    setNotifications(getNotifications());
    playNotificationSound();
    triggerVibration();
    setActiveBannerNotification(newNotif);
  };

  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply Dark Mode Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Migrate default settings if they are old values or empty
  useEffect(() => {
    let needsUpdate = false;
    const updated = { ...settings };
    if (settings.forgotPasswordContact === "+628123456789" || !settings.forgotPasswordContact) {
      updated.forgotPasswordContact = "085743221132";
      needsUpdate = true;
    }
    if (!settings.logoUrl) {
      updated.logoUrl = "https://images.unsplash.com/photo-1545624445-402945a677f2?auto=format&fit=crop&q=80&w=200";
      needsUpdate = true;
    }
    if (needsUpdate) {
      setSettingsState(updated);
      saveSettings(updated);
    }
  }, [settings]);

  // Track Google OAuth Status
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        // Automatically load sheets once token is present
        loadDatabaseFromSheets();
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync / Load spreadsheet data
  const loadDatabaseFromSheets = async (targetSettings = settings) => {
    if (!targetSettings.spreadsheetId) return;
    setIsLoading(true);
    setSyncStatus('syncing');

    try {
      // 1. Fetch Jemaat
      const rawJemaat = await fetchFromSheets('Jemaat', targetSettings);
      if (rawJemaat && rawJemaat.length > 1) {
        const mapped = rawJemaat.slice(1).map(row => ({
          nama: row[0] || '',
          kontak: row[1] || '',
          alamat: row[2] || '',
          statusKeanggotaan: row[3] || 'Jemaat Tetap',
          tanggalBaptis: row[4] || '-',
          tanggalBergabung: row[5] || '',
          kelompokKecil: row[6] || 'COOL ROCK Juanda 1',
          peran: row[7] || 'Jemaat',
          username: row[8] || '',
          password: row[9] || ''
        }));
        setJemaat(mapped);
        saveLocalData('jemaat', mapped);
      }

      // 2. Fetch Acara
      const rawAcara = await fetchFromSheets('Acara', targetSettings);
      if (rawAcara && rawAcara.length > 1) {
        const mapped = rawAcara.slice(1).map(row => ({
          judulAcara: row[0] || '',
          tanggal: row[1] || '',
          waktu: row[2] || '',
          lokasi: row[3] || '',
          kapasitas: Number(row[4]) || 100,
          terdaftar: Number(row[5]) || 0,
          status: (row[6] as any) || 'Akan Datang'
        }));
        setAcara(mapped);
        saveLocalData('acara', mapped);
      }

      // 3. Fetch Khotbah
      const rawKhotbah = await fetchFromSheets('Khotbah', targetSettings);
      if (rawKhotbah && rawKhotbah.length > 1) {
        const mapped = rawKhotbah.slice(1).map(row => ({
          judul: row[0] || '',
          pembicara: row[1] || '',
          tanggal: row[2] || '',
          topik: row[3] || '',
          ayatAlkitab: row[4] || '',
          linkYouTube: row[5] || '',
          catatan: row[6] || ''
        }));
        setKhotbah(mapped);
        saveLocalData('khotbah', mapped);
      }

      // 4. Fetch Doa
      const rawDoa = await fetchFromSheets('Doa', targetSettings);
      if (rawDoa && rawDoa.length > 1) {
        const mapped = rawDoa.slice(1).map(row => ({
          namaPengirim: row[0] || '',
          permohonan: row[1] || '',
          kategori: row[2] || 'Keluarga',
          tanggal: row[3] || '',
          status: (row[4] as any) || 'Dikirim'
        }));
        setDoa(mapped);
        saveLocalData('doa', mapped);
      }

      // 5. Fetch Pengumuman
      const rawPengumuman = await fetchFromSheets('Pengumuman', targetSettings);
      if (rawPengumuman && rawPengumuman.length > 1) {
        const mapped = rawPengumuman.slice(1).map(row => ({
          judul: row[0] || '',
          isi: row[1] || '',
          kategori: row[2] || 'Umum',
          tanggalMulai: row[3] || '',
          tanggalBerakhir: row[4] || ''
        }));
        setPengumuman(mapped);
        saveLocalData('pengumuman', mapped);
      }

      // 6. Fetch Donasi
      const rawDonasi = await fetchFromSheets('Donasi', targetSettings);
      if (rawDonasi && rawDonasi.length > 1) {
        const mapped = rawDonasi.slice(1).map(row => ({
          namaDonatur: row[0] || '',
          jumlah: Number(row[1]) || 0,
          tanggal: row[2] || '',
          keterangan: row[3] || '',
          metode: row[4] || ''
        }));
        setDonasi(mapped);
        saveLocalData('donasi', mapped);
      }

      // 7. Fetch Admin (Admins/Staff)
      const rawAdmin = await fetchFromSheets('Admin', targetSettings);
      if (rawAdmin && rawAdmin.length > 1) {
        const mapped = rawAdmin.slice(1).map(row => ({
          email: row[0] || '',
          password: row[1] || '',
          peran: (row[2] as any) || 'Jemaat',
          nama: row[3] || ''
        }));
        setAdmins(mapped);
        saveLocalData('admin', mapped);
      }

      // 8. Fetch RSVP (Registrations)
      try {
        const rawRsvp = await fetchFromSheets('RSVP', targetSettings);
        if (rawRsvp && rawRsvp.length > 1) {
          const mapped = rawRsvp.slice(1).map(row => ({
            namaJemaat: row[0] || '',
            emailOrUsername: row[1] || '',
            judulAcara: row[2] || '',
            tanggalAcara: row[3] || '',
            waktuKonfirmasi: row[4] || ''
          }));
          setRsvps(mapped);
          saveLocalData('rsvp', mapped);
        }
      } catch (err) {
        console.warn("Sheet RSVP tidak ditemukan atau gagal dimuat, menggunakan data lokal:", err);
      }

      // 9. Fetch Galeri / Fotos
      try {
        const rawFotos = await fetchFromSheets('Galeri', targetSettings);
        if (rawFotos && rawFotos.length > 1) {
          const mapped = rawFotos.slice(1).map(row => ({
            judul: row[0] || '',
            deskripsi: row[1] || '',
            urlGambar: row[2] || '',
            tanggalUploaded: row[3] || ''
          }));
          setFotos(mapped);
          saveLocalData('foto', mapped);
        }
      } catch (err) {
        console.warn("Sheet Galeri tidak ditemukan atau gagal dimuat, menggunakan data lokal:", err);
      }

      setSyncStatus('success');
    } catch (error) {
      console.error("Gagal sinkronisasi dengan Google Sheets:", error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleUpdateSettings = (updated: AppSettings) => {
    setSettingsState(updated);
    saveSettings(updated);
    triggerNotification('Konfigurasi Portal Diperbarui', 'Admin baru saja memperbarui konfigurasi umum dan tampilan portal jemaat GBI ROCK Juanda.', 'settings');
    loadDatabaseFromSheets(updated);
  };

  // Role permissions calculations
  const appRole = appUser ? appUser.peran : 'Jemaat';
  const isAdminOrStaff = appRole === 'Admin' || appRole === 'Staff';

  // App Login action handler (verification against "Admin" sheet or "Jemaat" sheet)
  const handleAppLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginRole === 'Staff/Admin') {
      const userMatch = admins.find(
        a => a.email.toLowerCase() === loginEmail.toLowerCase().trim() && a.password === loginPassword
      );

      if (userMatch) {
        setAppUser(userMatch);
        sessionStorage.setItem('cms_app_user', JSON.stringify(userMatch));
        setIsLoginOpen(false);
        setLoginEmail('');
        setLoginPassword('');
        setActiveTab('dashboard');
        alert(`Selamat datang kembali, ${userMatch.nama}! Peran Anda: ${userMatch.peran}`);
      } else {
        alert('Email atau Password Staff/Admin salah! Silakan coba lagi.');
      }
    } else {
      // Jemaat login logic
      const userMatch = jemaat.find(
        j => j.username?.toLowerCase() === loginUsername.toLowerCase().trim() && j.password === loginPassword
      );

      if (userMatch) {
        const virtualUser: AdminUser = {
          email: `${userMatch.username || 'jemaat'}@gbirockjuanda.org`,
          peran: 'Jemaat',
          nama: userMatch.nama
        };
        setAppUser(virtualUser);
        sessionStorage.setItem('cms_app_user', JSON.stringify(virtualUser));
        setIsLoginOpen(false);
        setLoginUsername('');
        setLoginPassword('');
        setActiveTab('dashboard');
        alert(`Selamat datang kembali, ${userMatch.nama}! Anda masuk sebagai Jemaat GBI ROCK Juanda.`);
      } else {
        alert('Username atau Password Jemaat salah! Silakan coba lagi.');
      }
    }
  };

  const handleAppLogout = () => {
    setAppUser(null);
    sessionStorage.removeItem('cms_app_user');
    alert('Anda telah keluar dari akun.');
  };

  // Dual CRUD Operations: write locally and sync with Google Sheets automatically if authenticated
  
  // 1. Jemaat CRUD
  const handleAddJemaat = async (item: Jemaat) => {
    const newList = [...jemaat, item];
    setJemaat(newList);
    saveLocalData('jemaat', newList);
    triggerNotification('Registrasi Jemaat Baru', `Admin mendaftarkan jemaat baru bernama '${item.nama}' ke dalam sistem database gereja.`, 'jemaat');

    if (settings.spreadsheetId && googleUser) {
      await appendToSheets('Jemaat', 'A', [
        item.nama, item.kontak, item.alamat, item.statusKeanggotaan, item.tanggalBaptis, item.tanggalBergabung, item.kelompokKecil, item.peran, item.username || "", item.password || ""
      ], settings);
    }
  };

  const handleEditJemaat = async (index: number, item: Jemaat) => {
    const newList = [...jemaat];
    newList[index] = item;
    setJemaat(newList);
    saveLocalData('jemaat', newList);
    triggerNotification('Data Jemaat Diperbarui', `Admin memperbarui profil keanggotaan jemaat '${item.nama}'.`, 'jemaat');

    if (settings.spreadsheetId && googleUser) {
      // Rewrite entire table to ensure precise edits
      const rawRows = [
        ["Nama", "Kontak", "Alamat", "Status Keanggotaan", "Tanggal Baptis", "Tanggal Bergabung", "Kelompok Kecil", "Peran", "Username", "Password"],
        ...newList.map(j => [j.nama, j.kontak, j.alamat, j.statusKeanggotaan, j.tanggalBaptis, j.tanggalBergabung, j.kelompokKecil, j.peran, j.username || "", j.password || ""])
      ];
      await writeToSheets('Jemaat', 'A1:J1000', rawRows, settings);
    }
  };

  const handleDeleteJemaat = async (index: number) => {
    const jName = jemaat[index]?.nama || 'Jemaat';
    const newList = jemaat.filter((_, i) => i !== index);
    setJemaat(newList);
    saveLocalData('jemaat', newList);
    triggerNotification('Data Jemaat Dihapus', `Data jemaat '${jName}' telah dihapus dari sistem oleh admin.`, 'jemaat');

    if (settings.spreadsheetId && googleUser) {
      const rawRows = [
        ["Nama", "Kontak", "Alamat", "Status Keanggotaan", "Tanggal Baptis", "Tanggal Bergabung", "Kelompok Kecil", "Peran", "Username", "Password"],
        ...newList.map(j => [j.nama, j.kontak, j.alamat, j.statusKeanggotaan, j.tanggalBaptis, j.tanggalBergabung, j.kelompokKecil, j.peran, j.username || "", j.password || ""])
      ];
      await writeToSheets('Jemaat', 'A1:J1000', rawRows, settings);
    }
  };

  // 2. Acara CRUD + RSVP
  const handleAddAcara = async (item: Acara) => {
    const newList = [...acara, item];
    setAcara(newList);
    saveLocalData('acara', newList);
    triggerNotification('Acara Baru Dijadwalkan', `Mari hadiri '${item.judulAcara}' yang akan diadakan pada ${item.tanggal} jam ${item.waktu} di ${item.lokasi}.`, 'acara');

    if (settings.spreadsheetId && googleUser) {
      await appendToSheets('Acara', 'A', [
        item.judulAcara, item.tanggal, item.waktu, item.lokasi, item.kapasitas, item.terdaftar, item.status
      ], settings);
    }
  };

  const handleEditAcara = async (index: number, item: Acara) => {
    const newList = [...acara];
    newList[index] = item;
    setAcara(newList);
    saveLocalData('acara', newList);
    triggerNotification('Jadwal Acara Diperbarui', `Terdapat pembaruan informasi atau lokasi untuk acara '${item.judulAcara}' (${item.tanggal}).`, 'acara');

    if (settings.spreadsheetId && googleUser) {
      const rawRows = [
        ["Judul Acara", "Tanggal", "Waktu", "Lokasi", "Kapasitas", "Terdaftar", "Status"],
        ...newList.map(a => [a.judulAcara, a.tanggal, a.waktu, a.lokasi, a.kapasitas, a.terdaftar, a.status])
      ];
      await writeToSheets('Acara', 'A1:G1000', rawRows, settings);
    }
  };

  const handleDeleteAcara = async (index: number) => {
    const aTitle = acara[index]?.judulAcara || 'Acara';
    const newList = acara.filter((_, i) => i !== index);
    setAcara(newList);
    saveLocalData('acara', newList);
    triggerNotification('Jadwal Acara Dibatalkan', `Jadwal pelaksanaan '${aTitle}' dibatalkan atau ditunda oleh pihak sekretariat.`, 'acara');

    if (settings.spreadsheetId && googleUser) {
      const rawRows = [
        ["Judul Acara", "Tanggal", "Waktu", "Lokasi", "Kapasitas", "Terdaftar", "Status"],
        ...newList.map(a => [a.judulAcara, a.tanggal, a.waktu, a.lokasi, a.kapasitas, a.terdaftar, a.status])
      ];
      await writeToSheets('Acara', 'A1:G1000', rawRows, settings);
    }
  };

  const handleRSVPAcara = async (index: number) => {
    const newList = [...acara];
    const event = newList[index];
    event.terdaftar += 1;
    setAcara(newList);
    saveLocalData('acara', newList);

    // Create persistent RSVP Record
    const userIdentifier = appUser ? (appUser.email || appUser.username || 'anonim') : 'anonim';
    const newRecord: RsvpRecord = {
      namaJemaat: appUser?.nama || 'Jemaat Umum',
      emailOrUsername: userIdentifier,
      judulAcara: event.judulAcara,
      tanggalAcara: event.tanggal,
      waktuKonfirmasi: new Date().toLocaleString('id-ID', { hour12: false })
    };

    const newRsvps = [...rsvps, newRecord];
    setRsvps(newRsvps);
    saveLocalData('rsvp', newRsvps);

    if (settings.spreadsheetId && googleUser) {
      // 1. Update the Acara registered counter
      const rawRows = [
        ["Judul Acara", "Tanggal", "Waktu", "Lokasi", "Kapasitas", "Terdaftar", "Status"],
        ...newList.map(a => [a.judulAcara, a.tanggal, a.waktu, a.lokasi, a.kapasitas, a.terdaftar, a.status])
      ];
      await writeToSheets('Acara', 'A1:G1000', rawRows, settings);

      // 2. Append the RSVP registration record
      try {
        await appendToSheets('RSVP', 'A', [
          newRecord.namaJemaat,
          newRecord.emailOrUsername,
          newRecord.judulAcara,
          newRecord.tanggalAcara,
          newRecord.waktuKonfirmasi
        ], settings);
      } catch (err) {
        console.warn("Gagal merekam ke sheet RSVP (kemungkinan sheet RSVP belum terbuat):", err);
      }
    }
  };

  // 3. Khotbah CRUD
  const handleAddKhotbah = async (item: Khotbah) => {
    const newList = [...khotbah, item];
    setKhotbah(newList);
    saveLocalData('khotbah', newList);
    triggerNotification('Rangkuman Khotbah Baru', `Rangkuman khotbah '${item.judul}' oleh ${item.pembicara} kini tersedia di menu Khotbah.`, 'khotbah');

    if (settings.spreadsheetId && googleUser) {
      await appendToSheets('Khotbah', 'A', [
        item.judul, item.pembicara, item.tanggal, item.topik, item.ayatAlkitab, item.linkYouTube, item.catatan
      ], settings);
    }
  };

  const handleEditKhotbah = async (index: number, item: Khotbah) => {
    const newList = [...khotbah];
    newList[index] = item;
    setKhotbah(newList);
    saveLocalData('khotbah', newList);
    triggerNotification('Catatan Khotbah Diperbarui', `Admin memperbarui rangkuman atau catatan untuk khotbah '${item.judul}'.`, 'khotbah');

    if (settings.spreadsheetId && googleUser) {
      const rawRows = [
        ["Judul", "Pembicara", "Tanggal", "Topik", "Ayat Alkitab", "Link YouTube", "Catatan"],
        ...newList.map(k => [k.judul, k.pembicara, k.tanggal, k.topik, k.ayatAlkitab, k.linkYouTube, k.catatan])
      ];
      await writeToSheets('Khotbah', 'A1:G1000', rawRows, settings);
    }
  };

  const handleDeleteKhotbah = async (index: number) => {
    const kTitle = khotbah[index]?.judul || 'Khotbah';
    const newList = khotbah.filter((_, i) => i !== index);
    setKhotbah(newList);
    saveLocalData('khotbah', newList);
    triggerNotification('Catatan Khotbah Dihapus', `Rangkuman khotbah '${kTitle}' telah dihapus dari sistem oleh admin.`, 'khotbah');

    if (settings.spreadsheetId && googleUser) {
      const rawRows = [
        ["Judul", "Pembicara", "Tanggal", "Topik", "Ayat Alkitab", "Link YouTube", "Catatan"],
        ...newList.map(k => [k.judul, k.pembicara, k.tanggal, k.topik, k.ayatAlkitab, k.linkYouTube, k.catatan])
      ];
      await writeToSheets('Khotbah', 'A1:G1000', rawRows, settings);
    }
  };

  // 4. Doa CRUD (Jemaat adds, Admin edits status)
  const handleAddDoa = async (item: Doa) => {
    const newList = [...doa, item];
    setDoa(newList);
    saveLocalData('doa', newList);

    if (settings.spreadsheetId && googleUser) {
      await appendToSheets('Doa', 'A', [
        item.namaPengirim, item.permohonan, item.kategori, item.tanggal, item.status
      ], settings);
    }
  };

  const handleEditDoa = async (index: number, item: Doa) => {
    const newList = [...doa];
    newList[index] = item;
    setDoa(newList);
    saveLocalData('doa', newList);
    triggerNotification('Status Doa Diperbarui', `Permohonan doa dari '${item.namaPengirim}' diperbarui oleh admin menjadi: [${item.status}].`, 'doa');

    if (settings.spreadsheetId && googleUser) {
      const rawRows = [
        ["Nama Pengirim", "Permohonan", "Kategori", "Tanggal", "Status"],
        ...newList.map(d => [d.namaPengirim, d.permohonan, d.kategori, d.tanggal, d.status])
      ];
      await writeToSheets('Doa', 'A1:E1000', rawRows, settings);
    }
  };

  const handleDeleteDoa = async (index: number) => {
    const dSender = doa[index]?.namaPengirim || 'Jemaat';
    const newList = doa.filter((_, i) => i !== index);
    setDoa(newList);
    saveLocalData('doa', newList);
    triggerNotification('Permohonan Doa Dihapus', `Permohonan doa dari '${dSender}' telah dihapus dari sistem oleh admin.`, 'doa');

    if (settings.spreadsheetId && googleUser) {
      const rawRows = [
        ["Nama Pengirim", "Permohonan", "Kategori", "Tanggal", "Status"],
        ...newList.map(d => [d.namaPengirim, d.permohonan, d.kategori, d.tanggal, d.status])
      ];
      await writeToSheets('Doa', 'A1:E1000', rawRows, settings);
    }
  };

  // 5. Pengumuman CRUD
  const handleAddPengumuman = async (item: Pengumuman) => {
    const newList = [...pengumuman, item];
    setPengumuman(newList);
    saveLocalData('pengumuman', newList);
    triggerNotification('Warta Jemaat Baru', `Warta baru dirilis: "${item.judul}". Silakan cek selengkapnya di menu Warta.`, 'pengumuman');

    if (settings.spreadsheetId && googleUser) {
      await appendToSheets('Pengumuman', 'A', [
        item.judul, item.isi, item.kategori, item.tanggalMulai, item.tanggalBerakhir
      ], settings);
    }
  };

  const handleEditPengumuman = async (index: number, item: Pengumuman) => {
    const newList = [...pengumuman];
    newList[index] = item;
    setPengumuman(newList);
    saveLocalData('pengumuman', newList);
    triggerNotification('Warta Jemaat Diperbarui', `Admin melakukan pembaruan informasi pada warta: "${item.judul}".`, 'pengumuman');

    if (settings.spreadsheetId && googleUser) {
      const rawRows = [
        ["Judul", "Isi", "Kategori", "Tanggal Mulai", "Tanggal Berakhir"],
        ...newList.map(p => [p.judul, p.isi, p.kategori, p.tanggalMulai, p.tanggalBerakhir])
      ];
      await writeToSheets('Pengumuman', 'A1:E1000', rawRows, settings);
    }
  };

  const handleDeletePengumuman = async (index: number) => {
    const pTitle = pengumuman[index]?.judul || 'Warta';
    const newList = pengumuman.filter((_, i) => i !== index);
    setPengumuman(newList);
    saveLocalData('pengumuman', newList);
    triggerNotification('Warta Jemaat Ditarik', `Warta jemaat dengan judul "${pTitle}" telah ditarik/dihapus oleh admin.`, 'pengumuman');

    if (settings.spreadsheetId && googleUser) {
      const rawRows = [
        ["Judul", "Isi", "Kategori", "Tanggal Mulai", "Tanggal Berakhir"],
        ...newList.map(p => [p.judul, p.isi, p.kategori, p.tanggalMulai, p.tanggalBerakhir])
      ];
      await writeToSheets('Pengumuman', 'A1:E1000', rawRows, settings);
    }
  };

  // 6. Donasi CRUD
  const handleAddDonasi = async (item: Donasi) => {
    const newList = [...donasi, item];
    setDonasi(newList);
    saveLocalData('donasi', newList);

    if (settings.spreadsheetId && googleUser) {
      await appendToSheets('Donasi', 'A', [
        item.namaDonatur, item.jumlah, item.tanggal, item.keterangan, item.metode
      ], settings);
    }
  };

  // 7. Foto CRUD
  const handleAddFoto = async (item: Foto) => {
    const newList = [item, ...fotos];
    setFotos(newList);
    saveLocalData('foto', newList);
    triggerNotification('Dokumentasi Galeri Baru', `Admin mengunggah foto dokumentasi baru: "${item.judul}". Silakan cek di menu Galeri!`, 'galeri');

    if (settings.spreadsheetId && googleUser) {
      const rawRows = [
        ["Judul", "Deskripsi", "URL Gambar", "Tanggal Diunggah"],
        ...newList.map(f => [f.judul, f.deskripsi, f.urlGambar, f.tanggalUploaded])
      ];
      await writeToSheets('Galeri', 'A1:D1000', rawRows, settings);
    }
  };

  const handleDeleteFoto = async (index: number) => {
    const fTitle = fotos[index]?.judul || 'Foto';
    const newList = fotos.filter((_, i) => i !== index);
    setFotos(newList);
    saveLocalData('foto', newList);
    triggerNotification('Foto Galeri Dihapus', `Foto dokumentasi "${fTitle}" telah dihapus dari Galeri oleh admin.`, 'galeri');

    if (settings.spreadsheetId && googleUser) {
      const rawRows = [
        ["Judul", "Deskripsi", "URL Gambar", "Tanggal Diunggah"],
        ...newList.map(f => [f.judul, f.deskripsi, f.urlGambar, f.tanggalUploaded])
      ];
      await writeToSheets('Galeri', 'A1:D1000', rawRows, settings);
    }
  };

  // Render correct child view
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            jemaat={jemaat} 
            acara={acara} 
            doa={doa} 
            donasi={donasi} 
            pengumuman={pengumuman} 
            fotos={fotos}
            onAddFoto={handleAddFoto}
            onDeleteFoto={handleDeleteFoto}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isAdminOrStaff={isAdminOrStaff}
            settings={settings}
          />
        );
      case 'jemaat':
        return (
          <JemaatView 
            data={jemaat} 
            onAdd={handleAddJemaat}
            onEdit={handleEditJemaat}
            onDelete={handleDeleteJemaat}
            isAdminOrStaff={isAdminOrStaff}
          />
        );
      case 'acara':
        return (
          <AcaraView 
            data={acara} 
            rsvps={rsvps}
            appUser={appUser}
            onAdd={handleAddAcara}
            onEdit={handleEditAcara}
            onDelete={handleDeleteAcara}
            onRSVP={handleRSVPAcara}
            isAdminOrStaff={isAdminOrStaff}
          />
        );
      case 'khotbah':
        return (
          <KhotbahView 
            data={khotbah} 
            onAdd={handleAddKhotbah}
            onEdit={handleEditKhotbah}
            onDelete={handleDeleteKhotbah}
            isAdminOrStaff={isAdminOrStaff}
          />
        );
      case 'doa':
        return (
          <DoaView 
            data={doa} 
            onAdd={handleAddDoa}
            onEdit={handleEditDoa}
            onDelete={handleDeleteDoa}
            isAdminOrStaff={isAdminOrStaff}
          />
        );
      case 'pengumuman':
        return (
          <PengumumanView 
            data={pengumuman} 
            onAdd={handleAddPengumuman}
            onEdit={handleEditPengumuman}
            onDelete={handleDeletePengumuman}
            isAdminOrStaff={isAdminOrStaff}
          />
        );
      case 'donasi':
        return (
          <DonasiView 
            data={donasi} 
            onAdd={handleAddDonasi}
            isAdminOrStaff={isAdminOrStaff}
            settings={settings}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            settings={settings} 
            onUpdateSettings={handleUpdateSettings} 
            user={googleUser}
            onUserChange={(u) => setGoogleUser(u)}
          />
        );
      default:
        return null;
    }
  };

  // Nav items helper
  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: <LayoutDashboard size={18} /> },
    { id: 'jemaat', label: 'Jemaat', icon: <Users size={18} /> },
    { id: 'acara', label: 'Acara', icon: <Calendar size={18} /> },
    { id: 'khotbah', label: 'Khotbah', icon: <Play size={18} /> },
    { id: 'doa', label: 'Doa', icon: <HeartHandshake size={18} /> },
    { id: 'pengumuman', label: 'Warta', icon: <Bell size={18} /> },
    { id: 'donasi', label: 'Kas/Donasi', icon: <CircleDollarSign size={18} /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings size={18} /> }
  ] as const;

  const allowedNavItems = React.useMemo(() => {
    if (appRole === 'Jemaat') {
      return navItems.filter(item => item.id !== 'jemaat' && item.id !== 'settings');
    }
    return navItems;
  }, [appRole]);

  const mobileNavItems = React.useMemo(() => {
    if (appRole === 'Jemaat') {
      return [
        { id: 'dashboard', label: 'Beranda', icon: <LayoutDashboard size={18} /> },
        { id: 'acara', label: 'Acara', icon: <Calendar size={18} /> },
        { id: 'khotbah', label: 'Khotbah', icon: <Play size={18} /> },
        { id: 'doa', label: 'Doa', icon: <HeartHandshake size={18} /> },
        { id: 'donasi', label: 'Kas/Donasi', icon: <CircleDollarSign size={18} /> }
      ];
    }
    return [
      { id: 'dashboard', label: 'Beranda', icon: <LayoutDashboard size={18} /> },
      { id: 'jemaat', label: 'Jemaat', icon: <Users size={18} /> },
      { id: 'acara', label: 'Acara', icon: <Calendar size={18} /> },
      { id: 'doa', label: 'Doa', icon: <HeartHandshake size={18} /> },
      { id: 'settings', label: 'Lainnya', icon: <Settings size={18} /> }
    ];
  }, [appRole]);

  if (!appUser) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-200">
        {/* Brand visual banner side */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#1A237E] to-indigo-900 text-white flex flex-col justify-between p-8 sm:p-12 relative overflow-hidden" id="login-portal-banner">
          {/* Decorative glows */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl" />
          
          <div className="flex items-center gap-3.5 z-10">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="w-12 h-12 object-cover rounded-2xl shadow-md border border-white/10 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 bg-[#FFB300] rounded-2xl flex items-center justify-center font-black text-[#1A237E] text-2xl shadow-md shrink-0">
                {settings.logoText || 'R'}
              </div>
            )}
            <div>
              <h2 className="font-extrabold text-base tracking-tight leading-tight uppercase">{settings.churchName || 'GBI ROCK Juanda'}</h2>
              <span className="text-[10px] text-indigo-200 font-bold block tracking-wider uppercase">Portal Jemaat & Pelayan</span>
            </div>
          </div>

          <div className="my-12 sm:my-0 z-10 space-y-4">
            <span className="bg-amber-500/20 text-[#FFC107] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              Selamat Datang
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight whitespace-pre-line">
              {settings.loginTitle || "Satu Portal untuk \nSeluruh Jemaat \n& Pelayan GBI."}
            </h1>
            <p className="text-sm text-indigo-100/80 leading-relaxed max-w-md whitespace-pre-line">
              {settings.loginSubtitle || "Akses informasi ibadah raya, video khotbah, warta jemaat terbaru, daftar doa, pendaftaran RSVP acara, dan kas/donasi secara aman dan mudah."}
            </p>
          </div>

          <div className="text-[11px] text-indigo-300/60 font-semibold z-10" id="login-copyright">
            &copy; {new Date().getFullYear()} App. tn.timbu. Hak cipta dilindungi.
          </div>
        </div>

        {/* Form login side */}
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 md:p-16 bg-white dark:bg-slate-900 transition-all" id="login-portal-form">
          <div className="max-w-md w-full mx-auto space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Portal Log In</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Silakan pilih peran login Anda untuk melanjutkan.</p>
            </div>

            {/* Role Tab Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setLoginRole('Jemaat')}
                className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  loginRole === 'Jemaat'
                    ? 'bg-white dark:bg-slate-900 text-[#1A237E] dark:text-indigo-400 shadow-md scale-100'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                👥 Jemaat (Member)
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('Staff/Admin')}
                className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  loginRole === 'Staff/Admin'
                    ? 'bg-white dark:bg-slate-900 text-[#1A237E] dark:text-indigo-400 shadow-md scale-100'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                💼 Pelayan (Admin/Staff)
              </button>
            </div>

            <form onSubmit={handleAppLogin} className="space-y-5">
              {loginRole === 'Jemaat' ? (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1.5">Username Jemaat *</label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Contoh: budi"
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all font-mono"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1.5">Email Staff / Admin *</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@gbirockjuanda.org"
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                    required
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Sandi / Password *</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline hover:text-[#1A237E] dark:hover:text-amber-400 uppercase tracking-wider transition-colors"
                  >
                    Lupa Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#1A237E] hover:bg-indigo-800 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-4"
              >
                <LogIn size={14} /> Masuk ke Dashboard
              </button>
            </form>

            {/* Forgot Password Modal Info */}
            {showForgotPasswordModal && (
              <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full border border-slate-100 dark:border-slate-700/80 shadow-2xl space-y-4 animate-scale-up">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-[#1A237E] dark:text-[#FFB300] rounded-xl">
                        <HelpCircle size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Lupa Kata Sandi?</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Pemulihan Akun {loginRole}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowForgotPasswordModal(false)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 whitespace-pre-line">
                      {settings.forgotPasswordInfo || "Untuk keamanan akun Anda, pemulihan atau reset kata sandi (password) diproses secara manual oleh tim IT atau Sekretariat GBI. Silakan hubungi admin gereja melalui tombol WhatsApp di bawah ini."}
                    </p>

                    <div className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2.5 rounded-xl font-bold flex items-center gap-1.5 border border-amber-500/15">
                      <ShieldAlert size={14} className="shrink-0" />
                      <span>Sebutkan Username/Email saat menghubungi admin.</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {settings.forgotPasswordContact && (
                      <a
                        href={`https://wa.me/${(() => {
                          let cleaned = settings.forgotPasswordContact.replace(/[^0-9]/g, '');
                          if (cleaned.startsWith('0')) {
                            cleaned = '62' + cleaned.substring(1);
                          }
                          return cleaned || '6285743221132';
                        })()}?text=Shalom%20Admin%20${encodeURIComponent(settings.churchName || 'GBI')}%2C%20saya%20jemaat%2Fpelayan%20ingin%20meminta%20bantuan%20reset%20kata%20sandi%20akun%20saya.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md uppercase tracking-wider"
                      >
                        <MessageSquare size={14} />
                        Hubungi Admin (WhatsApp)
                      </a>
                    )}
                    <button
                      onClick={() => setShowForgotPasswordModal(false)}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
        <InstallPrompt logoText={settings.logoText || 'R'} logoUrl={settings.logoUrl} churchName={settings.churchName || 'GBI ROCK Juanda'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-slate-950 flex transition-colors duration-200">
      
      {/* 1. Sidebar Navigation (Visible on Tablet/Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none transition-transform duration-300 lg:translate-x-0 lg:static lg:flex-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} id="app-sidebar">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="w-10 h-10 object-cover rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 bg-[#FFB300] rounded-xl flex items-center justify-center font-black text-[#1A237E] text-xl shadow-sm shrink-0">
                  {settings.logoText || 'R'}
                </div>
              )}
              <div className="overflow-hidden">
                <h2 className="font-extrabold text-sm text-[#1A237E] dark:text-white tracking-tight truncate w-36 uppercase leading-tight">{settings.churchName || 'GBI ROCK Juanda'}</h2>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block tracking-wider uppercase">Church CMS</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Nav list */}
          <nav className="p-4 space-y-1">
            {allowedNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const hasUnreadNotifs = item.id === 'pengumuman' && notifications.some(n => !n.read);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-indigo-950/40 text-[#1A237E] dark:text-indigo-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition-all relative ${
                    isActive ? 'bg-[#1A237E] dark:bg-indigo-400 scale-120 shadow-[0_0_4px_#1A237E]' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <span className={`${isActive ? 'text-[#1A237E] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} relative`}>
                    {React.cloneElement(item.icon as React.ReactElement, { size: 14 })}
                    {hasUnreadNotifs && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 border border-white dark:border-slate-900 rounded-full animate-pulse" />
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (User session details) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 space-y-3">
          {appUser ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FFB300] text-[#1A237E] flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {appUser.nama.substring(0, 2)}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{appUser.nama}</h4>
                  <span className="text-[9px] bg-blue-100 dark:bg-blue-950/50 text-[#1A237E] dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-bold uppercase">{appUser.peran}</span>
                </div>
              </div>
              <button 
                onClick={handleAppLogout}
                className="w-full py-1.5 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/20 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
              >
                <LogOut size={11} /> Keluar Sesi
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="w-full py-2.5 bg-[#FFB300] hover:bg-[#FFA000] text-[#1A237E] text-xs font-black rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <LogIn size={13} /> Login Staff / Admin
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0" id="main-content-layout">
        
        {/* 2. Header Dashboard */}
        <header className="sticky top-0 z-30 bg-[#1A237E] text-white border-b border-[#283593] p-4 flex items-center justify-between shadow-md" id="app-header">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-indigo-200 p-1.5 hover:bg-[#283593] rounded-xl"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="w-9 h-9 object-cover rounded-lg flex lg:hidden items-center justify-center shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 bg-[#FFB300] rounded-lg flex lg:hidden items-center justify-center font-bold text-[#1A237E] text-lg shrink-0">
                  {settings.logoText || 'R'}
                </div>
              )}
              <div>
                <h1 className="text-sm sm:text-base font-black uppercase tracking-tight leading-tight">
                  {settings.churchName || 'GBI ROCK Juanda'}
                </h1>
                <p className="text-[9px] text-indigo-200 uppercase tracking-widest font-semibold">Church Management System</p>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            
            {/* Syncing indicator */}
            {settings.spreadsheetId && (
              <button 
                onClick={() => loadDatabaseFromSheets()}
                disabled={isLoading}
                className={`p-2 rounded-xl text-indigo-100 hover:bg-[#283593] flex items-center gap-1 text-[10px] font-bold transition-all ${
                  syncStatus === 'syncing' ? 'bg-[#283593]' : ''
                }`}
                title="Sync Google Sheets"
              >
                <RefreshCw size={14} className={syncStatus === 'syncing' || isLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">
                  {syncStatus === 'syncing' ? 'Menyinkronkan...' : syncStatus === 'success' ? 'Sukses!' : 'Muat Sheets'}
                </span>
              </button>
            )}

            {/* Notification Bell Icon with dynamic red dot */}
            <button 
              onClick={() => setIsNotifCenterOpen(true)}
              className="p-2 text-indigo-100 hover:bg-[#283593] rounded-xl transition-all relative"
              title="Pusat Notifikasi"
              id="header-notif-bell"
            >
              <Bell size={15} className={notifications.some(n => !n.read) ? 'animate-swing text-amber-300' : ''} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border border-[#1A237E] rounded-full animate-ping-slow shadow-md" />
              )}
            </button>

            {/* Dark Mode toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-indigo-100 hover:bg-[#283593] rounded-xl transition-all"
              title="Ganti Tema"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* App Login button (Mobile header only) */}
            <div className="lg:hidden">
              {appUser ? (
                <button 
                  onClick={handleAppLogout}
                  className="p-2 bg-red-600/20 text-red-300 rounded-xl"
                  title="Keluar Sesi Staff"
                >
                  <LogOut size={15} />
                </button>
              ) : (
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="p-2 bg-[#FFB300] text-[#1A237E] rounded-xl font-bold"
                  title="Login Staff"
                >
                  <LogIn size={15} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* View container */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto pb-24 lg:pb-6">
          {renderView()}
        </main>

        {/* 3. Bottom Navigation bar (Only visible on Phone viewport) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 flex justify-around items-center py-2.5 px-3 lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.03)]" id="mobile-bottom-nav">
          {mobileNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'text-indigo-700 dark:text-indigo-400 font-extrabold scale-105' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 4. Staff/Admin Role Login Popup Modal Overlay */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="login-modal">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-700/50">
            <div className="bg-indigo-950 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-500" />
                <h2 className="font-bold text-sm">Sesi Staff / Administrator</h2>
              </div>
              <button onClick={() => setIsLoginOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAppLogin} className="p-5 space-y-4">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Silakan login untuk mengaktifkan izin edit (tambah, edit, hapus data). Menggunakan kredensial dari tabel <span className="font-bold text-indigo-700 dark:text-indigo-400">Admin</span>.
              </p>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email Karyawan/Staff *</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@gbirockjuanda.org"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sandi / Password *</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>



              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsLoginOpen(false)}
                  className="flex-1 py-2.5 border border-slate-100 dark:border-slate-700/50 font-bold text-xs text-slate-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1"
                >
                  <LogIn size={12} /> Masuk Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <InstallPrompt logoText={settings.logoText || 'R'} logoUrl={settings.logoUrl} churchName={settings.churchName || 'GBI ROCK Juanda'} />
    </div>
  );
}
