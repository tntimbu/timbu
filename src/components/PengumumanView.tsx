import React, { useState, useMemo } from 'react';
import { Pengumuman } from '../types';
import { Megaphone, Calendar, Tag, Plus, Edit2, Trash2, X, Info } from 'lucide-react';

interface PengumumanViewProps {
  data: Pengumuman[];
  onAdd: (item: Pengumuman) => Promise<void>;
  onEdit: (index: number, item: Pengumuman) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  isAdminOrStaff: boolean;
}

export default function PengumumanView({
  data,
  onAdd,
  onEdit,
  onDelete,
  isAdminOrStaff
}: PengumumanViewProps) {
  const [category, setCategory] = useState<'Semua' | 'Umum' | 'Ibadah' | 'Pemuda' | 'COOL'>('Semua');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<Pengumuman>({
    judul: '',
    isi: '',
    kategori: 'Umum',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalBerakhir: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days later
  });

  const filteredData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return data.filter(p => {
      const matchCategory = category === 'Semua' || p.kategori === category;
      
      // For general users, hide expired announcements. Admins can see everything
      const isExpired = p.tanggalBerakhir && p.tanggalBerakhir < today;
      const matchValidity = isAdminOrStaff || !isExpired;

      return matchCategory && matchValidity;
    });
  }, [data, category, isAdminOrStaff]);

  const openAdd = () => {
    setEditingIndex(null);
    setFormData({
      judul: '',
      isi: '',
      kategori: 'Umum',
      tanggalMulai: new Date().toISOString().split('T')[0],
      tanggalBerakhir: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setIsAddOpen(true);
  };

  const openEdit = (index: number, item: Pengumuman) => {
    setEditingIndex(index);
    setFormData({ ...item });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.isi) {
      alert('Judul dan isi pengumuman wajib diisi!');
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
      alert(`Gagal menyimpan pengumuman: ${err.message || err}`);
    }
  };

  const handleDelete = async (index: number, title: string) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus pengumuman "${title}"?`);
    if (confirmed) {
      try {
        await onDelete(index);
      } catch (err: any) {
        alert(`Gagal menghapus pengumuman: ${err.message || err}`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="pengumuman-view-container">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="pengumuman-header">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-[#1A237E] dark:text-white">Warta & Pengumuman</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Informasi resmi seputar kegiatan pelayanan jemaat</p>
        </div>
        {isAdminOrStaff && (
          <button 
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1A237E] hover:bg-[#283593] text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-sm transition-all"
            id="btn-tambah-pengumuman"
          >
            <Plus size={14} /> Tulis Warta
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl self-start overflow-x-auto scrollbar-none" id="pengumuman-categories">
        {(['Semua', 'Umum', 'Ibadah', 'Pemuda', 'COOL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setCategory(tab)}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              category === tab 
                ? 'bg-[#1A237E] text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Announcements List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="pengumuman-grid">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 text-slate-400 text-xs shadow-sm font-medium">
            Tidak ada pengumuman dalam kategori ini.
          </div>
        ) : (
          filteredData.map((p, idx) => {
            const indexInRaw = data.findIndex(item => item.judul === p.judul && item.isi === p.isi);
            const today = new Date().toISOString().split('T')[0];
            const isExpired = p.tanggalBerakhir && p.tanggalBerakhir < today;

            return (
              <div 
                key={idx} 
                className={`bg-white dark:bg-slate-800 p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between border-l-4 border-l-[#1A237E] dark:border-l-indigo-400 ${
                  isExpired ? 'border-dashed border-rose-300 dark:border-rose-900/40 opacity-70' : 'border-slate-100 dark:border-slate-700/50'
                }`}
                id={`pengumuman-card-${idx}`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Tag size={10} /> {p.kategori}
                    </span>
                    {isExpired && (
                      <span className="text-[9px] bg-rose-50 dark:bg-rose-950 text-rose-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Kadaluwarsa
                      </span>
                    )}
                    {isAdminOrStaff && (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => openEdit(indexInRaw, p)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDelete(indexInRaw, p.judul)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug flex items-start gap-2 uppercase tracking-tight">
                      <Megaphone size={16} className="text-[#1A237E] dark:text-indigo-400 mt-0.5 shrink-0" />
                      {p.judul}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs mt-2 leading-relaxed whitespace-pre-line font-medium">
                      {p.isi}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 text-[10px] text-slate-400 border-t border-slate-50 dark:border-slate-850 pt-3 mt-4 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Info size={11} className="text-amber-500" /> Berlaku: {p.tanggalMulai ? p.tanggalMulai.split('-').reverse().join('/') : '-'} s/d {p.tanggalBerakhir ? p.tanggalBerakhir.split('-').reverse().join('/') : '-'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="pengumuman-modal">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700/50">
            <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
              <h2 className="font-bold text-sm">
                {editingIndex !== null ? '✏️ Edit Pengumuman' : '📢 Tambah Pengumuman Baru'}
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Judul Warta *</label>
                <input 
                  type="text" 
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Contoh: Baptisan Air Kudus Juli 2026"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kategori Pengumuman</label>
                <select 
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                >
                  <option value="Umum">Umum</option>
                  <option value="Ibadah">Ibadah / Perayaan</option>
                  <option value="Pemuda">Pemuda / Youth</option>
                  <option value="COOL">COOL (Kelompok Sel)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tanggal Mulai *</label>
                  <input 
                    type="date" 
                    value={formData.tanggalMulai}
                    onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tanggal Selesai *</label>
                  <input 
                    type="date" 
                    value={formData.tanggalBerakhir}
                    onChange={(e) => setFormData({ ...formData, tanggalBerakhir: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Isi Pengumuman / Detail Warta *</label>
                <textarea 
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  placeholder="Tuliskan detail pengumuman gereja secara lengkap..."
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
