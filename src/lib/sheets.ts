import { Jemaat, Acara, Khotbah, Doa, Pengumuman, Donasi, AdminUser, AppSettings, RsvpRecord, Foto } from '../types';
import { getAccessToken } from './firebase';

const SEED_JEMAAT: Jemaat[] = [
  { nama: "Budi Santoso", kontak: "081234567890", alamat: "Jl. Juanda No. 12, Sidoarjo", statusKeanggotaan: "Jemaat Tetap", tanggalBaptis: "2018-05-20", tanggalBergabung: "2018-01-10", kelompokKecil: "COOL ROCK Juanda 1", peran: "Jemaat", username: "budi", password: "budi123" },
  { nama: "Maria Wijaya", kontak: "082198765432", alamat: "Jl. Ahmad Yani, Sidoarjo", statusKeanggotaan: "Jemaat Tetap", tanggalBaptis: "2019-12-25", tanggalBergabung: "2019-11-01", kelompokKecil: "COOL Youth Juanda", peran: "Staff", username: "maria", password: "maria123" },
  { nama: "Hendra Wijaya", kontak: "085611223344", alamat: "Perumahan Juanda Asri, Sidoarjo", statusKeanggotaan: "Jemaat Baru", tanggalBaptis: "-", tanggalBergabung: "2026-06-15", kelompokKecil: "COOL ROCK Juanda 2", peran: "Jemaat", username: "hendra", password: "hendra123" },
  { nama: "Pdt. Stefanus", kontak: "081122334455", alamat: "Ruko Juanda No. 5, Sidoarjo", statusKeanggotaan: "Jemaat Tetap", tanggalBaptis: "2010-01-01", tanggalBergabung: "2010-01-01", kelompokKecil: "COOL Pemimpin", peran: "Admin", username: "stefanus", password: "stefanus123" }
];

const SEED_ACARA: Acara[] = [
  { judulAcara: "Ibadah Raya GBI ROCK Juanda", tanggal: "2026-07-26", waktu: "09:00 WIB", lokasi: "Main Hall Juanda", kapasitas: 200, terdaftar: 142, status: "Akan Datang" },
  { judulAcara: "Doa Fajar Bersama", tanggal: "2026-07-25", waktu: "05:00 WIB", lokasi: "Chapel Lt. 2", kapasitas: 50, terdaftar: 18, status: "Akan Datang" },
  { judulAcara: "COOL Youth Fellowship", tanggal: "2026-07-22", waktu: "19:00 WIB", lokasi: "Chapel Lt. 2", kapasitas: 40, terdaftar: 25, status: "Akan Datang" }
];

