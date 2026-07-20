import React, { useState, useMemo } from 'react';
import { Donasi, AppSettings } from '../types';
import { CircleDollarSign, Calendar, Landmark, CreditCard, Sparkles, Send, CheckCircle, Search, HelpCircle } from 'lucide-react';
import gopayQris from '../assets/images/gopay_qris_1784538928504.jpg';
 
interface DonasiViewProps {
  data: Donasi[];
  onAdd: (item: Donasi) => Promise<void>;
  isAdminOrStaff: boolean;
  settings: AppSettings;
}
 
export default function DonasiView({
  data,
  onAdd,
  isAdminOrStaff,
  settings
}: DonasiViewProps) {
  const [amount, setAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [category, setCategory] = useState<string>('Persembahan Umum');
  const [method, setMethod] = useState<string>('QRIS');
  const [searchLog, setSearchLog] = useState<string>('');
  
  // Successful transaction state
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [lastTxId, setLastTxId] = useState<string>('');

  const nominalPresets = [50000, 100000, 250000, 500000, 1000000];

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = Number(amount.replace(/[^0-9]/g, ''));
    if (!cleanAmount || cleanAmount <= 0) {
      alert('Masukkan jumlah donasi yang valid!');
      return;
    }

    try {
      const payload: Donasi = {
        namaDonatur: donorName.trim() || 'Anonim',
        jumlah: cleanAmount,
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: category,
        metode: method
      };

      await onAdd(payload);
      setLastTxId(Math.random().toString(36).substring(2, 9).toUpperCase());
      setIsSuccess(true);
      
      // Reset form
      setAmount('');
      setDonorName('');
    } catch (err: any) {
      alert(`Gagal memproses persembahan: ${err.message || err}`);
    }
  };

  // Group donations by category for summary metrics
  const categoryStats = useMemo(() => {
    const stats: { [key: string]: number } = {
      'Persembahan Umum': 0,
      'Persepuluhan': 0,
      'Pembangunan': 0,
      'Misi & Diakonia': 0
    };

    let total = 0;
    data.forEach(d => {
      const cat = d.keterangan === 'Donasi Diakonia' || d.keterangan === 'Misi' ? 'Misi & Diakonia' : d.keterangan;
      const key = stats[cat] !== undefined ? cat : 'Persembahan Umum';
      stats[key] += Number(d.jumlah);
      total += Number(d.jumlah);
    });

    return { stats, total };
  }, [data]);

  const filteredLogs = useMemo(() => {
    return data.filter(d => {
      return d.namaDonatur.toLowerCase().includes(searchLog.toLowerCase()) ||
             d.keterangan.toLowerCase().includes(searchLog.toLowerCase()) ||
             d.metode.toLowerCase().includes(searchLog.toLowerCase());
    }).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [data, searchLog]);

  return (
    <div className="space-y-6 pb-6 animate-fade-in" id="donasi-view-container">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="donasi-header">
        <h1 className="text-xl font-black uppercase tracking-tight text-[#1A237E] dark:text-white">Persembahan & Desentralisasi Kas</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Salurkan persepuluhan, persembahan umum, atau donasi pelayanan kas secara mandiri</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="donasi-main-grid">
        {/* Left 2 Cols: Form or Success */}
        <div className="lg:col-span-2 space-y-6" id="donasi-form-col">
          {isSuccess ? (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-md text-center space-y-4 animate-fade-in" id="success-donation-card">
              <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold uppercase tracking-tight text-slate-800 dark:text-white">Persembahan Diterima!</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Puji Tuhan, terima kasih atas kemurahan hati Anda.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl max-w-sm mx-auto text-left space-y-2 text-xs border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>No. Referensi:</span>
                  <span className="font-mono font-black text-slate-700 dark:text-slate-300">{lastTxId}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Kategori:</span>
                  <span className="font-black text-slate-700 dark:text-slate-300">{category}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Metode:</span>
                  <span className="font-black text-slate-700 dark:text-slate-300">{method}</span>
                </div>
              </div>

              <button 
                onClick={() => setIsSuccess(false)}
                className="px-6 py-3 bg-[#1A237E] hover:bg-[#283593] text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-sm transition-all"
              >
                Kirim Persembahan Lain
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="donation-card">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
                <CircleDollarSign size={16} className="text-[#FFB300]" /> Form Persembahan Kas
              </h2>

              <form onSubmit={handleDonate} className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Jumlah Persembahan (IDR) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Rp</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white font-black text-base outline-none focus:ring-2 focus:ring-[#1A237E]"
                      required
                      min={1000}
                    />
                  </div>
                </div>

                {/* Nominal Presets */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none animate-fade-in" id="nominal-presets">
                  {nominalPresets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="flex-none bg-slate-50 dark:bg-slate-900 hover:bg-[#1A237E] hover:text-white border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 transition-all"
                    >
                      {formatRupiah(val)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Nama Donatur (Kosongkan jika Anonim)</label>
                    <input 
                      type="text" 
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Nama Anda atau Hamba Allah"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-[#1A237E] font-medium"
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Keterangan / Alokasi Persembahan</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-[#1A237E] font-bold"
                    >
                      <option value="Persembahan Umum">Persembahan Umum</option>
                      <option value="Persepuluhan">Persepuluhan</option>
                      <option value="Pembangunan">Pembangunan Gedung</option>
                      <option value="Misi & Diakonia">Misi & Diakonia Sosial</option>
                    </select>
                  </div>
                </div>

                {/* Method Selection */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Metode Penyaluran</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'QRIS', icon: <CreditCard size={16} /> },
                      { name: 'Transfer Bank', icon: <Landmark size={16} /> },
                      { name: 'Tunai / Cash', icon: <CircleDollarSign size={16} /> }
                    ].map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setMethod(item.name)}
                        className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                          method === item.name
                            ? 'bg-[#1A237E] text-white border-[#1A237E] shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-800 border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        {item.icon}
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submission / Transfer Details */}
                {method === 'QRIS' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 animate-fade-in" id="qris-display">
                    {/* Real QRIS Code Image */}
                    <div className="bg-white p-2 rounded-2xl shadow-inner shrink-0 border border-slate-100 w-36 overflow-hidden flex flex-col items-center">
                      <img 
                        src={settings.donationQrisUrl || gopayQris} 
                        alt="QRIS Donasi" 
                        className="w-full h-auto object-contain rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-[8px] text-center font-black text-blue-800 tracking-wider mt-1.5 uppercase">QRIS CODE</div>
                    </div>
                    <div className="space-y-1.5 text-xs text-left w-full">
                      <h4 className="font-extrabold text-[#1A237E] dark:text-white uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={12} className="text-[#FFB300]" />
                        Pembayaran Digital QRIS
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Scan kode QRIS di atas melalui aplikasi GoPay, OVO, Dana, LinkAja, m-Banking Anda untuk menyelesaikan persembahan secara aman dan instan.
                      </p>
                      {settings.donationQrisAn && (
                        <span className="text-[10px] text-indigo-700 dark:text-[#FFB300] font-black tracking-wider uppercase block mt-1">
                          A.N. {settings.donationQrisAn}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {method === 'Transfer Bank' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs animate-fade-in" id="bank-display">
                    <h4 className="font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">Rekening Resmi {settings.churchName || 'GBI ROCK Juanda'}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {settings.donationBank1Name && (
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-750 border-l-4 border-l-[#1A237E]">
                          <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">{settings.donationBank1Name}</span>
                          <p className="font-black text-sm text-slate-800 dark:text-white mt-1">{settings.donationBank1No || '-'}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{settings.donationBank1An || '-'}</p>
                        </div>
                      )}
                      {settings.donationBank2Name && (
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-750 border-l-4 border-l-[#00529C]">
                          <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">{settings.donationBank2Name}</span>
                          <p className="font-black text-sm text-slate-800 dark:text-white mt-1">{settings.donationBank2No || '-'}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{settings.donationBank2An || '-'}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium italic">
                      * Silakan simpan bukti transfer Anda untuk verifikasi atau dokumentasi internal gereja.
                    </p>
                  </div>
                )}

                {method === 'Tunai / Cash' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1.5 animate-fade-in" id="cash-display">
                    <h4 className="font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">Penyerahan Tunai</h4>
                    <p className="font-medium">
                      Persembahan tunai dapat dimasukkan ke dalam amplop yang tersedia di bangku ibadah dan dimasukkan ke kotak persembahan saat Ibadah Raya berlangsung.
                    </p>
                    <p className="font-black text-[10px] uppercase text-[#1A237E] dark:text-indigo-400">
                      Form ini digunakan untuk mencatat persembahan secara manual ke kas digital.
                    </p>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-[#1A237E] hover:bg-[#283593] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} /> Konfirmasi Penyerahan Persembahan
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right 1 Col: Statistics and Logs */}
        <div className="space-y-6" id="donasi-stats-col">
          {/* Summary Chart card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm" id="donation-stats-card">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-3">Ikhtisar Kas Bulan Ini</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 border-l-4 border-l-[#1A237E]">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Total Penerimaan Kas</span>
                <span className="text-xl font-black text-[#1A237E] dark:text-indigo-400 block mt-1">
                  {formatRupiah(categoryStats.total)}
                </span>
              </div>

              {/* Categorized Progress Bars */}
              <div className="space-y-3.5 text-xs">
                {Object.entries(categoryStats.stats).map(([cat, val], idx) => {
                  const numVal = val as number;
                  const percentage = categoryStats.total > 0 ? (numVal / categoryStats.total) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                        <span className="tracking-tight">{cat}</span>
                        <span className="text-slate-800 dark:text-slate-100">{formatRupiah(numVal)}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#1A237E] dark:bg-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Logs Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col h-80" id="donation-logs-card">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-3">Riwayat Kas Masuk</h2>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input 
                type="text" 
                placeholder="Cari donatur / metode..." 
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-[10px] outline-none font-medium focus:ring-1 focus:ring-[#1A237E]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-none" id="donation-logs-list">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-[10px] font-medium font-sans">Belum ada riwayat tercatat.</div>
              ) : (
                filteredLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl flex justify-between items-center text-xs hover:bg-slate-100/50 transition-all border border-transparent hover:border-slate-100">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white uppercase text-[10px] tracking-tight">{log.namaDonatur}</h4>
                      <div className="flex gap-2 text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">
                        <span className="bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded text-[#1A237E] dark:text-indigo-400">{log.keterangan}</span>
                        <span className="flex items-center gap-0.5"><Calendar size={9} /> {log.tanggal.split('-').reverse().join('/')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 block">{formatRupiah(log.jumlah)}</span>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">{log.metode}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
