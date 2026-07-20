import React, { useState } from 'react';
import { Foto } from '../types';
import { Download, Plus, Trash2, X, Image as ImageIcon, ExternalLink, Calendar, PlusCircle } from 'lucide-react';

interface PhotoGalleryProps {
  fotos: Foto[];
  isAdminOrStaff: boolean;
  onAddFoto: (foto: Foto) => void;
  onDeleteFoto: (index: number) => void;
}

export default function PhotoGallery({
  fotos,
  isAdminOrStaff,
  onAddFoto,
  onDeleteFoto
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Foto | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form states
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [urlGambar, setUrlGambar] = useState('');

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback: open URL directly in a new window/tab to let user save image
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `${title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !urlGambar.trim()) {
      alert('Judul dan URL Gambar wajib diisi!');
      return;
    }

    const newFoto: Foto = {
      judul: judul.trim(),
      deskripsi: deskripsi.trim(),
      urlGambar: urlGambar.trim(),
      tanggalUploaded: new Date().toISOString().split('T')[0]
    };

    onAddFoto(newFoto);
    
    // Reset form
    setJudul('');
    setDeskripsi('');
    setUrlGambar('');
    setIsAdding(false);
    alert('Foto berhasil ditambahkan ke Galeri!');
  };

  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus foto ini dari galeri?')) {
      onDeleteFoto(index);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4" id="photo-gallery-section">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-[#1A237E] dark:text-[#FFB300] rounded-xl">
            <ImageIcon size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-[#1A237E] dark:text-indigo-300">
              Galeri Dokumentasi Jemaat
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Unduh foto kegiatan ibadah dan fellowship GBI
            </p>
          </div>
        </div>

        {isAdminOrStaff && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 bg-[#1A237E] dark:bg-indigo-600 hover:bg-[#283593] text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition-all uppercase tracking-wider"
            id="btn-add-photo"
          >
            {isAdding ? 'Batal' : 'Tambah Foto'}
            {!isAdding && <Plus size={14} />}
          </button>
        )}
      </div>

      {/* Add Photo Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 dark:bg-slate-750/30 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3 animate-slide-up" id="form-add-photo">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Tambah Foto Baru</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Judul Kegiatan *</label>
              <input
                type="text"
                placeholder="Contoh: Ibadah Kebangunan Rohani"
                value={judul}
                onChange={e => setJudul(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl focus:ring-1 focus:ring-indigo-500 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">URL Gambar *</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... atau link foto"
                value={urlGambar}
                onChange={e => setUrlGambar(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl focus:ring-1 focus:ring-indigo-500 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Deskripsi Singkat</label>
            <textarea
              placeholder="Jelaskan secara singkat momen di foto ini..."
              value={deskripsi}
              onChange={e => setDeskripsi(e.target.value)}
              rows={2}
              className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl focus:ring-1 focus:ring-indigo-500 dark:text-white"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-4 py-2 rounded-xl transition-all shadow-sm uppercase tracking-wider"
            >
              Simpan Foto
            </button>
          </div>
        </form>
      )}

      {/* Photos Grid */}
      {fotos.length === 0 ? (
        <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-750/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <ImageIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
          <p className="text-xs text-slate-400 font-medium">Belum ada foto yang diunggah ke galeri.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" id="gallery-grid">
          {fotos.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedPhoto(item)}
              className="group bg-slate-50 dark:bg-slate-750/20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/30 hover:border-indigo-100 dark:hover:border-indigo-900/50 shadow-sm hover:shadow transition-all cursor-pointer flex flex-col h-full relative"
            >
              {/* Image Container with aspect ratio */}
              <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={item.urlGambar}
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <span className="text-[10px] text-white font-medium truncate max-w-[80%]">Lihat detail</span>
                  <ExternalLink size={12} className="text-white shrink-0" />
                </div>

                {/* Admin Delete Button */}
                {isAdminOrStaff && (
                  <button
                    onClick={(e) => handleDelete(index, e)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                    title="Hapus foto"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Title & Date */}
              <div className="p-3 flex-1 flex flex-col justify-between gap-1">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-white line-clamp-1 group-hover:text-[#1A237E] dark:group-hover:text-indigo-300 transition-colors">
                    {item.judul}
                  </h4>
                  {item.deskripsi && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {item.deskripsi}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-700/50 mt-1">
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-0.5 shrink-0">
                    <Calendar size={10} />
                    {item.tanggalUploaded ? item.tanggalUploaded.split('-').reverse().join('/') : '-'}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item.urlGambar, item.judul);
                    }}
                    className="text-[#1A237E] dark:text-[#FFB300] hover:text-indigo-600 dark:hover:text-amber-400 p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-amber-950/20 transition-all flex items-center gap-0.5"
                    title="Unduh foto"
                  >
                    <Download size={12} />
                    <span className="text-[9px] font-black uppercase tracking-wider hidden sm:inline">Unduh</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Zoom Detail */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative border border-slate-100 dark:border-slate-700/80 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-colors z-20"
            >
              <X size={16} />
            </button>

            {/* Large Image */}
            <div className="bg-slate-100 dark:bg-slate-900 aspect-video w-full relative">
              <img
                src={selectedPhoto.urlGambar}
                alt={selectedPhoto.judul}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Info Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  <Calendar size={12} />
                  <span>Diuanggah pada {selectedPhoto.tanggalUploaded ? selectedPhoto.tanggalUploaded.split('-').reverse().join('/') : '-'}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {selectedPhoto.judul}
                </h3>
              </div>

              {selectedPhoto.deskripsi && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-750/40 p-3 rounded-2xl">
                  {selectedPhoto.deskripsi}
                </p>
              )}

              {/* Action row */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleDownload(selectedPhoto.urlGambar, selectedPhoto.judul)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1A237E] hover:bg-[#283593] text-white font-black text-xs py-3 rounded-xl transition-all shadow-md uppercase tracking-wider"
                >
                  <Download size={14} />
                  Unduh Foto Sekarang
                </button>
                <button
                  onClick={() => window.open(selectedPhoto.urlGambar, '_blank')}
                  className="px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  title="Buka Tab Baru"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">Buka Asli</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