const SEED_KHOTBAH: Khotbah[] = [
  { judul: "Hidup yang Berkemenangan", pembicara: "Pdt. Stefanus", tanggal: "2026-07-12", topik: "Kemenangan & Iman", ayatAlkitab: "Efesus 6:10-18", linkYouTube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", catatan: "Catatan khotbah tentang perlengkapan senjata Allah untuk mengalahkan tipu muslihat iblis." },
  { judul: "Kuasa di Balik Penyerahan Diri", pembicara: "Pdt. Johny", tanggal: "2026-07-05", topik: "Berserah & Percaya", ayatAlkitab: "Amsal 3:5-6", linkYouTube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", catatan: "Berserah bukanlah menyerah, melainkan mempercayakan masa depan di tangan Tuhan yang tepat." }
];

const SEED_DOA: Doa[] = [
  { namaPengirim: "John Doe", permohonan: "Doakan kesembuhan Ibu Sarah yang sedang dirawat di RS karena DBD.", kategori: "Kesehatan", tanggal: "2026-07-18", status: "Dikirim" },
  { namaPengirim: "Maria", permohonan: "Bersyukur atas kelulusan anak saya dan mohon dukungan doa untuk pekerjaan barunya.", kategori: "Keluarga", tanggal: "2026-07-17", status: "Didoakan" },
  { namaPengirim: "Hendra", permohonan: "Mohon doa untuk kelancaran usaha toko yang sedang mengalami pasang surut.", kategori: "Pekerjaan", tanggal: "2026-07-15", status: "Terjawab" }
];

const SEED_PENGUMUMAN: Pengumuman[] = [
  { judul: "Baptisan Air Kudus Juli 2026", isi: "Baptisan air akan diadakan pada hari Minggu, 26 Juli 2026 pukul 12:00 WIB setelah Ibadah Raya. Silakan mendaftar ke Sekretariat Gereja.", kategori: "Ibadah", tanggalMulai: "2026-07-15", tanggalBerakhir: "2026-07-26" },
  { judul: "Kelas COOL Training #1", isi: "Kelas pelatihan untuk calon ketua kelompok sel (COOL) akan dimulai pada tanggal 1 Agustus 2026. Daftarkan diri Anda segera.", kategori: "Umum", tanggalMulai: "2026-07-18", tanggalBerakhir: "2026-08-01" }
];

const SEED_DONASI: Donasi[] = [
  { namaDonatur: "Anonim", jumlah: 500000, tanggal: "2026-07-18", keterangan: "Persembahan Umum", metode: "QRIS" },
  { namaDonatur: "Budi Santoso", jumlah: 1500000, tanggal: "2026-07-10", keterangan: "Persepuluhan", metode: "Transfer Bank" },
  { namaDonatur: "Maria Wijaya", jumlah: 300000, tanggal: "2026-07-12", keterangan: "Donasi Diakonia", metode: "Tunai" }
];

const SEED_ADMIN: AdminUser[] = [
  { email: "admin@gbirockjuanda.org", password: "admin123", peran: "Admin", nama: "Administrator GBI" },
  { email: "staff@gbirockjuanda.org", password: "staff123", peran: "Staff", nama: "Pelayan Jemaat" }
];

const SEED_RSVP: RsvpRecord[] = [
  { namaJemaat: "Budi Santoso", emailOrUsername: "budi", judulAcara: "Ibadah Raya GBI ROCK Juanda", tanggalAcara: "2026-07-26", waktuKonfirmasi: "20/07/2026, 09.00" },
  { namaJemaat: "Hendra Wijaya", emailOrUsername: "hendra", judulAcara: "COOL Youth Fellowship", tanggalAcara: "2026-07-22", waktuKonfirmasi: "20/07/2026, 10.15" }
];

const SEED_FOTO: Foto[] = [
  { judul: "Ibadah Raya Minggu", deskripsi: "Momen puji-pujian dan penyembahan bersama di ibadah raya.", urlGambar: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=600", tanggalUploaded: "2026-07-20" },
  { judul: "Pelayanan COOL Youth", deskripsi: "Kelompok pemuda bersekutu dengan sukacita dan antusias.", urlGambar: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600", tanggalUploaded: "2026-07-19" },
  { judul: "Doa Fajar Bersama", deskripsi: "Saat teduh pagi hari mendoakan jemaat, bangsa, dan gereja.", urlGambar: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&q=80&w=600", tanggalUploaded: "2026-07-18" }
];

// Helper to check and initialize localStorage values
const initLocalStore = () => {
  if (!localStorage.getItem('cms_jemaat')) localStorage.setItem('cms_jemaat', JSON.stringify(SEED_JEMAAT));
  if (!localStorage.getItem('cms_acara')) localStorage.setItem('cms_acara', JSON.stringify(SEED_ACARA));
  if (!localStorage.getItem('cms_khotbah')) localStorage.setItem('cms_khotbah', JSON.stringify(SEED_KHOTBAH));
  if (!localStorage.getItem('cms_doa')) localStorage.setItem('cms_doa', JSON.stringify(SEED_DOA));
  if (!localStorage.getItem('cms_pengumuman')) localStorage.setItem('cms_pengumuman', JSON.stringify(SEED_PENGUMUMAN));
  if (!localStorage.getItem('cms_donasi')) localStorage.setItem('cms_donasi', JSON.stringify(SEED_DONASI));
  if (!localStorage.getItem('cms_admin')) localStorage.setItem('cms_admin', JSON.stringify(SEED_ADMIN));
  if (!localStorage.getItem('cms_rsvp')) localStorage.setItem('cms_rsvp', JSON.stringify(SEED_RSVP));
  if (!localStorage.getItem('cms_foto')) localStorage.setItem('cms_foto', JSON.stringify(SEED_FOTO));
  if (!localStorage.getItem('cms_settings')) {
    const defaultSettings: AppSettings = {
      churchName: "GBI ROCK Juanda",
      spreadsheetId: "",
      apiKey: "",
      welcomeTitle: "Selamat Datang di GBI ROCK Juanda",
      welcomeSubtitle: "Membangun jemaat yang bertumbuh, melayani dengan kasih, dan memuliakan nama Tuhan Yesus Kristus.",
      logoText: "R",
      logoUrl: "https://images.unsplash.com/photo-1545624445-402945a677f2?auto=format&fit=crop&q=80&w=200",
      donationQrisAn: "A.N. Ferdinan Moses Timbu (GoPay)",
      donationQrisUrl: "",
      donationBank1Name: "BANK BCA",
      donationBank1No: "7355287572",
      donationBank1An: "A.N. GBI ROCK JUANDA",
      donationBank2Name: "BANK BRI",
      donationBank2No: "493001029465533",
      donationBank2An: "A.N. GBI ROCK JUANDA",
      loginTitle: "Satu Portal untuk Seluruh Jemaat & Pelayan GBI.",
      loginSubtitle: "Akses informasi ibadah raya, video khotbah, warta jemaat terbaru, daftar doa, pendaftaran RSVP acara, dan kas/donasi secara aman dan mudah.",
      forgotPasswordInfo: "Untuk keamanan akun Anda, pemulihan atau reset kata sandi (password) diproses secara manual oleh tim IT atau Sekretariat GBI. Silakan hubungi admin gereja melalui tombol WhatsApp di bawah ini.",
      forgotPasswordContact: "085743221132"
    };
    localStorage.setItem('cms_settings', JSON.stringify(defaultSettings));
  }
};

initLocalStore();

export const getLocalData = <T>(key: string): T[] => {
  const data = localStorage.getItem(`cms_${key}`);
  return data ? JSON.parse(data) : [];
};

export const saveLocalData = <T>(key: string, data: T[]) => {
  localStorage.setItem(`cms_${key}`, JSON.stringify(data));
};

export const getSettings = (): AppSettings => {
  const settings = localStorage.getItem('cms_settings');
  const defaults = {
    churchName: "GBI ROCK Juanda",
    spreadsheetId: "",
    apiKey: "",
    welcomeTitle: "Selamat Datang di GBI ROCK Juanda",
    welcomeSubtitle: "Membangun jemaat yang bertumbuh, melayani dengan kasih, dan memuliakan nama Tuhan Yesus Kristus.",
    logoText: "R",
    logoUrl: "https://images.unsplash.com/photo-1545624445-402945a677f2?auto=format&fit=crop&q=80&w=200",
    donationQrisAn: "A.N. Ferdinan Moses Timbu (GoPay)",
    donationQrisUrl: "",
    donationBank1Name: "BANK BCA",
    donationBank1No: "7355287572",
    donationBank1An: "A.N. GBI ROCK JUANDA",
    donationBank2Name: "BANK BRI",
    donationBank2No: "493001029465533",
    donationBank2An: "A.N. GBI ROCK JUANDA",
    loginTitle: "Satu Portal untuk Seluruh Jemaat & Pelayan GBI.",
    loginSubtitle: "Akses informasi ibadah raya, video khotbah, warta jemaat terbaru, daftar doa, pendaftaran RSVP acara, dan kas/donasi secara aman dan mudah.",
    forgotPasswordInfo: "Untuk keamanan akun Anda, pemulihan atau reset kata sandi (password) diproses secara manual oleh tim IT atau Sekretariat GBI. Silakan hubungi admin gereja melalui tombol WhatsApp di bawah ini.",
    forgotPasswordContact: "085743221132"
  };
  if (!settings) return defaults;
  try {
    const parsed = JSON.parse(settings);
    return { ...defaults, ...parsed };
  } catch (e) {
    return defaults;
  }
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem('cms_settings', JSON.stringify(settings));
};

// ---------------------- Google Sheets Integration ----------------------

// Fetch spreadsheet data using either OAuth Token or Public API Key
export const fetchFromSheets = async (sheetName: string, settings: AppSettings): Promise<any[][] | null> => {
  const { spreadsheetId, apiKey } = settings;
  if (!spreadsheetId) return null;

  try {
    const token = await getAccessToken();
    let url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z500`;
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (apiKey) {
      url += `?key=${apiKey}`;
    } else {
      // No credentials provided
      return null;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Error loading sheet ${sheetName} from Google Sheets:`, errText);
      throw new Error(`Sheets API responded with ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.values || [];
  } catch (error) {
    console.error(`Failed to fetch from sheet: ${sheetName}`, error);
    throw error;
  }
};

// Write data to Google Sheets
export const writeToSheets = async (sheetName: string, range: string, values: any[][], settings: AppSettings): Promise<boolean> => {
  const { spreadsheetId } = settings;
  if (!spreadsheetId) return false;

  const token = await getAccessToken();
  if (!token) {
    console.warn("Authorization token required to write to Google Sheets");
    return false;
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!${range}?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `${sheetName}!${range}`,
        majorDimension: 'ROWS',
        values: values
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Error writing to sheet ${sheetName}:`, errText);
      throw new Error(`Sheets API write error: ${errText}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to write to sheet: ${sheetName}`, error);
    throw error;
  }
};

// Append a single row to Google Sheets
export const appendToSheets = async (sheetName: string, range: string, row: any[], settings: AppSettings): Promise<boolean> => {
  const { spreadsheetId } = settings;
  if (!spreadsheetId) return false;

  const token = await getAccessToken();
  if (!token) {
    console.warn("Authorization token required to write to Google Sheets");
    return false;
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!${range}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `${sheetName}!${range}`,
        majorDimension: 'ROWS',
        values: [row]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Error appending to sheet ${sheetName}:`, errText);
      throw new Error(`Sheets API append error: ${errText}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to append to sheet: ${sheetName}`, error);
    throw error;
  }
};

// Create a new Google Spreadsheet and populate with all tables & seeds
export const createNewDatabaseSheet = async (title: string): Promise<string> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Anda harus masuk (Sign In) dengan Google terlebih dahulu untuk membuat Database Google Sheets.");
  }

  try {
    const sheetsToCreate = [
      { properties: { title: "Jemaat" } },
      { properties: { title: "Acara" } },
      { properties: { title: "Khotbah" } },
      { properties: { title: "Doa" } },
      { properties: { title: "Pengumuman" } },
      { properties: { title: "Donasi" } },
      { properties: { title: "Admin" } },
      { properties: { title: "RSVP" } },
      { properties: { title: "Galeri" } }
    ];

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: title
        },
        sheets: sheetsToCreate
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gagal membuat Google Sheets baru:", errText);
      throw new Error(`Sheets API creation error: ${errText}`);
    }

    const createdSheet = await res.json();
    const spreadsheetId = createdSheet.spreadsheetId;

    if (!spreadsheetId) {
      throw new Error("Gagal mengambil ID Google Sheet yang dibuat.");
    }

    // Seed data into the newly created sheet
    const settings: AppSettings = {
      churchName: "GBI ROCK Juanda",
      spreadsheetId: spreadsheetId,
      apiKey: ""
    };

    // Prepare batch update values
    const dataUpdates = [
      {
        range: "Jemaat!A1",
        values: [
          ["Nama", "Kontak", "Alamat", "Status Keanggotaan", "Tanggal Baptis", "Tanggal Bergabung", "Kelompok Kecil", "Peran", "Username", "Password"],
          ...SEED_JEMAAT.map(j => [j.nama, j.kontak, j.alamat, j.statusKeanggotaan, j.tanggalBaptis, j.tanggalBergabung, j.kelompokKecil, j.peran, j.username || "", j.password || ""])
        ]
      },
      {
        range: "Acara!A1",
        values: [
          ["Judul Acara", "Tanggal", "Waktu", "Lokasi", "Kapasitas", "Terdaftar", "Status"],
          ...SEED_ACARA.map(a => [a.judulAcara, a.tanggal, a.waktu, a.lokasi, a.kapasitas, a.terdaftar, a.status])
        ]
      },
      {
        range: "Khotbah!A1",
        values: [
          ["Judul", "Pembicara", "Tanggal", "Topik", "Ayat Alkitab", "Link YouTube", "Catatan"],
          ...SEED_KHOTBAH.map(k => [k.judul, k.pembicara, k.tanggal, k.topik, k.ayatAlkitab, k.linkYouTube, k.catatan])
        ]
      },
      {
        range: "Doa!A1",
        values: [
          ["Nama Pengirim", "Permohonan", "Kategori", "Tanggal", "Status"],
          ...SEED_DOA.map(d => [d.namaPengirim, d.permohonan, d.kategori, d.tanggal, d.status])
        ]
      },
      {
        range: "Pengumuman!A1",
        values: [
          ["Judul", "Isi", "Kategori", "Tanggal Mulai", "Tanggal Berakhir"],
          ...SEED_PENGUMUMAN.map(p => [p.judul, p.isi, p.kategori, p.tanggalMulai, p.tanggalBerakhir])
        ]
      },
      {
        range: "Donasi!A1",
        values: [
          ["Nama Donatur", "Jumlah", "Tanggal", "Keterangan", "Metode"],
          ...SEED_DONASI.map(d => [d.namaDonatur, d.jumlah, d.tanggal, d.keterangan, d.metode])
        ]
      },
      {
        range: "Admin!A1",
        values: [
          ["Email", "Password", "Peran", "Nama"],
          ...SEED_ADMIN.map(a => [a.email, a.password, a.peran, a.nama])
        ]
      },
      {
        range: "RSVP!A1",
        values: [
          ["Nama Jemaat", "Email / Username", "Judul Acara", "Tanggal Acara", "Waktu Konfirmasi"],
          ...SEED_RSVP.map(r => [r.namaJemaat, r.emailOrUsername, r.judulAcara, r.tanggalAcara, r.waktuKonfirmasi])
        ]
      },
      {
        range: "Galeri!A1",
        values: [
          ["Judul", "Deskripsi", "URL Gambar", "Tanggal Diunggah"],
          ...SEED_FOTO.map(f => [f.judul, f.deskripsi, f.urlGambar, f.tanggalUploaded])
        ]
      }
    ];

    // Push standard values via batch update
    const writeRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: dataUpdates
      })
    });

    if (!writeRes.ok) {
      console.warn("Gagal menanam data awal ke Google Sheet, tetapi spreadsheet berhasil dibuat. Anda dapat menyinkronkan data secara manual.", await writeRes.text());
    }

    return spreadsheetId;
  } catch (error) {
    console.error("Gagal dalam proses pembuatan database Google Sheet:", error);
    throw error;
  }
};

// ---------------------- Sync local to sheets ----------------------
export const syncLocalToSheets = async (settings: AppSettings): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token || !settings.spreadsheetId) return false;

  try {
    const jemaat = getLocalData<Jemaat>('jemaat');
    const acara = getLocalData<Acara>('acara');
    const khotbah = getLocalData<Khotbah>('khotbah');
    const doa = getLocalData<Doa>('doa');
    const pengumuman = getLocalData<Pengumuman>('pengumuman');
    const donasi = getLocalData<Donasi>('donasi');
    const admin = getLocalData<AdminUser>('admin');
    const rsvp = getLocalData<RsvpRecord>('rsvp');
    const foto = getLocalData<Foto>('foto');

    const dataUpdates = [
      {
        range: "Jemaat!A1:J1000",
        values: [
          ["Nama", "Kontak", "Alamat", "Status Keanggotaan", "Tanggal Baptis", "Tanggal Bergabung", "Kelompok Kecil", "Peran", "Username", "Password"],
          ...jemaat.map(j => [j.nama, j.kontak, j.alamat, j.statusKeanggotaan, j.tanggalBaptis, j.tanggalBergabung, j.kelompokKecil, j.peran, j.username || "", j.password || ""])
        ]
      },
      {
        range: "Acara!A1:G1000",
        values: [
          ["Judul Acara", "Tanggal", "Waktu", "Lokasi", "Kapasitas", "Terdaftar", "Status"],
          ...acara.map(a => [a.judulAcara, a.tanggal, a.waktu, a.lokasi, a.kapasitas, a.terdaftar, a.status])
        ]
      },
      {
        range: "Khotbah!A1:G1000",
        values: [
          ["Judul", "Pembicara", "Tanggal", "Topik", "Ayat Alkitab", "Link YouTube", "Catatan"],
          ...khotbah.map(k => [k.judul, k.pembicara, k.tanggal, k.topik, k.ayatAlkitab, k.linkYouTube, k.catatan])
        ]
      },
      {
        range: "Doa!A1:E1000",
        values: [
          ["Nama Pengirim", "Permohonan", "Kategori", "Tanggal", "Status"],
          ...doa.map(d => [d.namaPengirim, d.permohonan, d.kategori, d.tanggal, d.status])
        ]
      },
      {
        range: "Pengumuman!A1:E1000",
        values: [
          ["Judul", "Isi", "Kategori", "Tanggal Mulai", "Tanggal Berakhir"],
          ...pengumuman.map(p => [p.judul, p.isi, p.kategori, p.tanggalMulai, p.tanggalBerakhir])
        ]
      },
      {
        range: "Donasi!A1:E1000",
        values: [
          ["Nama Donatur", "Jumlah", "Tanggal", "Keterangan", "Metode"],
          ...donasi.map(d => [d.namaDonatur, d.jumlah, d.tanggal, d.keterangan, d.metode])
        ]
      },
      {
        range: "Admin!A1:D1000",
        values: [
          ["Email", "Password", "Peran", "Nama"],
          ...admin.map(a => [a.email, a.password, a.peran, a.nama])
        ]
      },
      {
        range: "RSVP!A1:E1000",
        values: [
          ["Nama Jemaat", "Email / Username", "Judul Acara", "Tanggal Acara", "Waktu Konfirmasi"],
          ...rsvp.map(r => [r.namaJemaat, r.emailOrUsername, r.judulAcara, r.tanggalAcara, r.waktuKonfirmasi])
        ]
      },
      {
        range: "Galeri!A1:D1000",
        values: [
          ["Judul", "Deskripsi", "URL Gambar", "Tanggal Diunggah"],
          ...foto.map(f => [f.judul, f.deskripsi, f.urlGambar, f.tanggalUploaded])
        ]
      }
    ];

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${settings.spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: dataUpdates
      })
    });

    return res.ok;
  } catch (error) {
    console.error("Gagal menyinkronkan data lokal ke Sheets:", error);
    return false;
  }
};
