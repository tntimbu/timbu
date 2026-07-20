import React, { useState, useMemo } from 'react';
import { Khotbah } from '../types';
import { Play, Search, Plus, Edit2, Trash2, Calendar, BookOpen, Quote, ExternalLink, X } from 'lucide-react';

interface KhotbahViewProps {
  data: Khotbah[];
  onAdd: (item: Khotbah) => Promise<void>;
  onEdit: (index: number, item: Khotbah) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  isAdminOrStaff: boolean;
}

export default function KhotbahView({
  data,
  onAdd,
  onEdit,
  onDelete,
  isAdminOrStaff
}: KhotbahViewProps) {
  const [search, setSearch] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState('Semua');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedSermon, setSelectedSermon] = useState<Khotbah | null>(null);

  const [formData, setFormData] = useState<Khotbah>({
    judul: '',
    pembicara: '',
    tanggal: new Date().toISOString().split('T')[0],
    topik: '',
    ayatAlkitab: '',
    linkYouTube: '',
    catatan: ''
  });

  // Extract speaker list
  const uniqueSpeakers = useMemo(() => ['Semua', ...Array.from(new Set(data.map(k => k.pembicara)))], [data]);

  const filteredData = useMemo(() => {
    return data.filter(k => {
      const matchSearch = k.judul.toLowerCase().includes(search.toLowerCase()) ||
                          k.topik.toLowerCase().includes(search.toLowerCase()) ||
                          k.ayatAlkitab.toLowerCase().includes(search.toLowerCase());
      const matchSpeaker = speakerFilter === 'Semua' || k.pembicara === speakerFilter;
      return matchSearch && matchSpeaker;
    });
  }, [data, search, speakerFilter]);

  // Helper to get YouTube thumbnail
  const getYouTubeThumbnail = (url: string) => {
    try {
      let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
      }
    } catch (e) {}
    // fallback nice church illustration
    return "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=600&auto=format&fit=crop";
  };

  const getYouTubeId = (url: string) => {
    try {
      let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = url.match(regExp);
      if (match && match[2].length === 11) {
        return match[2];
      }
    } catch (e) {}
    return null;
  };

  const openAdd = () => {
    setEditingIndex(null);
    setFormData({
      judul: '',
      pembicara: '',
      tanggal: new Date().toISOString().split('T')[0],
      topik: '',
      ayatAlkitab: '',
      linkYouTube: '',
      catatan: ''
    });
    setIsAddOpen(true);
  };

  const openEdit = (index: number, item: Khotbah, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIndex(index);
    setFormData({ ...item });
    setIsAddOpen(true);
  };

  const handleDelete = async (index: number, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus arsip khotbah "${title}"?`);
    if (confirmed) {
      try {
        await onDelete(index);
        if (selectedSermon && selectedSermon.judul === title) {
          setSelectedSermon(null);
        }
      } catch (err: any) {
        alert(`Gagal menghapus khotbah: ${err.message || err}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.pembicara || !formData.linkYouTube) {
      alert('Judul, Pembicara, dan Link YouTube wajib diisi!');
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
      alert(`Gagal menyimpan khotbah: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="khotbah-view-container">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="khotbah-header">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-[#1A237E] dark:text-white">Perpustakaan Khotbah</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Putar ulang khotbah minggu dan catat firman Tuhan</p>
        </div>
        {isAdminOrStaff && (
          <button 
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1A237E] hover:bg-[#283593] text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-sm transition-all"
            id="btn-tambah-khotbah"
          >
            <Plus size={14} /> Tambah Khotbah
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row gap-4" id="khotbah-filters">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari judul, topik, atau ayat Alkitab..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
        </div>
        <div className="w-full sm:w-48">
          <select 
            value={speakerFilter}
            onChange={(e) => setSpeakerFilter(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            {uniqueSpeakers.map((speaker, idx) => (
              <option key={idx} value={speaker}>{speaker}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sermons Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="khotbah-content-layout">
        
        {/* Left Side: Playlist Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4" id="khotbah-grid">
          {filteredData.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 text-slate-400 text-xs shadow-sm font-medium">
              Tidak ada khotbah ditemukan.
            </div>
          ) : (
            filteredData.map((k, idx) => {
              const indexInRawData = data.findIndex(item => item.judul === k.judul && item.tanggal === k.tanggal);
              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedSermon(k)}
                  className={`bg-white dark:bg-slate-800 rounded-3xl border overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between ${
                    selectedSermon?.judul === k.judul 
                      ? 'border-[#1A237E] ring-2 ring-[#1A237E]/20' 
                      : 'border-slate-100 dark:border-slate-700/50'
                  }`}
                  id={`khotbah-card-${idx}`}
                >
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden group">
                    <img 
                      src={getYouTubeThumbnail(k.linkYouTube)} 
                      alt={k.judul}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-3 bg-[#1A237E] text-white rounded-full shadow-lg group-hover:bg-[#FFB300] group-hover:text-[#1A237E] transition-all">
                        <Play size={18} fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          {k.topik}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{k.tanggal.split('-').reverse().join('/')}</span>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-white line-clamp-2 leading-snug uppercase tracking-tight">{k.judul}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{k.pembicara}</p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800/80 mt-3">
                      <span className="text-[10px] font-black text-[#1A237E] dark:text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
                        <BookOpen size={10} /> {k.ayatAlkitab}
                      </span>
                      {isAdminOrStaff && (
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={(e) => openEdit(indexInRawData, k, e)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(indexInRawData, k.judul, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Detailed Reader / Video Player Panel */}
        <div className="md:col-span-1" id="khotbah-detail-panel">
          {selectedSermon ? (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4 sticky top-6" id="khotbah-detail-card">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] bg-blue-50 dark:bg-indigo-950/40 text-[#1A237E] dark:text-indigo-400 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Detail Khotbah
                  </span>
                  <h2 className="font-extrabold text-slate-800 dark:text-white text-base mt-3 uppercase tracking-tight leading-snug">{selectedSermon.judul}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">{selectedSermon.pembicara}</p>
                </div>
                <button 
                  onClick={() => setSelectedSermon(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              {getYouTubeId(selectedSermon.linkYouTube) ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedSermon.linkYouTube)}`} 
                    title={selectedSermon.judul}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
              ) : (
                <a 
                  href={selectedSermon.linkYouTube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block aspect-video rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center hover:bg-slate-950 transition-all"
                >
                  <Play size={32} className="text-amber-500 mb-2" fill="currentColor" />
                  <span className="text-xs font-bold block">Tonton di YouTube</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 justify-center">
                    Buka link eksternal <ExternalLink size={10} />
                  </span>
                </a>
              )}

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar size={12} />
                  <span>Tanggal Pelayanan: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedSermon.tanggal.split('-').reverse().join('/')}</span></span>
                </div>

                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-bold">
                    <BookOpen size={12} />
                    <span>Nats Alkitab:</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic font-serif">
                    "{selectedSermon.ayatAlkitab}"
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Ringkasan / Catatan Khotbah</span>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed max-h-[180px] overflow-y-auto">
                    {selectedSermon.catatan || 'Tidak ada catatan khotbah tersemat.'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/20 p-8 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-center py-16 text-slate-400 text-xs sticky top-6">
              <Quote size={28} className="mx-auto text-slate-300 mb-2" />
              Pilih salah satu khotbah di samping untuk melihat catatan firman, memutar video, dan merenungkan khotbah.
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Form Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="khotbah-modal">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700/50">
            <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
              <h2 className="font-bold text-sm">
                {editingIndex !== null ? '✏️ Edit Arsip Khotbah' : '📖 Tambah Arsip Khotbah'}
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Judul Khotbah *</label>
                <input 
                  type="text" 
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Contoh: Hidup yang Berkemenangan"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pembicara / Pengkhotbah *</label>
                  <input 
                    type="text" 
                    value={formData.pembicara}
                    onChange={(e) => setFormData({ ...formData, pembicara: e.target.value })}
                    placeholder="Contoh: Pdt. Stefanus"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tanggal *</label>
                  <input 
                    type="date" 
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Topik Utama</label>
                  <input 
                    type="text" 
                    value={formData.topik}
                    onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
                    placeholder="Contoh: Iman & Pengharapan"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ayat Alkitab / Nats</label>
                  <input 
                    type="text" 
                    value={formData.ayatAlkitab}
                    onChange={(e) => setFormData({ ...formData, ayatAlkitab: e.target.value })}
                    placeholder="Contoh: Efesus 6:10-18"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Link YouTube Video *</label>
                <input 
                  type="url" 
                  value={formData.linkYouTube}
                  onChange={(e) => setFormData({ ...formData, linkYouTube: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Catatan / Ringkasan Khotbah</label>
                <textarea 
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Tulis ringkasan khotbah atau poin penting firman di sini..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 h-28"
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
