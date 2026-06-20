# SPESIFIKASI.md — VetCare Platform

## 1. RINGKASAN PRODUK

```
Nama       : VetCare Platform
Tujuan     : Sistem manajemen klinik hewan all-in-one — rekam medis, rawat inap,
             kasir (POS), inventory, laporan keuangan, booking online
Pengguna   : Owner (pemilik klinik), Dokter, Staff (kasir/admin), Customer (pemilik hewan)
Stack      : Next.js 14 + Supabase (DB+Auth+Storage) + Netlify
```

---

## 2. ROLE & HAK AKSES

| Modul | Owner | Dokter | Staff | Customer |
|---|---|---|---|---|
| Dashboard ringkasan | ✅ semua data | ✅ jadwal sendiri | ✅ POS & operasional | ✅ data hewan sendiri |
| Manajemen user | ✅ CRUD semua | ❌ | ❌ | ❌ |
| Data hewan (pets) | ✅ semua | ✅ lihat semua | ✅ CRUD | ✅ CRUD hewan sendiri |
| Appointment | ✅ semua | ✅ miliknya | ✅ CRUD semua | ✅ lihat sendiri (via booking) |
| Rekam medis | ✅ lihat semua | ✅ CRUD | ❌ | ✅ lihat (yang visible) |
| Rawat inap | ✅ lihat semua | ✅ CRUD + log | ✅ lihat + log | ✅ lihat (yang visible) |
| POS / Kasir | ✅ lihat laporan | ❌ | ✅ operasikan | ❌ |
| Inventory | ✅ CRUD | ❌ lihat saja | ✅ CRUD | ❌ |
| Pengeluaran | ✅ lihat semua | ❌ | ✅ CRUD | ❌ |
| Laporan keuangan | ✅ full akses | ❌ | ❌ | ❌ |
| Booking online | ✅ kelola | ❌ | ✅ kelola | ✅ buat booking |
| Pengaturan klinik | ✅ | ❌ | ❌ | ❌ |

Penegakan akses: **Row Level Security (RLS)** di Supabase per tabel (lihat BLUEPRINT.md §6), bukan pengecekan manual di tiap komponen.

---

## 3. MODUL & FITUR DETAIL

### 3.1 Autentikasi
```
- Register: email, password, nama lengkap → otomatis role "customer"
- Login: email + password (Supabase Auth)
- Role owner/dokter/staff dibuat manual oleh owner lewat menu Manajemen User
  (bukan self-register, supaya tidak sembarang orang jadi staff)
- Logout, lupa password (reset via email Supabase)
- Session disimpan via cookie httpOnly (otomatis oleh @supabase/ssr)
```

### 3.2 Manajemen User (Owner only)
```
- List semua user: nama, email, role, status aktif
- Tambah user baru (owner buat akun dokter/staff langsung)
- Edit role, nonaktifkan user (soft, is_active=false — bukan hapus)
- Detail user: riwayat aktivitas ringkas
```

### 3.3 Data Hewan (Pets)
```
Field: nama, spesies, ras, tanggal lahir, jenis kelamin, foto, pemilik
- Customer: kelola hewan miliknya sendiri
- Staff/Owner: kelola semua, bisa daftarkan hewan atas nama customer
- Riwayat vaksin per hewan (tabel terpisah / sub-section)
- Soft delete (is_active)
```

### 3.4 Appointment
```
Field: hewan, dokter, jadwal (tanggal+jam), status, keluhan
Status: menunggu → berlangsung → selesai | batal
- Staff buat appointment manual (datang langsung / telepon)
- Bisa auto-generate dari booking online yang dikonfirmasi
- Dokter lihat jadwal appointment miliknya per hari
```

### 3.5 Rekam Medis (Dokter)
```
Field: hewan, dokter, appointment terkait, diagnosis, treatment, resep, catatan,
       is_visible_customer (toggle)
- Dokter CRUD penuh
- Customer lihat read-only, TANPA detail dosis resep, hanya yang visible
- Riwayat per hewan ditampilkan kronologis
```

