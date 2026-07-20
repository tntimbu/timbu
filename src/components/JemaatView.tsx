import React, { useState, useMemo } from 'react';
import { Jemaat } from '../types';
import { Search, UserPlus, FileDown, Edit2, Trash2, Phone, MapPin, Check, X, ShieldAlert } from 'lucide-react';

interface JemaatViewProps {
  data: Jemaat[];
  onAdd: (item: Jemaat) => Promise<void>;
  onEdit: (index: number, item: Jemaat) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  isAdminOrStaff: boolean;
}

export default function JemaatView({
  data,
  onAdd,
  onEdit,
  onDelete,
  isAdminOrStaff
}: JemaatViewProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua');
  const [groupFilter, setGroupFilter] = useState('Semua');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Jemaat>({
    nama: '',
    kontak: '',
    alamat: '',
    statusKeanggotaan: 'Jemaat Tetap',
    tanggalBaptis: '-',
    tanggalBergabung: new Date().toISOString().split('T')[0],
    kelompokKecil: 'COOL ROCK Juanda 1',
    peran: 'Jemaat',
    username: '',
    password: ''
  });

  // Filters setup
  const uniqueRoles = useMemo(() => ['Semua', ...Array.from(new Set(data.map(j => j.peran)))], [data]);
  const uniqueGroups = useMemo(() => ['Semua', ...Array.from(new Set(data.map(j => j.kelompokKecil)))], [data]);

  const filteredData = useMemo(() => {
    return data.filter(j => {
      const matchSearch = j.nama.toLowerCase().includes(search.toLowerCase()) || 
                          j.alamat.toLowerCase().includes(search.toLowerCase()) ||
                          j.kontak.includes(search);
      const matchRole = roleFilter === 'Semua' || j.peran === roleFilter;
      const matchGroup = groupFilter === 'Semua' || j.kelompokKecil === groupFilter;
      return matchSearch && matchRole && matchGroup;
    });
  }, [data, search, roleFilter, groupFilter]);

  // Actions
  const handleExportCSV = () => {
    const headers = ['Nama', 'Kontak', 'Alamat', 'Status Keanggotaan', 'Tanggal Baptis', 'Tanggal Bergabung', 'Kelompok Kecil', 'Peran', 'Username', 'Password'];
    const rows = filteredData.map(j => [
      j.nama,
      j.kontak,
      j.alamat,
      j.statusKeanggotaan,
      j.tanggalBaptis,
      j.tanggalBergabung,
      j.kelompokKecil,
      j.peran,
      j.username || '',
      j.password || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Jemaat_GBI_ROCK_Juanda_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEdit = (index: number, item: Jemaat) => {
    setEditingIndex(index);
    setFormData({
      username: '',
      password: '',
      ...item
    });
    setIsAddOpen(true);
  };

  const openAdd = () => {
    setEditingIndex(null);
    setFormData({
      nama: '',
      kontak: '',
      alamat: '',
      statusKeanggotaan: 'Jemaat Tetap',
      tanggalBaptis: '-',
      tanggalBergabung: new Date().toISOString().split('T')[0],
      kelompokKecil: 'COOL ROCK Juanda 1',
      peran: 'Jemaat',
      username: '',
      password: ''
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.kontak) {
      alert('Nama dan Kontak wajib diisi!');
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
      alert(`Gagal menyimpan data: ${err.message || err}`);
    }
  };

  const handleDelete = async (index: number, nama: string) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus data jemaat "${nama}"?`);
    if (confirmed) {
      try {
        await onDelete(index);
      } catch (err: any) {
        alert(`Gagal menghapus jemaat: ${err.message || err}`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="jemaat-view-container">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="jemaat-controls">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-[#1A237E] dark:text-white">Daftar Jemaat</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total: {filteredData.length} jiwa terfilter</p>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-50 dark:bg-indigo-950/40 text-[#1A237E] dark:text-indigo-400 hover:bg-blue-100/50 dark:hover:bg-indigo-900/30 font-bold text-xs rounded-xl uppercase tracking-wider transition-all"
            id="btn-export-csv"
          >
            <FileDown size={14} /> Ekspor CSV
          </button>
          {isAdminOrStaff && (
            <button 
              onClick={openAdd}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1A237E] hover:bg-[#283593] text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-sm transition-all"
              id="btn-tambah-jemaat"
            >
              <UserPlus size={14} /> Tambah Jemaat
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4" id="jemaat-filter-bar">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari nama, alamat, atau no HP..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Peran Pelayanan</label>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {uniqueRoles.map((role, idx) => (
                <option key={idx} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kelompok Kecil (COOL)</label>
            <select 
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {uniqueGroups.map((group, idx) => (
                <option key={idx} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jemaat Card List (Mobile-friendly) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="jemaat-grid-list">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 text-slate-400 text-xs shadow-sm font-medium">
            Tidak ada data jemaat ditemukan.
          </div>
        ) : (
          filteredData.map((j, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 border-l-4 border-l-[#1A237E] dark:border-l-l-indigo-400 shadow-sm relative hover:shadow-md transition-all flex flex-col justify-between" id={`jemaat-card-${idx}`}>
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-1.5 uppercase tracking-tight">
                      {j.nama}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{j.statusKeanggotaan}</span>
                  </div>
                  <span className="bg-blue-50 dark:bg-indigo-950/40 text-[#1A237E] dark:text-indigo-400 font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {j.peran}
                  </span>
                </div>

                <div className="space-y-2 border-t border-slate-50 dark:border-slate-800 pt-3 text-xs">
                  <a href={`tel:${j.kontak}`} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-700 font-medium">
                    <Phone size={12} className="text-slate-400" />
                    <span>{j.kontak}</span>
                  </a>
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 font-medium">
                    <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{j.alamat}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    COOL: <span className="text-amber-500">{j.kelompokKecil}</span>
                  </span>
                  {isAdminOrStaff && j.username && (
                    <span className="text-[10px] text-slate-500 font-mono mt-1 bg-slate-50 dark:bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                      Akses: <span className="font-extrabold text-[#1A237E] dark:text-indigo-400">{j.username}</span> | <span>{j.password}</span>
                    </span>
                  )}
                </div>
                
                {isAdminOrStaff ? (
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => openEdit(idx, j)}
                      className="p-1.5 text-slate-500 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-all"
                      title="Edit Jemaat"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(idx, j.nama)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-all"
                      title="Hapus Jemaat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Popup Form Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="jemaat-modal">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-700/50">
            <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
              <h2 className="font-bold text-sm">
                {editingIndex !== null ? '✏️ Edit Data Jemaat' : '👥 Tambah Jemaat Baru'}
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Lengkap *</label>
                <input 
                  type="text" 
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nomor Kontak / WA *</label>
                <input 
                  type="tel" 
                  value={formData.kontak}
                  onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Alamat Domisili</label>
                <textarea 
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Tulis alamat rumah lengkap..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status Anggota</label>
                  <select 
                    value={formData.statusKeanggotaan}
                    onChange={(e) => setFormData({ ...formData, statusKeanggotaan: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                  >
                    <option value="Jemaat Tetap">Jemaat Tetap</option>
                    <option value="Jemaat Baru">Jemaat Baru</option>
                    <option value="Simpatisan">Simpatisan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Peran Pelayanan</label>
                  <select 
                    value={formData.peran}
                    onChange={(e) => setFormData({ ...formData, peran: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                  >
                    <option value="Jemaat">Jemaat</option>
                    <option value="Staff">Staff</option>
                    <option value="Pengerja">Pengerja</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tanggal Baptis</label>
                  <input 
                    type="text" 
                    value={formData.tanggalBaptis}
                    onChange={(e) => setFormData({ ...formData, tanggalBaptis: e.target.value })}
                    placeholder="YYYY-MM-DD atau -"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tanggal Bergabung</label>
                  <input 
                    type="date" 
                    value={formData.tanggalBergabung}
                    onChange={(e) => setFormData({ ...formData, tanggalBergabung: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kelompok Kecil (COOL)</label>
                <input 
                  type="text" 
                  value={formData.kelompokKecil}
                  onChange={(e) => setFormData({ ...formData, kelompokKecil: e.target.value })}
                  placeholder="Contoh: COOL ROCK Juanda 1"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-700/50 pt-3">
                <div>
                  <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase block mb-1">Username Login Jemaat</label>
                  <input 
                    type="text" 
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Contoh: budi"
                    className="w-full p-2.5 bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase block mb-1">Password Login Jemaat</label>
                  <input 
                    type="text" 
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Contoh: budi123"
                    className="w-full p-2.5 bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
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
                  <Check size={14} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
