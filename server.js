// Server Express: autentikasi, RBAC, master data, transaksi (ACID), dashboard, laporan
const express = require('express'), session = require('express-session'), bcrypt = require('bcryptjs'), path = require('path');
const db = require('./db');
const app = express(), TAX = 0.1;
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));
app.use(session({ name: 'sid', secret: process.env.SESSION_SECRET || 'ganti-secret-ini', resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 8 * 3600 * 1000 } }));
app.use(express.static(path.join(__dirname, 'public')));

const fail = (s, m) => { const e = new Error(m); e.status = s; throw e; };
const wrap = fn => (req, res) => { try { fn(req, res); } catch (e) {
  if (e.status) return res.status(e.status).json({ error: e.message });
  if (String(e.code).startsWith('SQLITE_CONSTRAINT') || String(e.message).includes('constraint failed')) return res.status(409).json({ error: 'Data duplikat atau tidak valid' });
  console.error(e); res.status(500).json({ error: 'Terjadi kesalahan server' }); } };
const auth = (req, res, next) => req.session.user ? next() : res.status(401).json({ error: 'Silakan login' });
const admin = (req, res, next) => req.session.user.role === 'admin' ? next() : res.status(403).json({ error: 'Khusus administrator' });
const scope = u => u.role === 'admin' ? { w: '', p: [] } : { w: ' AND o.user_id=?', p: [u.id] };

// ---------- Modul 1: Autentikasi ----------
const attempts = {};
app.post('/api/login', wrap((req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) fail(400, 'Username dan password wajib diisi');
  const k = req.ip + '|' + username, a = attempts[k], fresh = a && Date.now() - a.t < 60000;
  if (fresh && a.n >= 5) fail(429, 'Terlalu banyak percobaan gagal, coba lagi 1 menit');
  const u = db.prepare('SELECT * FROM users WHERE username=?').get(String(username).trim());
  if (!u || u.status !== 'aktif' || !bcrypt.compareSync(String(password), u.password_hash)) {
    attempts[k] = { n: (fresh ? a.n : 0) + 1, t: Date.now() }; fail(401, 'Username atau password salah'); }
  delete attempts[k];
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: 'Gagal membuat sesi' });
    req.session.user = { id: u.id, username: u.username, nama: u.nama_lengkap, role: u.role };
    res.json(req.session.user); });
}));
app.post('/api/logout', (req, res) => req.session.destroy(() => { res.clearCookie('sid'); res.json({ ok: true }); }));
app.get('/api/me', auth, (req, res) => res.json(req.session.user));

// ---------- Master data ----------
app.get('/api/categories', auth, wrap((req, res) => res.json(db.prepare(
  `SELECT * FROM categories ${req.session.user.role === 'admin' ? '' : "WHERE status='aktif'"} ORDER BY id`).all())));
app.post('/api/categories', auth, admin, wrap((req, res) => {
  const n = String(req.body.nama_kategori || '').trim(); if (!n) fail(400, 'Nama kategori wajib diisi');
  db.prepare('INSERT INTO categories(nama_kategori,slug) VALUES(?,?)').run(n, n.toLowerCase().replace(/[^a-z0-9]+/g, '-')); res.status(201).json({ ok: true }); }));
app.put('/api/categories/:id', auth, admin, wrap((req, res) => {
  const n = String(req.body.nama_kategori || '').trim(); if (!n) fail(400, 'Nama kategori wajib diisi');
  db.prepare('UPDATE categories SET nama_kategori=?,slug=?,status=? WHERE id=?').run(n, n.toLowerCase().replace(/[^a-z0-9]+/g, '-'), req.body.status === 'nonaktif' ? 'nonaktif' : 'aktif', req.params.id); res.json({ ok: true }); }));

const prodSql = 'SELECT p.*,c.nama_kategori FROM products p JOIN categories c ON c.id=p.category_id';
app.get('/api/products', auth, wrap((req, res) => res.json(db.prepare(
  prodSql + (req.session.user.role === 'admin' && req.query.all ? '' : " WHERE p.aktif=1 AND c.status='aktif'") + ' ORDER BY c.id,p.nama_produk').all())));
