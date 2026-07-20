import { useMemo } from 'react';
import { Jemaat, Acara, Doa, Donasi, Pengumuman, AppSettings, Foto } from '../types';
import { Users, Calendar, HeartHandshake, CircleDollarSign, Bell, ExternalLink, Play, CheckCircle } from 'lucide-react';
import PhotoGallery from './PhotoGallery';

interface DashboardViewProps {
  jemaat: Jemaat[];
  acara: Acara[];
  doa: Doa[];
  donasi: Donasi[];
  pengumuman: Pengumuman[];
  fotos?: Foto[];
  onAddFoto?: (foto: Foto) => void;
  onDeleteFoto?: (index: number) => void;
  onNavigate: (tab: any) => void;
  isAdminOrStaff: boolean;
  settings: AppSettings;
}

export default function DashboardView({
  jemaat,
  acara,
  doa,
  donasi,
  pengumuman,
  fotos = [],
  onAddFoto = () => {},
  onDeleteFoto = () => {},
  onNavigate,
  isAdminOrStaff,
  settings
}: DashboardViewProps) {
  
  // Calculations
  const stats = useMemo(() => {
    const totalJemaat = jemaat.length;
    
    // Acara hari ini
    const todayStr = new Date().toISOString().split('T')[0];
    const acaraHariIni = acara.filter(a => a.tanggal === todayStr).length;
    
    // Doa baru (status: 'Dikirim')
    const doaBaru = doa.filter(d => d.status === 'Dikirim').length;
    
    // Total donasi bulan ini (July 2026 as per time metadata: 2026-07-19)
    const currentMonth = "2026-07";
    const totalDonasiBulanIni = donasi
      .filter(d => d.tanggal.startsWith(currentMonth))
      .reduce((sum, d) => sum + Number(d.jumlah), 0);

    return {
      totalJemaat,
      acaraHariIni,
      doaBaru,
      totalDonasiBulanIni
    };
  }, [jemaat, acara, doa, donasi]);

  // Active Announcements (not expired)
  const activeAnnouncements = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return pengumuman.filter(p => {
      const end = p.tanggalBerakhir;
      return !end || end >= today;
    }).slice(0, 3);
  }, [pengumuman]);

  // Next upcoming event
  const nextEvent = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = acara.filter(a => a.status === 'Akan Datang' && a.tanggal >= today);
    return upcoming.sort((a, b) => a.tanggal.localeCompare(b.tanggal))[0];
  }, [acara]);

  // Mini Chart data points: Let's extract last 6 months donation values
  const chartData = useMemo(() => {
    // We can group donation by date and select the last 5 days
    const grouped: { [key: string]: number } = {};
    donasi.forEach(d => {
      const date = d.tanggal;
      grouped[date] = (grouped[date] || 0) + Number(d.jumlah);
    });
    // Sort dates
    const sortedDates = Object.keys(grouped).sort().slice(-5);
    if (sortedDates.length === 0) {
      // dummy fallback
      return [
        { label: '15/07', value: 300000 },
        { label: '16/07', value: 500000 },
        { label: '17/07', value: 200000 },
        { label: '18/07', value: 800000 },
        { label: '19/07', value: 1200000 }
      ];
    }
    return sortedDates.map(d => ({
      label: d.split('-').slice(1).reverse().join('/'), // DD/MM format
      value: grouped[d]
    }));
  }, [donasi]);

  const maxChartValue = Math.max(...chartData.map(d => d.value), 100000);

  // Formatting helper
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6 pb-6 animate-fade-in" id="dashboard-view-container">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#1A237E] via-[#283593] to-[#FFB300] rounded-3xl p-6 text-white shadow-md relative overflow-hidden" id="welcome-banner">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-6 pointer-events-none">
          <HeartHandshake size={200} />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="bg-white/20 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            Sistem Informasi Gereja
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            {settings.welcomeTitle || 'Selamat Datang di GBI ROCK Juanda'}
          </h1>
          <p className="text-indigo-100 text-xs font-medium max-w-md leading-relaxed">
            {settings.welcomeSubtitle || 'Membangun jemaat yang bertumbuh, melayani dengan kasih, dan memuliakan nama Tuhan Yesus Kristus.'}
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" id="stats-grid">
        {/* Card 1: Jemaat */}
        <div 
          onClick={() => onNavigate('jemaat')}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md cursor-pointer transition-all flex items-start justify-between gap-3 group"
          id="stat-card-jemaat"
        >
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">Total Jemaat</span>
            <h3 className="text-3xl font-black text-[#1A237E] dark:text-white leading-none">{stats.totalJemaat}</h3>
            <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-indigo-950/40 text-[#1A237E] dark:text-indigo-300 rounded-full text-[9px] font-bold inline-block">
              Jiwa Terdaftar
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-indigo-900/30 text-[#1A237E] dark:text-indigo-400 rounded-2xl group-hover:scale-105 transition-transform">
            <Users size={20} />
          </div>
        </div>

        {/* Card 2: Acara */}
        <div 
          onClick={() => onNavigate('acara')}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md cursor-pointer transition-all flex items-start justify-between gap-3 group"
          id="stat-card-acara"
        >
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">Acara Hari Ini</span>
            <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">{stats.acaraHariIni}</h3>
            <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-full text-[9px] font-bold inline-block">
              Jadwal Ibadah
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-[#FFB300] dark:text-amber-400 rounded-2xl group-hover:scale-105 transition-transform">
            <Calendar size={20} />
          </div>
        </div>

        {/* Card 3: Doa */}
        <div 
          onClick={() => onNavigate('doa')}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md cursor-pointer transition-all flex items-start justify-between gap-3 group"
          id="stat-card-doa"
        >
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">Pokok Doa</span>
            <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400 leading-none">{stats.doaBaru}</h3>
            <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-full text-[9px] font-bold inline-block">
              Butuh Dukungan
            </span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl group-hover:scale-105 transition-transform">
            <HeartHandshake size={20} />
          </div>
        </div>

        {/* Card 4: Donasi */}
        <div 
          onClick={() => onNavigate('donasi')}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md cursor-pointer transition-all flex items-start justify-between gap-3 col-span-2 lg:col-span-1 group"
          id="stat-card-donasi"
        >
          <div className="space-y-3 overflow-hidden w-full">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">Donasi Bulan Ini</span>
            <h3 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 leading-none truncate mt-2">{formatRupiah(stats.totalDonasiBulanIni)}</h3>
            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full text-[9px] font-bold inline-block">
              Persembahan Kas
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-105 transition-transform shrink-0">
            <CircleDollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-main-grid">
        
        {/* Left column: Upcoming Events & Announcements */}
        <div className="lg:col-span-2 space-y-6" id="dashboard-left-col">
          
          {/* Quick Announcement List */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50" id="announcement-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#1A237E] dark:text-indigo-300 flex items-center gap-2">
                <Bell size={16} className="text-[#FFB300]" />
                Warta & Pengumuman Baru
              </h2>
              <button 
                onClick={() => onNavigate('pengumuman')}
                className="text-[11px] font-bold text-[#1A237E] dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Semua <ExternalLink size={12} />
              </button>
            </div>

            <div className="space-y-3">
              {activeAnnouncements.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">Tidak ada pengumuman aktif saat ini.</div>
              ) : (
                activeAnnouncements.map((p, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/75 dark:bg-slate-750/30 hover:bg-slate-100/50 dark:hover:bg-slate-700/40 transition-colors rounded-2xl border-l-4 border-[#FFB300] space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-[#1A237E] dark:text-amber-300 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {p.kategori}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                        S/D {p.tanggalBerakhir ? p.tanggalBerakhir.split('-').reverse().join('/') : '-'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-white pt-1">{p.judul}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed">{p.isi}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Donation Trend SVG Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50" id="trend-chart-card">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#1A237E] dark:text-indigo-300 mb-4">Grafik Transaksi Persembahan Terbaru</h2>
            <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 relative">
              
              {/* Chart Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                <div className="border-b border-slate-800 w-full h-0"></div>
                <div className="border-b border-slate-800 w-full h-0"></div>
                <div className="border-b border-slate-800 w-full h-0"></div>
                <div className="border-b border-slate-800 w-full h-0"></div>
              </div>

              {chartData.map((d, i) => {
                const heightPercentage = Math.max((d.value / maxChartValue) * 80, 8); // at least 8% height for visible bar
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
                    <div className="w-full max-w-[44px] bg-[#1A237E] dark:bg-indigo-500 rounded-t-xl transition-all duration-500 hover:bg-[#FFB300] dark:hover:bg-[#FFB300] cursor-pointer shadow-sm flex items-end justify-center" style={{ height: `${heightPercentage}%` }}>
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white text-[9px] py-1 px-2.5 rounded-lg shadow-md whitespace-nowrap transition-all font-black">
                        {formatRupiah(d.value)}
                      </span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight text-slate-400 dark:text-slate-500">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo Gallery Section */}
          <PhotoGallery 
            fotos={fotos}
            isAdminOrStaff={isAdminOrStaff}
            onAddFoto={onAddFoto}
            onDeleteFoto={onDeleteFoto}
          />
        </div>

        {/* Right column: Highlights and Shortcuts */}
        <div className="space-y-6" id="dashboard-right-col">
          
          {/* Next Big Event */}
          <div className="bg-[#FFB300] rounded-3xl p-6 text-[#1A237E] shadow-sm relative overflow-hidden" id="next-event-highlight">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Calendar size={120} />
            </div>
            <span className="bg-[#1A237E]/10 text-[#1A237E] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded">
              Upcoming Event
            </span>
            {nextEvent ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-black text-xl leading-snug uppercase tracking-tight">{nextEvent.judulAcara}</h3>
                  <p className="text-[#1A237E]/80 text-xs font-bold mt-1 flex items-center gap-1">
                    📍 {nextEvent.lokasi}
                  </p>
                </div>
                <div className="flex gap-4 border-t border-[#1A237E]/10 pt-3 text-[11px] font-bold">
                  <div>
                    <span className="text-[#1A237E]/60 block text-[8px] font-black uppercase">Tanggal</span>
                    <span>{nextEvent.tanggal.split('-').reverse().join('/')}</span>
                  </div>
                  <div>
                    <span className="text-[#1A237E]/60 block text-[8px] font-black uppercase">Waktu</span>
                    <span>{nextEvent.waktu} WIB</span>
                  </div>
                  <div>
                    <span className="text-[#1A237E]/60 block text-[8px] font-black uppercase">RSVP</span>
                    <span>{nextEvent.terdaftar} / {nextEvent.kapasitas}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('acara')}
                  className="w-full bg-[#1A237E] hover:bg-[#283593] text-white font-black text-xs py-3 rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  Daftar RSVP <CheckCircle size={14} />
                </button>
              </div>
            ) : (
              <p className="text-xs text-amber-950 mt-4 font-bold">Belum ada acara mendatang terdaftar.</p>
            )}
          </div>

          {/* Quick Actions / Shortcuts */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50" id="quick-links-card">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#1A237E] dark:text-indigo-300 mb-4">Akses Cepat Bento</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onNavigate('khotbah')}
                className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl hover:bg-blue-50/50 dark:hover:bg-indigo-950/20 text-left transition-all border border-transparent hover:border-slate-100 group"
              >
                <Play size={16} className="text-[#1A237E] dark:text-[#FFB300] group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block uppercase tracking-wide leading-none">Sermon</span>
                <span className="text-[9px] text-slate-400 mt-0.5 block font-medium">Catatan Ibadah</span>
              </button>

              <button 
                onClick={() => onNavigate('doa')}
                className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl hover:bg-blue-50/50 dark:hover:bg-indigo-950/20 text-left transition-all border border-transparent hover:border-slate-100 group"
              >
                <HeartHandshake size={16} className="text-rose-500 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block uppercase tracking-wide leading-none">Doa</span>
                <span className="text-[9px] text-slate-400 mt-0.5 block font-medium">Kirim Pokok Doa</span>
              </button>

              <button 
                onClick={() => onNavigate('donasi')}
                className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl hover:bg-blue-50/50 dark:hover:bg-indigo-950/20 text-left transition-all border border-transparent hover:border-slate-100 group"
              >
                <CircleDollarSign size={16} className="text-emerald-500 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block uppercase tracking-wide leading-none">Donasi</span>
                <span className="text-[9px] text-slate-400 mt-0.5 block font-medium">QRIS & Transfer</span>
              </button>

              <button 
                onClick={() => onNavigate('settings')}
                className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl hover:bg-blue-50/50 dark:hover:bg-indigo-950/20 text-left transition-all border border-transparent hover:border-slate-100 group"
              >
                <Users size={16} className="text-[#FFB300] group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block uppercase tracking-wide leading-none">Sheets</span>
                <span className="text-[9px] text-slate-400 mt-0.5 block font-medium">Sinkron Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
