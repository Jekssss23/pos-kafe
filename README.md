# Titik Temu Kopi — POS Dine-In & Takeaway (MED-WEB-01)

Aplikasi web Point of Sales kafe: login 2 role, dashboard, transaksi master-detail (ACID), laporan + ekspor.

## Tech Stack
Node.js 18+ · Express 4 · SQLite (better-sqlite3) · bcryptjs · express-session · Frontend vanilla JS (SPA, tanpa build step).

## Instalasi
```bash
npm install
npm start          # http://localhost:3000
```
Database `cafe.db` dibuat otomatis beserta **seeder** (user, kategori, 14 menu, 35 transaksi demo 7 hari) saat pertama jalan.
Reset data: hapus `cafe.db*` lalu `npm start` lagi. Opsional env: `PORT`, `SESSION_SECRET`, `DB_FILE`.

## Akun Uji Coba
| Role | Username | Password |
|---|---|---|
| Administrator / Manager | `admin` | `admin123` |
| Kasir / Waiter | `kasir` | `kasir123` |
| Kasir / Waiter | `kasir2` | `kasir123` |

## Struktur
```
server.js   # routing API, middleware auth/RBAC, transaksi, dashboard, laporan
db.js       # skema 5 tabel (users, categories, products, orders, order_details) + seeder
public/     # index.html, style.css, app.js (SPA)
```

## Pemenuhan Spesifikasi
- **Auth & hak akses**: password di-hash bcrypt; middleware `auth`/`admin` memproteksi seluruh `/api/*`; logout menghancurkan sesi & cookie; login memvalidasi input dan dibatasi 5 percobaan gagal/menit; kasir hanya melihat transaksinya sendiri; Laporan, Menu & Stok, Pengguna khusus admin.
- **Dashboard**: 4 KPI (omset hari ini, jumlah pesanan, menu terlaris, stok rendah), grafik batang CSS 7 hari, 8 transaksi terbaru, tombol "Transaksi Baru".
- **Transaksi**: Dine-In (meja wajib)/Takeaway, multi-item + catatan khusus, PB1 10%, diskon (Rp/%), invoice otomatis `INV-POS-YYYYMMDD-XXXX` (UNIQUE), tunai + kembalian, QRIS/Transfer/Debit, status Diproses/Selesai/Dibatalkan. Seluruh perhitungan diulang di server (harga tidak dipercaya dari klien). Validasi stok, tunai ≥ total, dan `db.transaction` (header + detail + pengurangan stok commit/rollback bersama). Pembatalan mengembalikan stok. Struk siap cetak 80mm / 58mm / A4.
- **Laporan**: filter tanggal, kategori, metode; summary bar (bruto, diskon, pajak, bersih, AOV); ekspor CSV (Excel, aman dari formula injection) dan PDF (tombol Ekspor PDF → "Save as PDF" dari dialog cetak, tampilan tabel khusus cetak).

## Catatan Desain
- Omset/jumlah pesanan menghitung semua pesanan non-Dibatalkan (pembayaran dilakukan saat pesanan dibuat). Omset Bersih = Bruto − Diskon.
- Filter kategori di laporan memilih pesanan yang memuat item kategori tsb (nilai total tetap per pesanan).
- Session memakai MemoryStore (cukup untuk demo; gunakan store persisten untuk produksi).