function prodData(b) {
  const n = v => { const x = Number(v); if (!Number.isInteger(x) || x < 0) fail(400, 'Harga/stok harus bilangan bulat ≥ 0'); return x; };
  const kode = String(b.kode_produk || '').trim(), nama = String(b.nama_produk || '').trim();
  if (!kode || !nama) fail(400, 'Kode dan nama menu wajib diisi');
  if (!db.prepare('SELECT 1 FROM categories WHERE id=?').get(b.category_id)) fail(400, 'Kategori tidak valid');
  return [b.category_id, kode, nama, n(b.harga_jual), n(b.harga_pokok), n(b.stok), n(b.min_stok), String(b.unit || 'porsi').trim() || 'porsi', b.aktif == 0 ? 0 : 1];
}
app.post('/api/products', auth, admin, wrap((req, res) => {
  db.prepare('INSERT INTO products(category_id,kode_produk,nama_produk,harga_jual,harga_pokok,stok,min_stok,unit,aktif) VALUES(?,?,?,?,?,?,?,?,?)').run(...prodData(req.body)); res.status(201).json({ ok: true }); }));
app.put('/api/products/:id', auth, admin, wrap((req, res) => {
  db.prepare('UPDATE products SET category_id=?,kode_produk=?,nama_produk=?,harga_jual=?,harga_pokok=?,stok=?,min_stok=?,unit=?,aktif=? WHERE id=?').run(...prodData(req.body), req.params.id); res.json({ ok: true }); }));

app.get('/api/users', auth, admin, wrap((req, res) => res.json(db.prepare('SELECT id,username,nama_lengkap,role,status,created_at FROM users ORDER BY id').all())));
function userCheck(b, needPass) {
  if (!String(b.nama_lengkap || '').trim()) fail(400, 'Nama lengkap wajib diisi');
  if (!['admin', 'kasir'].includes(b.role)) fail(400, 'Role tidak valid');
  if ((needPass || b.password) && String(b.password || '').length < 6) fail(400, 'Password minimal 6 karakter');
}
app.post('/api/users', auth, admin, wrap((req, res) => {
  const b = req.body; userCheck(b, true);
  if (!/^[a-z0-9_.-]{3,30}$/i.test(b.username || '')) fail(400, 'Username 3-30 karakter (huruf/angka/_.-)');
  db.prepare('INSERT INTO users(username,password_hash,nama_lengkap,role) VALUES(?,?,?,?)').run(b.username.trim(), bcrypt.hashSync(b.password, 10), b.nama_lengkap.trim(), b.role); res.status(201).json({ ok: true }); }));
app.put('/api/users/:id', auth, admin, wrap((req, res) => {
  const b = req.body; userCheck(b, false);
  if (+req.params.id === req.session.user.id && (b.status === 'nonaktif' || b.role !== 'admin')) fail(400, 'Tidak bisa menonaktifkan/menurunkan akun sendiri');
  db.prepare('UPDATE users SET nama_lengkap=?,role=?,status=? WHERE id=?').run(b.nama_lengkap.trim(), b.role, b.status === 'nonaktif' ? 'nonaktif' : 'aktif', req.params.id);
  if (b.password) db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(bcrypt.hashSync(b.password, 10), req.params.id); res.json({ ok: true }); }));

// ---------- Modul 3: Transaksi ----------
function nextInvoice() {
  const ymd = db.prepare("SELECT strftime('%Y%m%d','now','localtime') s").get().s;
  const n = db.prepare('SELECT COUNT(*) c FROM orders WHERE invoice_number LIKE ?').get(`INV-POS-${ymd}-%`).c + 1;
  return `INV-POS-${ymd}-${String(n).padStart(4, '0')}`;
}
app.get('/api/orders/next-invoice', auth, (req, res) => res.json({ invoice_number: nextInvoice() }));
app.get('/api/orders', auth, wrap((req, res) => {
  const s = scope(req.session.user);
  res.json(db.prepare(`SELECT o.*,u.nama_lengkap kasir FROM orders o JOIN users u ON u.id=o.user_id WHERE 1=1${s.w} ORDER BY o.id DESC LIMIT ?`).all(...s.p, Math.min(+req.query.limit || 100, 500))); }));
app.get('/api/orders/:id', auth, wrap((req, res) => {
  const o = db.prepare('SELECT o.*,u.nama_lengkap kasir FROM orders o JOIN users u ON u.id=o.user_id WHERE o.id=?').get(req.params.id);
  if (!o || (req.session.user.role !== 'admin' && o.user_id !== req.session.user.id)) fail(404, 'Pesanan tidak ditemukan');
  o.items = db.prepare('SELECT d.*,p.nama_produk FROM order_details d JOIN products p ON p.id=d.product_id WHERE d.order_id=?').all(o.id); res.json(o); }));

