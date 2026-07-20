export interface Jemaat {
  id?: string; // row index or local ID
  nama: string;
  kontak: string;
  alamat: string;
  statusKeanggotaan: string; // Jemaat Baru, Jemaat Tetap, Simpatisan
  tanggalBaptis: string;
  tanggalBergabung: string;
  kelompokKecil: string; // COOL / Cell Group
  peran: string; // Jemaat, Diaken, Pengerja, Pendeta
  username?: string;
  password?: string;
}

export interface Acara {
  id?: string;
  judulAcara: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  kapasitas: number;
  terdaftar: number; // count of RSVP
  status: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';
}

export interface Khotbah {
  id?: string;
  judul: string;
  pembicara: string;
  tanggal: string;
  topik: string;
  ayatAlkitab: string;
  linkYouTube: string;
  catatan: string;
}

export interface Doa {
  id?: string;
  namaPengirim: string;
  permohonan: string;
  kategori: string; // Keluarga, Kesehatan, Pekerjaan, Keuangan, Lainnya
  tanggal: string;
  status: 'Dikirim' | 'Didoakan' | 'Terjawab';
  countDidoakan?: number; // local or stored count of "Saya Sudah Mendoakan"
}

export interface Pengumuman {
  id?: string;
  judul: string;
  isi: string;
  kategori: string; // Umum, Ibadah, Pemuda, Anak-Anak, COOL
  tanggalMulai: string;
  tanggalBerakhir: string;
}

export interface Donasi {
  id?: string;
  namaDonatur: string;
  jumlah: number;
  tanggal: string;
  keterangan: string; // Persepuluhan, Persembahan Umum, Pembangunan, Misi, Diakonia
  metode: string; // Transfer Bank, QRIS, Tunai, Kartu Kredit
}

export interface AdminUser {
  email: string;
  password?: string;
  peran: 'Admin' | 'Staff' | 'Jemaat';
  nama: string;
}

export interface RsvpRecord {
  namaJemaat: string;
  emailOrUsername: string;
  judulAcara: string;
  tanggalAcara: string;
  waktuKonfirmasi: string;
}

export interface Foto {
  id?: string;
  judul: string;
  deskripsi: string;
  urlGambar: string;
  tanggalUploaded: string;
}

export interface AppSettings {
  churchName: string;
  spreadsheetId: string;
  apiKey: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  logoText?: string;
  logoUrl?: string;
  donationQrisUrl?: string;
  donationQrisAn?: string;
  donationBank1Name?: string;
  donationBank1No?: string;
  donationBank1An?: string;
  donationBank2Name?: string;
  donationBank2No?: string;
  donationBank2An?: string;
  loginTitle?: string;
  loginSubtitle?: string;
  forgotPasswordInfo?: string;
  forgotPasswordContact?: string;
}

export type ActiveTab = 'dashboard' | 'jemaat' | 'acara' | 'khotbah' | 'doa' | 'pengumuman' | 'donasi' | 'settings';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'acara' | 'khotbah' | 'doa' | 'pengumuman' | 'jemaat' | 'galeri' | 'settings' | 'info';
  read: boolean;
}

