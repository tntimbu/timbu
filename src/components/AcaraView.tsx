import React, { useState, useMemo } from 'react';
import { Acara, AdminUser, RsvpRecord } from '../types';
import { Calendar as CalendarIcon, MapPin, Users, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface AcaraViewProps {
  data: Acara[];
  rsvps: RsvpRecord[];
  appUser: AdminUser | null;
  onAdd: (item: Acara) => Promise<void>;
  onEdit: (index: number, item: Acara) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  onRSVP: (index: number) => Promise<void>;
  isAdminOrStaff: boolean;
}

export default function AcaraView({
  data,
  rsvps,
  appUser,
  onAdd,
  onEdit,
  onDelete,
  onRSVP,
  isAdminOrStaff
}: AcaraViewProps) {
  const [filter, setFilter] = useState<'Semua' | 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai'>('Semua');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // RSVP registration helper
  const isUserRegistered = (eventTitle: string, eventDate: string) => {
    if (!appUser) return false;
    return rsvps.some(r => 
      r.judulAcara === eventTitle && 
      r.tanggalAcara === eventDate && 
      (r.emailOrUsername.toLowerCase() === (appUser.email || '').toLowerCase() || 
       r.namaJemaat.toLowerCase() === appUser.nama.toLowerCase())
    );
  };

  const [formData, setFormData] = useState<Acara>({
    judulAcara: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: '09:00 WIB',
    lokasi: 'Main Hall GBI ROCK Juanda',
    kapasitas: 100,
    terdaftar: 0,
    status: 'Akan Datang'
  });

  const filteredData = useMemo(() => {
    return data.filter(a => filter === 'Semua' || a.status === filter);
  }, [data, filter]);

  const openAdd = () => {
    setEditingIndex(null);
    setFormData({
      judulAcara: '',
      tanggal: new Date().toISOString().split('T')[0],
      waktu: '09:00 WIB',
      lokasi: 'Main Hall GBI ROCK Juanda',
      kapasitas: 100,
      terdaftar: 0,
      status: 'Akan Datang'
    });
    setIsAddOpen(true);
  };

  const openEdit = (index: number, item: Acara) => {
    setEditingIndex(index);
    setFormData({ ...item });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judulAcara || !formData.tanggal || !formData.waktu || !formData.lokasi) {
      alert('Semua bidang bertanda bintang wajib diisi!');
      return;
    }

    try {
      if (editingIndex !== null) {
        await onEdit(editingIndex, formData);
      } else {
        await onAdd(formData);
      }
      setIsAddOpen(false);
    } catch (err: any) {
      alert(`Gagal menyimpan acara: ${err.message || err}`);
    }
  };

  const handleDelete = async (index: number, title: string) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus acara "${title}"?`);
    if (confirmed) {
      try {
        await onDelete(index);
      } catch (err: any) {
        alert(`Gagal menghapus acara: ${err.message || err}`);
      }
    }
  };

  const handleRSVPSubmit = async (index: number, item: Acara) => {
    const isRegistered = isUserRegistered(item.judulAcara, item.tanggal);
    if (isRegistered) {
      alert('Anda sudah terdaftar untuk acara ini!');
      return;
    }

    if (item.terdaftar >= item.kapasitas) {
      alert('Maaf, kapasitas acara ini sudah penuh!');
      return;
    }

    const confirmed = window.confirm(`Apakah Anda ingin mendaftar (RSVP) untuk acara "${item.judulAcara}"?`);
    if (confirmed) {
      try {
        await onRSVP(index);
        alert('RSVP Berhasil! Nama Anda telah terdaftar.');
      } catch (err: any) {
        alert(`Gagal mendaftar: ${err.message || err}`);
      }
    }
  };

  // Group events by day in the calendar representation
  const calendarEvents = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    return sorted.slice(0, 5); // next 5 upcoming days
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in" id="acara-view-container">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="acara-header">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-[#1A237E] dark:text-white">Jadwal & Acara</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ikuti ibadah dan kegiatan pelayanan terkini</p>
        </div>
        {isAdminOrStaff && (
          <button 
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1A237E] hover:bg-[#283593] text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-sm transition-all"
            id="btn-tambah-acara"
          >
            <Plus size={14} /> Tambah Acara
          </button>
        )}
      </div>

      {/* Mini Calendar Widgets (Agenda View) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="agenda-section">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#1A237E] dark:text-indigo-300 mb-4 flex items-center gap-1.5">
          <CalendarIcon size={16} className="text-[#FFB300]" /> Agenda Mendatang
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin" id="agenda-scroller">
          {calendarEvents.length === 0 ? (
            <div className="text-center py-4 text-slate-400 text-xs w-full">Belum ada agenda terdaftar.</div>
          ) : (
            calendarEvents.map((a, idx) => {
              const [year, month, day] = a.tanggal.split('-');
              const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
              const monthName = dateObj.toLocaleDateString('id-ID', { month: 'short' });
              return (
                <div key={idx} className="flex-none w-32 bg-slate-50/70 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1 hover:border-amber-400 transition-colors">
                  <span className="text-[9px] uppercase font-black text-slate-400">{monthName}</span>
                  <span className="block text-2xl font-black text-[#1A237E] dark:text-indigo-400 leading-none">{day}</span>
                  <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full pt-1 uppercase tracking-tight">{a.judulAcara}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Status Filter Tab */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl self-start" id="acara-filters">
        {(['Semua', 'Akan Datang', 'Sedang Berlangsung', 'Selesai'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all ${
              filter === tab 
                ? 'bg-[#1A237E] text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Event Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="acara-grid">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 text-slate-400 text-xs font-medium">
            Tidak ada kegiatan dalam kategori ini.
          </div>
        ) : (
          filteredData.map((a, idx) => {
            const indexInRawData = data.findIndex(item => item.judulAcara === a.judulAcara && item.tanggal === a.tanggal);
            const isRegistered = isUserRegistered(a.judulAcara, a.tanggal);
            const isFull = a.terdaftar >= a.kapasitas;

            return (
              <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 border-l-4 border-l-[#1A237E] dark:border-l-l-indigo-400 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all animate-fade-in" id={`event-card-${idx}`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      a.status === 'Akan Datang' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : a.status === 'Sedang Berlangsung'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {a.status}
                    </span>
                    
                    {isAdminOrStaff && (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => openEdit(indexInRawData, a)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(indexInRawData, a.judulAcara)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug uppercase tracking-tight">{a.judulAcara}</h3>
                    <p className="text-[#1A237E] dark:text-indigo-400 font-extrabold text-xs mt-1">
                      {a.tanggal.split('-').reverse().join('/')} @ {a.waktu}
                    </p>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-50 dark:border-slate-850 pt-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span>{a.lokasi}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-slate-400 shrink-0" />
                      <span>Kapasitas: <span className="font-bold">{a.terdaftar} / {a.kapasitas}</span> terdaftar</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-50 dark:border-slate-800/80">
                  {a.status === 'Akan Datang' ? (
                    <button
                      onClick={() => handleRSVPSubmit(indexInRawData, a)}
                      disabled={isRegistered || isFull}
                      className={`w-full font-black text-xs py-2.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        isRegistered 
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 cursor-default'
                          : isFull
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-[#1A237E] hover:bg-[#283593] text-white shadow-sm hover:shadow'
                      }`}
                    >
                      {isRegistered ? (
                        <>Terdaftar <CheckCircle2 size={14} /></>
                      ) : isFull ? (
                        <>Kapasitas Penuh <AlertTriangle size={14} /></>
                      ) : (
                        <>Konfirmasi Hadir (RSVP)</>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 justify-center text-xs text-slate-400 py-2">
                      <Clock size={12} />
                      <span>Acara {a.status.toLowerCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin view: RSVP registrations list */}
      {isAdminOrStaff && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4 mt-8" id="admin-rsvp-panel">
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight text-[#1A237E] dark:text-white flex items-center gap-2">
              <Users size={16} className="text-[#FFB300]" />
              Data Konfirmasi Hadir & RSVP Jemaat
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Daftar jemaat yang telah melakukan konfirmasi hadir untuk kegiatan gereja.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-700/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700/60 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Nama Jemaat</th>
                  <th className="p-3.5">Email / Username</th>
                  <th className="p-3.5">Nama Acara</th>
                  <th className="p-3.5">Tanggal Acara</th>
                  <th className="p-3.5 pr-5">Waktu Konfirmasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30 text-slate-700 dark:text-slate-300 font-medium">
                {rsvps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold">
                      Belum ada jemaat yang mendaftar atau melakukan RSVP.
                    </td>
                  </tr>
                ) : (
                  [...rsvps].reverse().map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all">
                      <td className="p-3.5 pl-5 font-bold text-slate-800 dark:text-white">{r.namaJemaat}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{r.emailOrUsername}</td>
                      <td className="p-3.5 text-indigo-900 dark:text-indigo-400 font-extrabold uppercase text-[11px] tracking-tight">{r.judulAcara}</td>
                      <td className="p-3.5">{r.tanggalAcara.split('-').reverse().join('/')}</td>
                      <td className="p-3.5 pr-5 font-mono text-[11px] text-slate-500">{r.waktuKonfirmasi}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="acara-modal">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700/50">
            <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
              <h2 className="font-bold text-sm">
                {editingIndex !== null ? '✏️ Edit Acara' : '📅 Tambah Acara Baru'}
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama / Judul Acara *</label>
                <input 
                  type="text" 
                  value={formData.judulAcara}
                  onChange={(e) => setFormData({ ...formData, judulAcara: e.target.value })}
                  placeholder="Contoh: Ibadah Raya Minggu GBI"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tanggal Acara *</label>
                  <input 
                    type="date" 
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Waktu / Jam *</label>
                  <input 
                    type="text" 
                    value={formData.waktu}
                    onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                    placeholder="Contoh: 09:00 WIB"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Lokasi Pelaksanaan *</label>
                <input 
                  type="text" 
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  placeholder="Contoh: Main Hall Lt. 1"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kapasitas Maksimal</label>
                  <input 
                    type="number" 
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({ ...formData, kapasitas: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status Acara</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                  >
                    <option value="Akan Datang">Akan Datang</option>
                    <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 border border-slate-100 dark:border-slate-700/50 font-bold text-xs text-slate-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal placeholder so code builds if close button is imported
function X({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
