import React, { useState, useMemo } from 'react';
import { Doa } from '../types';
import { Heart, Plus, Send, CheckCircle2, MessageSquare, Tag, Calendar, User, Trash2 } from 'lucide-react';

interface DoaViewProps {
  data: Doa[];
  onAdd: (item: Doa) => Promise<void>;
  onEdit: (index: number, item: Doa) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  isAdminOrStaff: boolean;
}

export default function DoaView({
  data,
  onAdd,
  onEdit,
  onDelete,
  isAdminOrStaff
}: DoaViewProps) {
  const [filter, setFilter] = useState<'Semua' | 'Dikirim' | 'Didoakan' | 'Terjawab'>('Semua');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Track local prayer support
  const [supportedPrayers, setSupportedPrayers] = useState<{ [key: number]: number }>({});
  const [isPrayedByMe, setIsPrayedByMe] = useState<{ [key: number]: boolean }>({});

  const [formData, setFormData] = useState<Doa>({
    namaPengirim: '',
    permohonan: '',
    kategori: 'Keluarga',
    tanggal: new Date().toISOString().split('T')[0],
    status: 'Dikirim'
  });

  const filteredData = useMemo(() => {
    return data.filter(d => filter === 'Semua' || d.status === filter);
  }, [data, filter]);

  const openAdd = () => {
    setFormData({
      namaPengirim: '',
      permohonan: '',
      kategori: 'Keluarga',
      tanggal: new Date().toISOString().split('T')[0],
      status: 'Dikirim'
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.permohonan) {
      alert('Isi permohonan doa wajib ditulis!');
      return;
    }

    try {
      const payload = {
        ...formData,
        namaPengirim: formData.namaPengirim.trim() || 'Anonim'
      };
      await onAdd(payload);
      setIsAddOpen(false);
      alert('Permohonan doa berhasil dikirim dan akan dimoderasi.');
    } catch (err: any) {
      alert(`Gagal mengirim doa: ${err.message || err}`);
    }
  };

  const handleSupportPrayer = (indexInRaw: number) => {
    if (isPrayedByMe[indexInRaw]) {
      return; // already supported
    }

    setIsPrayedByMe(prev => ({ ...prev, [indexInRaw]: true }));
    setSupportedPrayers(prev => ({
      ...prev,
      [indexInRaw]: (prev[indexInRaw] || 0) + 1
    }));
  };

  const handleUpdateStatus = async (indexInRaw: number, item: Doa, newStatus: 'Dikirim' | 'Didoakan' | 'Terjawab') => {
    try {
      const updated = { ...item, status: newStatus };
      await onEdit(indexInRaw, updated);
    } catch (err: any) {
      alert(`Gagal memperbarui status doa: ${err.message || err}`);
    }
  };

  const handleDelete = async (indexInRaw: number) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus permohonan doa ini?');
    if (confirmed) {
      try {
        await onDelete(indexInRaw);
      } catch (err: any) {
        alert(`Gagal menghapus doa: ${err.message || err}`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="doa-view-container">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="doa-header">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-[#1A237E] dark:text-white">Dukungan & Pokok Doa</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Saling mendoakan dan menopang dalam pergumulan hidup</p>
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1A237E] hover:bg-[#283593] text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-sm transition-all"
          id="btn-tambah-doa"
        >
          <Plus size={14} /> Kirim Doa
        </button>
      </div>

      {/* Filter Menu */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl self-start" id="doa-filters">
        {(['Semua', 'Dikirim', 'Didoakan', 'Terjawab'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all ${
              filter === tab 
                ? 'bg-[#1A237E] text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Prayer Feed Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="doa-grid">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 text-slate-400 text-xs shadow-sm font-medium">
            Tidak ada pokok doa dalam kategori ini.
          </div>
        ) : (
          filteredData.map((d, idx) => {
            const indexInRaw = data.findIndex(item => item.permohonan === d.permohonan && item.namaPengirim === d.namaPengirim);
            const extraPrayers = supportedPrayers[indexInRaw] || 0;
            const hasPrayed = isPrayedByMe[indexInRaw];

            return (
              <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 border-l-4 border-l-[#FFB300] shadow-sm flex flex-col justify-between hover:shadow-md transition-all animate-fade-in" id={`doa-card-${idx}`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {d.kategori}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      d.status === 'Dikirim'
                        ? 'bg-amber-50 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400'
                        : d.status === 'Didoakan'
                        ? 'bg-blue-50 dark:bg-indigo-950/45 text-[#1A237E] dark:text-indigo-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {d.status === 'Dikirim' ? 'Belum Didukung' : d.status === 'Didoakan' ? 'Sedang Didoakan' : 'Puji Tuhan! Terjawab'}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                    "{d.permohonan}"
                  </p>

                  <div className="flex gap-4 text-[10px] uppercase font-bold text-slate-400 border-t border-slate-50 dark:border-slate-850 pt-3">
                    <span className="flex items-center gap-1">
                      <User size={12} /> {d.namaPengirim}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {d.tanggal.split('-').reverse().join('/')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50 dark:border-slate-850">
                  <button
                    onClick={() => handleSupportPrayer(indexInRaw)}
                    className={`flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all ${
                      hasPrayed 
                        ? 'bg-rose-500/10 text-rose-500' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-rose-500 hover:bg-rose-50/50'
                    }`}
                  >
                    <Heart size={14} fill={hasPrayed ? "currentColor" : "none"} className={hasPrayed ? "animate-pulse" : ""} />
                    <span>{hasPrayed ? 'Sudah Mendoakan' : 'Dukung Doa'}</span>
                    <span className="text-[10px] opacity-60">({extraPrayers})</span>
                  </button>

                  {isAdminOrStaff && (
                    <div className="flex gap-1.5">
                      {d.status !== 'Didoakan' && d.status !== 'Terjawab' && (
                        <button
                          onClick={() => handleUpdateStatus(indexInRaw, d, 'Didoakan')}
                          className="text-[10px] uppercase tracking-wider bg-blue-50 dark:bg-indigo-950 text-[#1A237E] font-black px-2.5 py-1.5 rounded-lg hover:bg-indigo-100"
                        >
                          Moderasikan
                        </button>
                      )}
                      {d.status === 'Didoakan' && (
                        <button
                          onClick={() => handleUpdateStatus(indexInRaw, d, 'Terjawab')}
                          className="text-[10px] uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 font-black px-2.5 py-1.5 rounded-lg hover:bg-emerald-100"
                        >
                          Terjawab!
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(indexInRaw)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Hapus Doa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Prayer Form Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="doa-modal">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700/50">
            <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
              <h2 className="font-bold text-sm">🙏 Kirim Permohonan Doa</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Pengirim (Kosongkan jika Anonim)</label>
                <input 
                  type="text" 
                  value={formData.namaPengirim}
                  onChange={(e) => setFormData({ ...formData, namaPengirim: e.target.value })}
                  placeholder="Nama Anda atau Anonim"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kategori Doa</label>
                <select 
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                >
                  <option value="Keluarga">Keluarga</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Pekerjaan">Pekerjaan / Bisnis</option>
                  <option value="Keuangan">Keuangan</option>
                  <option value="Masa Depan">Masa Depan / Studi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Permohonan Doa / Pokok Doa *</label>
                <textarea 
                  value={formData.permohonan}
                  onChange={(e) => setFormData({ ...formData, permohonan: e.target.value })}
                  placeholder="Tuliskan pergumulan doa Anda secara ringkas dan sopan..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 h-28"
                  required
                />
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
                  <Send size={12} /> Kirim Doa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