### 3.6 Rawat Inap (Inpatient)
```
Field utama: hewan, dokter penanggung jawab, no. kandang, tanggal masuk, status
Status: rawat → pulang
Log monitoring (banyak per inpatient): kondisi (stabil/perlu perhatian/kritis),
       catatan, foto (multi), is_visible_customer, waktu, dibuat oleh
- Dokter & staff bisa tambah log monitoring
- Customer lihat timeline log yang visible + foto (lightbox)
- Aksi "Pulangkan" → set discharged_at, wajib confirm dialog
```

### 3.7 POS / Kasir (Staff)
```
- Katalog: produk + layanan aktif, grid dengan kategori filter
- Cart: tambah item, ubah qty, hapus, lihat subtotal & total
- Pilih customer (opsional, untuk riwayat) via CustomerSearch
- Metode pembayaran: Tunai | QRIS
- Submit transaksi → simpan transactions + transaction_items (atomic),
  snapshot nama & harga item saat itu (harga produk boleh berubah nanti, riwayat tidak ikut berubah)
- Transaksi produk → otomatis kurangi stok + catat stock_mutations (tipe "keluar")
- Cetak struk (print CSS, max-width 80mm)
- Batal transaksi: wajib alasan, kembalikan stok (stock_mutations tipe penyesuaian balik)
```

### 3.8 Inventory
```
TAB PRODUK:
- CRUD produk: nama, kategori, harga, stok, stok minimum, status aktif
- Indikator stok menipis (stok < minimum → highlight merah)
- Aksi: Tambah Stok Masuk (manual), Adjustment Stok (koreksi + alasan wajib), Riwayat Mutasi, Nonaktifkan

TAB MUTASI STOK:
- Log semua pergerakan stok: tanggal, produk, tipe (masuk/keluar/adjustment),
  sebelum, perubahan, sesudah, referensi (no. invoice jika dari POS / "Manual")
- Read-only, audit trail permanen

TAB LAYANAN:
- CRUD layanan: nama, kategori, harga, durasi, wajib-dokter (toggle), status
```

### 3.9 Pengeluaran (Expenses)
```
Field: kategori, jumlah, deskripsi, dibuat oleh, tanggal
- CRUD oleh staff/owner
- INI SATU-SATUNYA data yang boleh dihapus fisik (bukan soft delete) — sesuai prinsip arsitektur
- Masuk ke perhitungan laba di Laporan
```

### 3.10 Laporan Keuangan (Owner only)
```
Filter periode: Hari Ini | Minggu Ini | Bulan Ini | Tahun Ini | Custom range

Ringkasan: Pemasukan, Pengeluaran, Laba, Total Transaksi
Chart:
  - Line chart: Pemasukan vs Pengeluaran per hari/minggu/bulan
  - Pie chart: Metode Pembayaran (Tunai % vs QRIS %)
  - Bar chart: Produk Terlaris (Top 10)
  - Bar chart: Pemasukan per Kategori (Produk vs Layanan)
Tabel: Detail Transaksi (no. invoice, customer, kasir, total, metode, status) + Export CSV
Tambahan: Stok Menipis (ringkas), Performa Dokter (jumlah pasien per bulan)
```

### 3.11 Booking Online (Public)
```
Landing page publik: hero, layanan unggulan, tim dokter, info klinik, footer

Alur booking (3 langkah):
  1. Pilih dokter (opsional) + tanggal → tampilkan grid slot tersedia
  2. Data hewan: nama pemilik, HP, email, nama hewan, spesies, keluhan
     (auto-terisi jika customer sudah login)
  3. Konfirmasi ringkasan → submit → success screen

Manajemen booking (Staff):
  - Tabel semua booking dengan filter status
  - Konfirmasi (✅) → otomatis buat appointment baru
  - Tolak (❌) → wajib isi alasan
```

