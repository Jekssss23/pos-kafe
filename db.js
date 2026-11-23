// Koneksi SQLite + skema 5 tabel + seeder data demo (otomatis saat database kosong)
const bcrypt = require('bcryptjs'), path = require('path'), fs = require('fs');

let Database;
let isNodeSqlite = false;

try {
  Database = require('node:sqlite').DatabaseSync;
  isNodeSqlite = true;
} catch (e) {
  Database = require('better-sqlite3');
}

const isVercel = Boolean(process.env.VERCEL);
let dbPath = process.env.DB_FILE;
if (!dbPath) {
  if (isVercel) {
    dbPath = path.join('/tmp', 'cafe.db');
    const localDb = path.join(__dirname, 'cafe.db');
    if (fs.existsSync(localDb) && !fs.existsSync(dbPath)) {
      try { fs.copyFileSync(localDb, dbPath); } catch (e) {}
    }
  } else {
    dbPath = path.join(__dirname, 'cafe.db');
  }
}

const db = new Database(dbPath);

if (isNodeSqlite) {
  db.transaction = function(fn) {
    return function(...args) {
      db.exec('BEGIN');
      try {
        const res = fn(...args);
        db.exec('COMMIT');
        return res;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    };
  };
  db.pragma = function(p) {
    try { db.exec('PRAGMA ' + p); } catch (e) {}
  };
}

if (!isVercel) {
  try { db.pragma('journal_mode=WAL'); } catch (e) {}
}
db.pragma('foreign_keys=ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,nama_lengkap TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN('admin','kasir')),status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN('aktif','nonaktif')),created_at TEXT DEFAULT(datetime('now','localtime')));
CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY AUTOINCREMENT,nama_kategori TEXT NOT NULL UNIQUE,slug TEXT NOT NULL UNIQUE,status TEXT NOT NULL DEFAULT 'aktif');
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,category_id INTEGER NOT NULL REFERENCES categories(id),kode_produk TEXT NOT NULL UNIQUE,nama_produk TEXT NOT NULL,harga_jual INTEGER NOT NULL CHECK(harga_jual>=0),harga_pokok INTEGER NOT NULL DEFAULT 0,stok INTEGER NOT NULL CHECK(stok>=0),min_stok INTEGER NOT NULL DEFAULT 5,unit TEXT NOT NULL DEFAULT 'porsi',aktif INTEGER NOT NULL DEFAULT 1,created_at TEXT DEFAULT(datetime('now','localtime')));
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY AUTOINCREMENT,invoice_number TEXT NOT NULL UNIQUE,user_id INTEGER NOT NULL REFERENCES users(id),tipe_pesanan TEXT NOT NULL CHECK(tipe_pesanan IN('dine-in','takeaway')),nomor_meja TEXT,nama_pemesan TEXT,total_subtotal INTEGER NOT NULL,pajak_nominal INTEGER NOT NULL,diskon_nominal INTEGER NOT NULL DEFAULT 0,grand_total INTEGER NOT NULL,metode_bayar TEXT NOT NULL CHECK(metode_bayar IN('tunai','qris','transfer','debit')),uang_dibayar INTEGER NOT NULL,uang_kembali INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'Diproses' CHECK(status IN('Diproses','Selesai','Dibatalkan')),created_at TEXT DEFAULT(datetime('now','localtime')));
CREATE TABLE IF NOT EXISTS order_details(id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,product_id INTEGER NOT NULL REFERENCES products(id),harga_satuan INTEGER NOT NULL,kuantiti INTEGER NOT NULL CHECK(kuantiti>0),subtotal_baris INTEGER NOT NULL,catatan_khusus TEXT);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
`);

if (!db.prepare('SELECT 1 FROM users').get()) {
  const hash = p => bcrypt.hashSync(p, 10);
  const u = db.prepare('INSERT INTO users(username,password_hash,nama_lengkap,role) VALUES(?,?,?,?)');
  u.run('admin', hash('admin123'), 'Manajer Titik Temu', 'admin');
  u.run('kasir', hash('kasir123'), 'Kasir Sari', 'kasir');
  u.run('kasir2', hash('kasir123'), 'Waiter Budi', 'kasir');
  const c = db.prepare('INSERT INTO categories(nama_kategori,slug) VALUES(?,?)');
  ['Coffee', 'Non-Coffee', 'Food', 'Pastry'].forEach(n => c.run(n, n.toLowerCase()));
  const p = db.prepare('INSERT INTO products(category_id,kode_produk,nama_produk,harga_jual,harga_pokok,stok,min_stok,unit) VALUES(?,?,?,?,?,?,?,?)');
  [[1,'CF-001','Espresso',18000,6000,60,10],[1,'CF-002','Americano',22000,7000,60,10],[1,'CF-003','Cafe Latte',28000,10000,50,10],
   [1,'CF-004','Cappuccino',28000,10000,50,10],[1,'CF-005','Kopi Susu Gula Aren',25000,9000,70,10],
   [2,'NC-001','Matcha Latte',30000,12000,4,5],[2,'NC-002','Chocolate',27000,10000,40,8],[2,'NC-003','Lemon Tea',18000,5000,45,8],
   [3,'FD-001','Nasi Goreng Kampung',32000,14000,30,6],[3,'FD-002','Mie Goreng',28000,11000,30,6],[3,'FD-003','Chicken Katsu Rice',38000,17000,25,5],
   [4,'PS-001','Croissant',24000,9000,3,5],[4,'PS-002','Banana Bread',20000,7000,20,5],[4,'PS-003','Donat Cokelat',15000,5000,25,5]]
    .forEach(r => p.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], 'porsi'));
  // Riwayat demo 7 hari terakhir agar dashboard & laporan tidak kosong
  let seed = 42; const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n;
  const prods = db.prepare('SELECT * FROM products').all();
  const io = db.prepare(`INSERT INTO orders(invoice_number,user_id,tipe_pesanan,nomor_meja,nama_pemesan,total_subtotal,pajak_nominal,diskon_nominal,grand_total,metode_bayar,uang_dibayar,uang_kembali,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now','localtime',?,?))`);
  const id = db.prepare('INSERT INTO order_details(order_id,product_id,harga_satuan,kuantiti,subtotal_baris,catatan_khusus) VALUES(?,?,?,?,?,?)');
  for (let d = 6; d >= 0; d--) {
    const ymd = db.prepare("SELECT strftime('%Y%m%d','now','localtime',?) s").get(`-${d} days`).s;
    for (let i = 1; i <= 5; i++) {
      const lines = Array.from({ length: 1 + rnd(3) }, () => ({ p: prods[rnd(prods.length)], q: 1 + rnd(3) }));
      const sub = lines.reduce((s, l) => s + l.p.harga_jual * l.q, 0), pajak = Math.round(sub * 0.1), grand = sub + pajak;
      const metode = ['tunai', 'qris', 'debit', 'transfer'][rnd(4)], dibayar = metode === 'tunai' ? Math.ceil(grand / 50000) * 50000 : grand;
      const dine = rnd(2) === 0;
      const r = io.run(`INV-POS-${ymd}-${String(i).padStart(4, '0')}`, 2 + rnd(2), dine ? 'dine-in' : 'takeaway', dine ? String(1 + rnd(10)) : null,
        ['Andi', 'Rina', 'Meja Keluarga', 'Dewi', ''][rnd(5)], sub, pajak, 0, grand, metode, dibayar, dibayar - grand,
        d === 0 && i === 5 ? 'Diproses' : 'Selesai', `-${d} days`, `-${i * 11} minutes`);
      lines.forEach(l => id.run(r.lastInsertRowid, l.p.id, l.p.harga_jual, l.q, l.p.harga_jual * l.q, null));
    }
  }
}

module.exports = db;