app.post('/api/orders', auth, wrap((req, res) => {
  const b = req.body || {}, items = Array.isArray(b.items) ? b.items : [];
  if (!['dine-in', 'takeaway'].includes(b.tipe_pesanan)) fail(400, 'Tipe pesanan tidak valid');
  const meja = b.tipe_pesanan === 'dine-in' ? String(b.nomor_meja || '').trim().slice(0, 10) : null;
  if (b.tipe_pesanan === 'dine-in' && !meja) fail(400, 'Nomor meja wajib diisi untuk Dine-In');
  if (!items.length || items.length > 50) fail(400, 'Tambahkan minimal 1 item pesanan');
  if (!['tunai', 'qris', 'transfer', 'debit'].includes(b.metode_bayar)) fail(400, 'Metode pembayaran tidak valid');
  const create = db.transaction(() => {            // ACID: header + detail + stok, semua commit atau semua rollback
    const need = {}, lines = []; let sub = 0;
    for (const it of items) {
      const q = Number(it.qty); if (!Number.isInteger(q) || q < 1 || q > 999) fail(400, 'Kuantiti tidak valid');
      const p = db.prepare('SELECT * FROM products WHERE id=? AND aktif=1').get(it.product_id); if (!p) fail(400, 'Menu tidak ditemukan / nonaktif');
      need[p.id] = (need[p.id] || 0) + q;
      if (need[p.id] > p.stok) fail(409, `Stok ${p.nama_produk} tidak cukup (sisa ${p.stok})`);
      lines.push({ p, q, note: String(it.catatan || '').trim().slice(0, 120) }); sub += p.harga_jual * q;
    }
    const dv = Number(b.diskon_nilai) || 0; if (dv < 0) fail(400, 'Diskon tidak valid');
    const diskon = b.diskon_tipe === 'persen' ? Math.round(sub * Math.min(dv, 100) / 100) : Math.min(Math.round(dv), sub);
    const pajak = Math.round((sub - diskon) * TAX), grand = sub - diskon + pajak;
    const bayar = b.metode_bayar === 'tunai' ? Number(b.uang_dibayar) : grand;
    if (!Number.isFinite(bayar) || bayar < grand) fail(400, 'Uang dibayar kurang dari total tagihan');
    const r = db.prepare(`INSERT INTO orders(invoice_number,user_id,tipe_pesanan,nomor_meja,nama_pemesan,total_subtotal,pajak_nominal,diskon_nominal,grand_total,metode_bayar,uang_dibayar,uang_kembali) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(nextInvoice(), req.session.user.id, b.tipe_pesanan, meja, String(b.nama_pemesan || '').trim().slice(0, 60), sub, pajak, diskon, grand, b.metode_bayar, bayar, bayar - grand);
    for (const l of lines) {
      db.prepare('INSERT INTO order_details(order_id,product_id,harga_satuan,kuantiti,subtotal_baris,catatan_khusus) VALUES(?,?,?,?,?,?)').run(r.lastInsertRowid, l.p.id, l.p.harga_jual, l.q, l.p.harga_jual * l.q, l.note);
      db.prepare('UPDATE products SET stok=stok-? WHERE id=?').run(l.q, l.p.id);
    }
    return r.lastInsertRowid;
  });
  res.status(201).json({ id: create() });
}));
app.patch('/api/orders/:id/status', auth, wrap((req, res) => {
  const u = req.session.user, st = req.body && req.body.status;
  if (!['Selesai', 'Dibatalkan'].includes(st)) fail(400, 'Status tidak valid');
  db.transaction(() => {
    const o = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id);
    if (!o || (u.role !== 'admin' && o.user_id !== u.id)) fail(404, 'Pesanan tidak ditemukan');
    if (o.status !== 'Diproses') fail(409, 'Hanya pesanan berstatus Diproses yang dapat diubah');
    if (st === 'Dibatalkan') for (const d of db.prepare('SELECT * FROM order_details WHERE order_id=?').all(o.id))
      db.prepare('UPDATE products SET stok=stok+? WHERE id=?').run(d.kuantiti, d.product_id);   // stok dikembalikan
    db.prepare('UPDATE orders SET status=? WHERE id=?').run(st, o.id);
  })();
  res.json({ ok: true }); }));

// ---------- Modul 2: Dashboard ----------
app.get('/api/dashboard', auth, wrap((req, res) => {
  const s = scope(req.session.user), today = "date(o.created_at)=date('now','localtime') AND o.status!='Dibatalkan'";
  const t = db.prepare(`SELECT COALESCE(SUM(grand_total),0) v,COUNT(*) c FROM orders o WHERE ${today}${s.w}`).get(...s.p);
  const top = db.prepare(`SELECT p.nama_produk,SUM(d.kuantiti) qty FROM order_details d JOIN orders o ON o.id=d.order_id JOIN products p ON p.id=d.product_id WHERE ${today}${s.w} GROUP BY p.id ORDER BY qty DESC LIMIT 1`).get(...s.p);
  const rows = db.prepare(`SELECT date(o.created_at) d,SUM(grand_total) v FROM orders o WHERE date(o.created_at)>=date('now','localtime','-6 days') AND o.status!='Dibatalkan'${s.w} GROUP BY d`).all(...s.p);
  const tren = []; for (let i = 6; i >= 0; i--) {
    const d = db.prepare("SELECT date('now','localtime',?) d").get(`-${i} days`).d, r = rows.find(x => x.d === d);
    tren.push({ label: d.slice(8) + '/' + d.slice(5, 7), omset: r ? r.v : 0 }); }
  res.json({ omset: t.v, jumlah: t.c, terlaris: top || null, tren,
    stok_rendah: db.prepare('SELECT id,nama_produk,stok,min_stok FROM products WHERE aktif=1 AND stok<min_stok ORDER BY stok').all(),
    terbaru: db.prepare(`SELECT o.*,u.nama_lengkap kasir FROM orders o JOIN users u ON u.id=o.user_id WHERE 1=1${s.w} ORDER BY o.id DESC LIMIT 8`).all(...s.p) }); }));

// ---------- Modul 4: Laporan ----------
function report(q) {
  const w = ['1=1'], p = [];
  if (q.from) { w.push('date(o.created_at)>=?'); p.push(q.from); }
  if (q.to) { w.push('date(o.created_at)<=?'); p.push(q.to); }
  if (q.metode) { w.push('o.metode_bayar=?'); p.push(q.metode); }
  if (q.kategori) { w.push('EXISTS(SELECT 1 FROM order_details d JOIN products pr ON pr.id=d.product_id WHERE d.order_id=o.id AND pr.category_id=?)'); p.push(q.kategori); }
  const rows = db.prepare(`SELECT o.*,u.nama_lengkap kasir,(SELECT SUM(kuantiti) FROM order_details WHERE order_id=o.id) item_terjual FROM orders o JOIN users u ON u.id=o.user_id WHERE ${w.join(' AND ')} ORDER BY o.created_at DESC`).all(...p);
  const ok = rows.filter(r => r.status !== 'Dibatalkan'), sum = k => ok.reduce((s, r) => s + r[k], 0);
  const bruto = sum('total_subtotal'), diskon = sum('diskon_nominal');
  return { rows, summary: { bruto, diskon, pajak: sum('pajak_nominal'), bersih: bruto - diskon, jumlah: ok.length, aov: ok.length ? Math.round(sum('grand_total') / ok.length) : 0 } };
}
app.get('/api/reports', auth, admin, wrap((req, res) => res.json(report(req.query))));
app.get('/api/reports/export', auth, admin, wrap((req, res) => {
  const cell = v => { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
  const lines = [['No. Faktur', 'Tanggal & Jam', 'Kasir', 'Tipe Pesanan', 'Item Terjual', 'Subtotal', 'Pajak', 'Grand Total', 'Status'].map(cell).join(',')];
  report(req.query).rows.forEach(r => lines.push([r.invoice_number, r.created_at, r.kasir, r.tipe_pesanan, r.item_terjual, r.total_subtotal, r.pajak_nominal, r.grand_total, r.status].map(cell).join(',')));
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="laporan-penjualan.csv"' });
  res.send('\ufeff' + lines.join('\r\n')); }));

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => console.log('POS Titik Temu Kopi: http://localhost:' + (process.env.PORT || 3000)));
}

module.exports = app;