### 3.12 Pengaturan Klinik (Owner)
```
- Nama klinik, alamat, telepon, jam buka, logo
- Single row di clinic_settings, form sederhana
```

---

## 4. DATA MODEL (ringkasan relasi)

```
profiles (1) ──< pets (1) ──< appointments
                  │                │
                  │                └──< medical_records
                  │
                  └──< inpatients ──< inpatient_logs

products ──< stock_mutations
products/services ──< transaction_items >── transactions ── profiles (customer & kasir)

booking_slots ──< bookings ──> appointments (saat dikonfirmasi)

expenses ── profiles (created_by)
clinic_settings (single row)
```

Detail kolom lengkap: lihat BLUEPRINT.md §5.

---

## 5. ATURAN BISNIS PENTING

```
1. Snapshot harga    : transaction_items.price & item_name DISALIN saat transaksi,
                        tidak pernah ikut berubah meski produk.price berubah nanti
2. Soft delete        : semua entitas pakai is_active=false, KECUALI expenses (hapus fisik)
3. Stok otomatis       : transaksi POS produk → trigger pengurangan stok + catat mutasi,
                        dalam SATU operasi atomic (pakai Supabase RPC/transaction function jika perlu)
4. Visibilitas customer : medical_records & inpatient_logs punya is_visible_customer,
                        default true, dokter bisa sembunyikan entri sensitif
5. Booking → Appointment: saat staff konfirmasi booking, sistem WAJIB otomatis buat
                        appointment baru terhubung ke slot yang sama
6. Re-check status aktif: sebelum operasi sensitif (transaksi, rekam medis baru),
                        cek profiles.is_active user terkait masih true
7. Invoice number      : format unik, auto-generate (mis. INV-YYYYMMDD-XXXX)
```

---

## 6. NOTIFIKASI & FEEDBACK UI

```
Toast    : sukses (hijau, 3s) | error (merah, 5s) | warning (amber, 4s) | info (biru, 3s)
Loading  : spinner+teks di button, skeleton di tabel/card, progress bar di upload foto
Empty    : ilustrasi + judul "Belum ada [data]" + deskripsi + tombol aksi (jika relevan)
Confirm  : wajib untuk SEMUA aksi destruktif —
           nonaktifkan user, batal transaksi, hapus pengeluaran, tolak booking, pulangkan pasien
           Format: Judul "Konfirmasi [Aksi]" + body konsekuensi + tombol [Batal] [Ya, Aksi]
```

---

## 7. CETAK (PRINT)

```
Struk POS     : max-width 80mm (thermal printer), sembunyikan sidebar/topbar/button
Rekam Medis   : A4, font 12px, border hitam solid, satu halaman jika memungkinkan
Trigger       : @media print, lewat komponen <PrintWrapper>
```

---

## 8. RESPONSIVE

```
Mobile  <768px  : 1 kolom, sidebar jadi drawer, tabel → card list
Tablet  768-1024: 2 kolom grid, sidebar collapsible
Desktop >1024px : layout penuh
POS             : minimum 1024px (tidak dioptimasi mobile, tampilkan pesan jika layar kecil)
```

---

## 9. KEAMANAN

```
- Auth: Supabase Auth bawaan (bukan custom JWT)
- Otorisasi: Row Level Security per tabel, ditegakkan di level database
- Service role key: HANYA di server (Server Action/Route Handler), TIDAK PERNAH di client
- Validasi input: Zod schema sama dipakai di client (react-hook-form) & server (Server Action)
- File upload: Supabase Storage bucket "uploads", validasi tipe & ukuran (max 5MB) di client + server
```

---

## 10. REFERENSI DOKUMEN TERKAIT

```
BLUEPRINT.md  → stack, setup, schema SQL lengkap, RLS policy, urutan build backend
FRONTEND.md   → pola komponen, form, state, desain visual, urutan build frontend
SPESIFIKASI.md (dokumen ini) → kebutuhan fungsional & aturan bisnis, acuan untuk QA/testing
```
