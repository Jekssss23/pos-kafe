// Frontend SPA (vanilla JS) — Titik Temu Kopi Modern POS System
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const rp = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const METODE = { tunai: 'Tunai', qris: 'QRIS', transfer: 'Transfer Bank', debit: 'Kartu Debit' };
let me = null;

// SVG Icon Helper
function svg(name, size = 18, cls = '') {
  const icons = {
    coffee: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
    dashboard: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    pos: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    riwayat: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    laporan: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    menu: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9A9 9 0 0 1 3 11a9 9 0 0 1 9-9Z"></path><path d="M12 2c2 4 2 14 0 18"></path><path d="M3 11c4-2 14-2 18 0"></path></svg>`,
    users: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    search: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    x: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    plus: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    minus: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    trash: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    print: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`,
    download: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
    check: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    alert: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    logout: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    dinein: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>`,
    takeaway: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    cash: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>`,
    qris: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    card: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
    transfer: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`,
    omset: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    star: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
  };
  return icons[name] || '';
}

async function api(url, o = {}) {
  const r = await fetch(url, {
    method: o.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: o.body ? JSON.stringify(o.body) : undefined
  });
  if (r.status === 401 && url !== '/api/login') {
    me = null;
    showLogin();
    throw new Error('Sesi berakhir, silakan login kembali');
  }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Terjadi kesalahan pada sistem');
  return d;
}

function toast(m, ok = true) {
  const t = document.createElement('div');
  t.className = 'toast ' + (ok ? 'ok' : 'err');
  t.innerHTML = `${svg(ok ? 'check' : 'alert', 18)} <span>${esc(m)}</span>`;
  $('#toasts').append(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(40px)';
    t.style.transition = 'all 0.25s ease';
    setTimeout(() => t.remove(), 250);
  }, 3500);
}

const closeModal = () => {
  $('#modal').innerHTML = '';
  document.body.classList.remove('pr-receipt');
  const s = $('#pgstyle');
  if (s) s.remove();
};

// Close modal on ESC key
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#modal').innerHTML) closeModal();
});

// ---------- Login & Shell ----------
function showLogin() {
  $('#app').innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-icon">${svg('coffee', 30)}</div>
          <h2>Titik Temu Kopi</h2>
          <p>Sistem Point of Sales & Manajemen Kafe</p>
        </div>
        <form id="lf">
          <label style="text-align:left">
            <span>Username</span>
            <input name="username" placeholder="Masukkan username" autocomplete="username" required autofocus>
          </label>
          <label style="text-align:left">
            <span>Password</span>
            <input name="password" type="password" placeholder="Masukkan password" autocomplete="current-password" required>
          </label>
          <button class="btn pri" style="width:100%; margin-top: 10px;">
            ${svg('coffee', 18)} Masuk ke Sistem
          </button>
        </form>
      </div>
    </div>`;

  $('#lf').onsubmit = async e => {
    e.preventDefault();
    try {
      me = await api('/api/login', {
        method: 'POST',
        body: Object.fromEntries(new FormData(e.target))
      });
      location.hash = '';
      shell();
    } catch (x) {
      toast(x.message, false);
    }
  };
}

const routes = {
  dashboard: ['Dashboard', dashboard, svg('dashboard', 16)],
  pos: ['Kasir (POS)', pos, svg('pos', 16)],
  riwayat: ['Riwayat', riwayat, svg('riwayat', 16)],
  laporan: ['Laporan', laporan, svg('laporan', 16), 1],
  menu: ['Menu & Stok', menu, svg('menu', 16), 1],
  users: ['Pengguna', users, svg('users', 16), 1]
};

function shell() {
  const navItems = Object.entries(routes)
    .filter(([, r]) => !r[3] || me.role === 'admin')
    .map(([k, r]) => `<a href="#/${k}" data-k="${k}">${r[2]} <span>${r[0]}</span></a>`)
    .join('');

  const initials = me.nama ? me.nama.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'TT';

  $('#app').innerHTML = `
    <header class="noprint">
      <div class="brand-wrapper">
        <div class="brand-logo">${svg('coffee', 20)}</div>
        <div class="brand-text">
          <h1>Titik Temu Kopi</h1>
          <span>Artisan POS</span>
        </div>
      </div>
      <nav id="nav">${navItems}</nav>
      <div class="user-profile">
        <div class="user-badge">
          <div class="user-avatar">${initials}</div>
          <div class="user-meta">
            <span class="user-name">${esc(me.nama)}</span>
            <span class="user-role">${me.role === 'admin' ? 'Administrator' : 'Kasir'}</span>
          </div>
        </div>
        <button class="btn-logout" id="lo" title="Keluar dari sistem">
          ${svg('logout', 15)} <span>Keluar</span>
        </button>
      </div>
    </header>
    <main id="view"></main>`;

  $('#lo').onclick = async () => {
    try { await api('/api/logout', { method: 'POST' }); } catch (e) {}
    me = null;
    showLogin();
  };

  route();
}

async function route() {
  if (!me) return;
  let k = location.hash.slice(2) || (me.role === 'admin' ? 'dashboard' : 'pos');
  let r = routes[k];
  if (!r || (r[3] && me.role !== 'admin')) {
    k = me.role === 'admin' ? 'dashboard' : 'pos';
    r = routes[k];
  }
  $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.k === k));
  const v = $('#view');
  v.innerHTML = `
    <div style="text-align:center; padding: 60px 20px; color: var(--text-muted)">
      <div style="display:inline-block; animation: spin 1s infinite linear; margin-bottom: 12px;">${svg('coffee', 32)}</div>
      <p style="font-weight: 600;">Memuat data...</p>
    </div>`;

  try {
    await r[1](v);
  } catch (e) {
    v.innerHTML = '';
    toast(e.message, false);
  }
}

window.onhashchange = route;

document.addEventListener('click', e => {
  const b = e.target.closest('[data-struk]');
  if (b) showReceipt(b.dataset.struk).catch(x => toast(x.message, false));
});

// ---------- Reusable Components ----------
function ordersTable(rows, act) {
  if (!rows || !rows.length) {
    return `
      <div class="empty-cart-state" style="padding: 30px;">
        ${svg('riwayat', 36)}
        <p style="font-weight: 600; margin-top: 8px;">Belum ada data transaksi.</p>
      </div>`;
  }

  return `
    <div class="scroll">
      <table>
        <thead>
          <tr>
            <th>No. Faktur</th>
            <th>Waktu</th>
            <th>Kasir</th>
            <th>Tipe</th>
            <th style="text-align:right">Total</th>
            <th style="text-align:center">Status</th>
            <th style="text-align:center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(o => `
            <tr>
              <td><b style="font-family:'JetBrains Mono', monospace; font-size:12px">${o.invoice_number}</b></td>
              <td><small>${o.created_at}</small></td>
              <td>${esc(o.kasir)}</td>
              <td>
                <span class="badge" style="background:var(--bg-surface-subtle); border:1px solid var(--border-default); color:var(--text-secondary)">
                  ${o.tipe_pesanan === 'dine-in' ? `${svg('dinein', 13)} Meja #${esc(o.nomor_meja || '-')}` : `${svg('takeaway', 13)} Takeaway`}
                </span>
              </td>
              <td style="text-align:right"><b style="font-family:'JetBrains Mono', monospace; color:var(--brand-800)">${rp(o.grand_total)}</b></td>
              <td style="text-align:center"><span class="badge ${o.status}">${o.status}</span></td>
              <td style="text-align:center">
                <div style="display:inline-flex; gap: 4px;">
                  <button class="btn" style="padding: 4px 8px; font-size: 12px" data-struk="${o.id}">
                    ${svg('print', 13)} Struk
                  </button>
                  ${act && o.status === 'Diproses' ? `
                    <button class="btn" style="padding: 4px 8px; font-size: 12px; border-color: var(--success); color: var(--success)" data-st="Selesai" data-id="${o.id}">
                      ${svg('check', 13)} Selesai
                    </button>
                    <button class="btn danger" style="padding: 4px 8px; font-size: 12px" data-st="Dibatalkan" data-id="${o.id}">
                      ${svg('x', 13)} Batal
                    </button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function formModal(title, fields, val, onSave) {
  $('#modal').innerHTML = `
    <div class="mbox" onclick="event.stopPropagation()">
      <div class="mbox-header">
        <h3>${title}</h3>
        <button class="close-btn" id="clm">${svg('x', 18)}</button>
      </div>
      <div id="ff">
        ${fields.map(f => `
          <label>
            <span>${f.l}</span>
            ${f.t === 'select'
              ? `<select name="${f.k}">${f.o.map(o => `<option value="${esc(o[0])}" ${String(val[f.k] ?? '') === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
              : `<input name="${f.k}" type="${f.t || 'text'}" value="${esc(val[f.k] ?? '')}" ${f.p ? `placeholder="${f.p}"` : ''}>`}
          </label>
        `).join('')}
      </div>
      <div class="row" style="margin-top: 20px; justify-content: flex-end;">
        <button class="btn" id="cl">${svg('x', 15)} Batal</button>
        <button class="btn pri" id="ok">${svg('check', 15)} Simpan Perubahan</button>
      </div>
    </div>`;

  $('#modal').onclick = closeModal;
  $('#clm').onclick = closeModal;
  $('#cl').onclick = closeModal;

  $('#ok').onclick = async () => {
    const b = {};
    document.querySelectorAll('#ff [name]').forEach(e => b[e.name] = e.value);
    try {
      await onSave(b);
      closeModal();
    } catch (e) {
      toast(e.message, false);
    }
  };
}

async function showReceipt(id) {
  const o = await api('/api/orders/' + id);
  $('#modal').innerHTML = `
    <div class="mbox" style="width: auto; max-width: 95vw;" onclick="event.stopPropagation()">
      <div class="mbox-header noprint">
        <h3>Preview Struk Pembayaran</h3>
        <button class="close-btn" id="clm">${svg('x', 18)}</button>
      </div>
      <div id="receipt" class="w80">
        <h4>TITIK TEMU KOPI</h4>
        <p>Specialty Coffee & Eatery</p>
        <p style="font-size:10px">Jl. Senopati No. 45, Jakarta Selatan</p>
        <hr>
        <div class="r"><span>No: ${o.invoice_number}</span><span>${o.created_at}</span></div>
        <div class="r"><span>Kasir: ${esc(o.kasir)}</span><span>Tipe: ${o.tipe_pesanan === 'dine-in' ? 'Dine-In (Meja ' + esc(o.nomor_meja || '-') + ')' : 'Takeaway'}</span></div>
        ${o.nama_pemesan ? `<div>Pelanggan: ${esc(o.nama_pemesan)}</div>` : ''}
        <hr>
        ${o.items.map(i => `
          <div class="item-row">
            <div><b>${esc(i.nama_produk)}</b></div>
            <div class="r">
              <span>${i.kuantiti} x ${rp(i.harga_satuan)}</span>
              <span>${rp(i.subtotal_baris)}</span>
            </div>
            ${i.catatan_khusus ? `<div class="item-note">* Catatan: ${esc(i.catatan_khusus)}</div>` : ''}
          </div>
        `).join('')}
        <hr>
        <div class="r"><span>Subtotal:</span><span>${rp(o.total_subtotal)}</span></div>
        ${o.diskon_nominal > 0 ? `<div class="r"><span>Diskon:</span><span>-${rp(o.diskon_nominal)}</span></div>` : ''}
        <div class="r"><span>Pajak Restoran (PB1 10%):</span><span>${rp(o.pajak_nominal)}</span></div>
        <div class="r" style="font-size:14px; margin-top:4px"><b>TOTAL TAGIHAN:</b><b>${rp(o.grand_total)}</b></div>
        <div class="r"><span>Metode Bayar:</span><span>${METODE[o.metode_bayar]}</span></div>
        <div class="r"><span>Uang Diterima:</span><span>${rp(o.uang_dibayar)}</span></div>
        <div class="r"><span>Kembalian:</span><span>${rp(o.uang_kembali)}</span></div>
        <hr>
        <p>Status Pembayaran: <b>${o.status}</b></p>
        <p style="margin-top:6px">Terima kasih atas kunjungan Anda!</p>
        <p style="font-size:10px; color:#888">Password Wifi: titiktemukopi</p>
      </div>
      <div class="row noprint" style="margin-top: 14px; justify-content: space-between;">
        <select id="sz" style="width: auto; flex: 1;">
          <option value="w80">Format Thermal 80mm</option>
          <option value="w58">Format Thermal 58mm</option>
          <option value="a4">Format Kertas A4</option>
        </select>
        <button class="btn pri" id="pr">${svg('print', 16)} Cetak Struk</button>
        <button class="btn" id="cl">${svg('x', 15)} Tutup</button>
      </div>
    </div>`;

  document.body.classList.add('pr-receipt');
  $('#modal').onclick = closeModal;
  $('#clm').onclick = closeModal;
  $('#cl').onclick = closeModal;

  const page = () => {
    let s = $('#pgstyle');
    if (!s) {
      s = document.createElement('style');
      s.id = 'pgstyle';
      document.head.append(s);
    }
    const z = $('#sz').value;
    s.textContent = `@page{size:${z === 'a4' ? 'A4' : z === 'w58' ? '58mm auto' : '80mm auto'};margin:${z === 'a4' ? '12mm' : '2mm'}}`;
  };

  $('#sz').onchange = () => {
    $('#receipt').className = $('#sz').value;
    page();
  };
  page();

  $('#pr').onclick = () => window.print();
}

// ---------- Dashboard ----------
async function dashboard(v) {
  const d = await api('/api/dashboard');
  const max = Math.max(1, ...d.tren.map(t => t.omset));

  v.innerHTML = `
    <div class="card-header">
      <div>
        <h2>Ringkasan Bisnis Kafe</h2>
        <small>Pantau performa penjualan harian, tren omset, dan ketersediaan stok</small>
      </div>
      <a class="btn pri" href="#/pos">
        ${svg('plus', 16)} <span>Transaksi Kasir Baru</span>
      </a>
    </div>

    <div class="kpis">
      <div class="kpi-card">
        <div class="kpi-icon omset">${svg('omset', 22)}</div>
        <div class="kpi-info">
          <small>Total Omset Hari Ini</small>
          <b>${rp(d.omset)}</b>
          <span class="sub-text">Akumulasi transaksi sukses</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon pesanan">${svg('pos', 22)}</div>
        <div class="kpi-info">
          <small>Jumlah Pesanan</small>
          <b>${d.jumlah} <span style="font-size:16px; font-weight:600">Pesanan</span></b>
          <span class="sub-text">Selesai & sedang diproses</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon terlaris">${svg('star', 22)}</div>
        <div class="kpi-info">
          <small>Menu Terlaris Hari Ini</small>
          <b style="font-size:18px">${d.terlaris ? esc(d.terlaris.nama_produk) : '-'}</b>
          <span class="sub-text">${d.terlaris ? `${d.terlaris.qty} porsi terjual` : 'Belum ada data'}</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon stok">${svg('alert', 22)}</div>
        <div class="kpi-info">
          <small>Peringatan Stok Rendah</small>
          <b>${d.stok_rendah.length} <span style="font-size:16px; font-weight:600">Item</span></b>
          <span class="sub-text">${d.stok_rendah.length ? 'Perlu segera direstok' : 'Semua stok aman'}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Tren Omset 7 Hari Terakhir</h3>
        <small>Performa harian dalam ribuan rupiah (k)</small>
      </div>
      <div class="bars">
        ${d.tren.map(t => {
          const heightPct = Math.max(6, (t.omset / max) * 100 * 0.85);
          return `
            <div class="bar" title="${t.label}: ${rp(t.omset)}">
              <small>${t.omset ? Math.round(t.omset / 1000) + 'k' : '0'}</small>
              <i style="height:${heightPct}%"></i>
              <span>${t.label}</span>
            </div>`;
        }).join('')}
      </div>
    </div>

    ${d.stok_rendah.length ? `
      <div class="warning-box">
        <h3>${svg('alert', 20)} Peringatan: Stok Menu di Bawah Batas Minimum</h3>
        <p style="font-size: 13px; margin-bottom: 12px; color: var(--warning-text)">
          Item-item berikut memiliki persediaan yang hampir habis. Segera tambahkan stok di menu master data.
        </p>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${d.stok_rendah.map(s => `
            <span class="chip" style="background:#fff; border-color:var(--warning-border); color:var(--warning-text)">
              ${esc(s.nama_produk)}: <b>${s.stok}</b> / min ${s.min_stok}
            </span>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div class="card">
      <div class="card-header">
        <h3>Transaksi Terbaru</h3>
        <a href="#/riwayat" style="font-size:13px; color:var(--brand-600); font-weight:600; text-decoration:none">Lihat Semua →</a>
      </div>
      ${ordersTable(d.terbaru)}
    </div>`;
}

// ---------- Kasir / POS ----------
async function pos(v) {
  const [prods, cats, inv] = await Promise.all([
    api('/api/products'),
    api('/api/categories'),
    api('/api/orders/next-invoice')
  ]);

  let cart = [];
  let cat = '';
  let q = '';
  let orderType = 'dine-in';
  let tableNo = '1';
  let paymentMethod = 'tunai';
  let discountType = 'nominal';

  v.innerHTML = `
    <div class="pos">
      <!-- Sisi Kiri: Katalog Menu -->
      <section>
        <div class="catalog-header">
          <div class="search-box">
            <span class="search-icon">${svg('search', 18)}</span>
            <input id="q" placeholder="Cari kopi, pastry, makanan..." autocomplete="off">
            <button class="clear-btn" id="qc">${svg('x', 16)}</button>
          </div>
          <div class="categories-bar" id="cat-bar">
            <button class="chip active" data-cat="">Semua Kategori</button>
            ${cats.map(c => `
              <button class="chip" data-cat="${c.id}">
                ${c.nama_kategori === 'Coffee' ? svg('coffee', 14) : ''}
                ${esc(c.nama_kategori)}
              </button>
            `).join('')}
          </div>
        </div>

        <div id="grid" class="grid"></div>
      </section>

      <!-- Sisi Kanan: Tiket Pesanan / Keranjang -->
      <aside class="cart-panel">
        <div class="cart-header">
          <div class="cart-header-top">
            <span class="invoice-badge">${inv.invoice_number}</span>
            <span style="font-size:11.5px; color:var(--text-muted); font-weight:600">${new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          </div>

          <!-- Tipe Pesanan: Dine-In / Takeaway -->
          <div class="segmented-control" id="sc-tipe">
            <button class="segmented-btn active" data-type="dine-in">
              ${svg('dinein', 15)} Dine-In
            </button>
            <button class="segmented-btn" data-type="takeaway">
              ${svg('takeaway', 15)} Takeaway
            </button>
          </div>

          <div id="meja-box">
            <label style="margin-bottom:4px">
              <span>Pilih No. Meja:</span>
            </label>
            <div class="quick-tables" id="qt-box">
              ${['1', '2', '3', '4', '5', '6', 'VIP', 'Outdoor'].map(m => `
                <button type="button" class="table-chip ${m === '1' ? 'active' : ''}" data-tb="${m}">Meja ${m}</button>
              `).join('')}
            </div>
            <input id="meja" placeholder="Nomor meja (contoh: 12 / Bar / Sofa)" value="1">
          </div>

          <label style="margin-top:8px">
            <span>Nama Pemesan / Catatan:</span>
            <input id="nama" placeholder="Contoh: Mas Dimas / Meja pojok" maxlength="60">
          </label>
        </div>

        <!-- Daftar Item di Keranjang -->
        <div id="lines" class="cart-items"></div>

        <!-- Pengaturan Diskon -->
        <div style="background:var(--bg-surface-subtle); border-radius:var(--radius-md); padding:10px; margin-bottom:12px; border:1px solid var(--border-subtle)">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px">
            <span style="font-size:12px; font-weight:700; color:var(--text-secondary)">Pemberian Diskon</span>
            <div class="segmented-control" style="margin:0; width:150px">
              <button class="segmented-btn active" id="dt-nom" style="padding:4px 8px; font-size:11px">Rp</button>
              <button class="segmented-btn" id="dt-pct" style="padding:4px 8px; font-size:11px">%</button>
            </div>
          </div>
          <input id="dv" type="number" min="0" value="0" placeholder="Nilai diskon (0)">
        </div>

        <!-- Ringkasan Tagihan -->
        <div id="sum"></div>

        <!-- Pilihan Metode Bayar -->
        <div style="margin-top:14px">
          <label><span>Metode Pembayaran:</span></label>
          <div class="payment-methods-grid" id="pm-grid">
            <div class="payment-method-card active" data-m="tunai">
              ${svg('cash', 18)} <span>Tunai</span>
            </div>
            <div class="payment-method-card" data-m="qris">
              ${svg('qris', 18)} <span>QRIS</span>
            </div>
            <div class="payment-method-card" data-m="transfer">
              ${svg('transfer', 18)} <span>Transfer</span>
            </div>
            <div class="payment-method-card" data-m="debit">
              ${svg('card', 18)} <span>Debit</span>
            </div>
          </div>
        </div>

        <!-- Pembayaran Tunai & Uang Cepat -->
        <div id="cash-section">
          <div class="quick-cash-row">
            <button class="quick-cash-btn" data-qc="exact">Uang Pas</button>
            <button class="quick-cash-btn" data-qc="50000">50.000</button>
            <button class="quick-cash-btn" data-qc="100000">100.000</button>
            <button class="quick-cash-btn" data-qc="200000">200.000</button>
          </div>
          <input id="bayar" type="number" min="0" placeholder="Nominal uang diterima (Rp)">
          <div id="kembali"></div>
        </div>

        <!-- Tombol Checkout -->
        <button class="btn pri" id="simpan" style="width:100%; height:46px; font-size:15px; margin-top:14px; border-radius:var(--radius-md)">
          ${svg('check', 18)} Bayar & Simpan Transaksi
        </button>
      </aside>
    </div>`;

  const grid = () => {
    const filtered = prods.filter(p => (!cat || p.category_id == cat) && p.nama_produk.toLowerCase().includes(q));
    if (!filtered.length) {
      $('#grid').innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px 16px; color: var(--text-muted); background: #fff; border-radius: var(--radius-lg); border: 1px dashed var(--border-default);">
          ${svg('coffee', 36)}
          <p style="font-weight: 700; margin-top: 10px; color: var(--text-main);">Menu tidak ditemukan</p>
          <small>Coba gunakan kata kunci pencarian atau kategori lain</small>
        </div>`;
      return;
    }

    $('#grid').innerHTML = filtered.map(p => {
      const inCart = cart.find(x => x.p.id === p.id);
      const isOut = p.stok < 1;
      const isLow = p.stok <= p.min_stok;

      let stockBadge = `<span class="item-stock">Stok: ${p.stok}</span>`;
      if (isOut) stockBadge = `<span class="item-stock empty">Habis</span>`;
      else if (isLow) stockBadge = `<span class="item-stock low">Sisa ${p.stok}</span>`;

      return `
        <button class="item ${isOut ? 'out' : ''} ${inCart ? 'in-cart' : ''}" data-p="${p.id}" ${isOut ? 'disabled' : ''}>
          <div class="item-top">
            <span class="item-cat">${esc(p.nama_kategori)}</span>
            ${inCart ? `<span class="item-cart-count">${inCart.qty}x</span>` : ''}
          </div>
          <b class="item-name">${esc(p.nama_produk)}</b>
          <div class="item-footer">
            <span class="item-price">${rp(p.harga_jual)}</span>
            ${stockBadge}
          </div>
        </button>`;
    }).join('');
  };

  const calc = () => {
    const sub = cart.reduce((s, l) => s + l.p.harga_jual * l.qty, 0);
    const dv = Math.max(0, +$('#dv').value || 0);
    const dis = discountType === 'persen'
      ? Math.round(sub * Math.min(dv, 100) / 100)
      : Math.min(Math.round(dv), sub);
    const pjk = Math.round((sub - dis) * 0.1);
    const g = sub - dis + pjk;

    $('#sum').innerHTML = `
      <div class="tot"><span>Subtotal Produk</span><span>${rp(sub)}</span></div>
      ${dis > 0 ? `<div class="tot" style="color:var(--danger)"><span>Diskon Terpotong</span><span>-${rp(dis)}</span></div>` : ''}
      <div class="tot"><span>Pajak Restoran (PB1 10%)</span><span>${rp(pjk)}</span></div>
      <div class="tot g"><span>Total Tagihan</span><span>${rp(g)}</span></div>`;

    const isTunai = paymentMethod === 'tunai';
    $('#cash-section').style.display = isTunai ? 'block' : 'none';

    if (isTunai) {
      const bayarVal = +$('#bayar').value || 0;
      if (bayarVal >= g && g > 0) {
        $('#kembali').innerHTML = `
          <div class="change-alert">
            <span>Uang Kembali:</span>
            <b>${rp(bayarVal - g)}</b>
          </div>`;
      } else {
        $('#kembali').innerHTML = '';
      }
    } else {
      $('#kembali').innerHTML = '';
    }

    return g;
  };

  const lines = () => {
    if (!cart.length) {
      $('#lines').innerHTML = `
        <div class="empty-cart-state">
          ${svg('pos', 32)}
          <p style="font-weight: 600; font-size: 13px;">Pesanan masih kosong</p>
          <small>Pilih menu di katalog sebelah kiri</small>
        </div>`;
      calc();
      grid();
      return;
    }

    $('#lines').innerHTML = cart.map((l, i) => `
      <div class="line">
        <div class="line-main">
          <div class="line-info">
            <div class="line-name">${esc(l.p.nama_produk)}</div>
            <div class="line-unit-price">${rp(l.p.harga_jual)} / ${esc(l.p.unit || 'porsi')}</div>
          </div>
          <div class="line-right">
            <div class="qty-stepper">
              <button data-m="${i}" title="Kurangi">${l.qty === 1 ? svg('trash', 13) : svg('minus', 13)}</button>
              <span>${l.qty}</span>
              <button data-a="${i}" title="Tambah">${svg('plus', 13)}</button>
            </div>
            <span class="line-total">${rp(l.p.harga_jual * l.qty)}</span>
          </div>
        </div>
        <input class="line-note-input" data-n="${i}" placeholder="Catatan (Less Ice, Extra Shot...)" maxlength="120" value="${esc(l.note)}">
        <div class="quick-notes" data-idx="${i}">
          ${['Less Ice', 'No Sugar', 'Less Sugar', 'Extra Shot', 'Hot'].map(note => `
            <button type="button" class="note-pill" data-quicknote="${note}">${note}</button>
          `).join('')}
        </div>
      </div>
    `).join('');

    calc();
    grid();
  };

  const add = id => {
    const p = prods.find(x => x.id == id);
    if (!p) return;
    const l = cart.find(x => x.p.id == id);
    const n = l ? l.qty : 0;
    if (n + 1 > p.stok) return toast(`Stok menu ${p.nama_produk} hanya tersisa ${p.stok}`, false);
    if (l) l.qty++;
    else cart.push({ p, qty: 1, note: '' });
    lines();
  };

  // Search & Filter Events
  $('#q').oninput = e => {
    q = e.target.value.toLowerCase().trim();
    $('#qc').style.display = q ? 'block' : 'none';
    grid();
  };

  $('#qc').onclick = () => {
    $('#q').value = '';
    q = '';
    $('#qc').style.display = 'none';
    grid();
  };

  $('#cat-bar').onclick = e => {
    const chip = e.target.closest('[data-cat]');
    if (!chip) return;
    $$('#cat-bar .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    cat = chip.dataset.cat;
    grid();
  };

  $('#grid').onclick = e => {
    const b = e.target.closest('[data-p]');
    if (b && !b.disabled) add(b.dataset.p);
  };

  // Cart Interactions
  $('#lines').onclick = e => {
    const a = e.target.closest('[data-a]');
    const m = e.target.closest('[data-m]');
    const qn = e.target.closest('[data-quicknote]');

    if (a) add(cart[a.dataset.a].p.id);
    if (m) {
      const l = cart[m.dataset.m];
      if (--l.qty < 1) cart.splice(m.dataset.m, 1);
      lines();
    }
    if (qn) {
      const idx = qn.closest('[data-idx]').dataset.idx;
      const cur = cart[idx].note;
      cart[idx].note = cur ? `${cur}, ${qn.dataset.quicknote}` : qn.dataset.quicknote;
      lines();
    }
  };

  $('#lines').oninput = e => {
    if (e.target.dataset.n) {
      cart[e.target.dataset.n].note = e.target.value;
    }
  };

  // Order Type Toggle
  $('#sc-tipe').onclick = e => {
    const btn = e.target.closest('[data-type]');
    if (!btn) return;
    $$('#sc-tipe .segmented-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    orderType = btn.dataset.type;
    $('#meja-box').style.display = orderType === 'dine-in' ? 'block' : 'none';
  };

  // Quick Table Picker
  $('#qt-box').onclick = e => {
    const b = e.target.closest('[data-tb]');
    if (!b) return;
    $$('#qt-box .table-chip').forEach(c => c.classList.remove('active'));
    b.classList.add('active');
    tableNo = b.dataset.tb;
    $('#meja').value = tableNo;
  };

  $('#meja').oninput = e => {
    tableNo = e.target.value;
    $$('#qt-box .table-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.tb === tableNo);
    });
  };

  // Discount Type Segmented Control
  $('#dt-nom').onclick = () => {
    discountType = 'nominal';
    $('#dt-nom').classList.add('active');
    $('#dt-pct').classList.remove('active');
    $('#dv').placeholder = 'Nominal diskon (Rp)';
    calc();
  };

  $('#dt-pct').onclick = () => {
    discountType = 'persen';
    $('#dt-pct').classList.add('active');
    $('#dt-nom').classList.remove('active');
    $('#dv').placeholder = 'Persen diskon (0 - 100%)';
    calc();
  };

  $('#dv').oninput = calc;

  // Payment Method Selection
  $('#pm-grid').onclick = e => {
    const card = e.target.closest('[data-m]');
    if (!card) return;
    $$('#pm-grid .payment-method-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    paymentMethod = card.dataset.m;
    calc();
  };

  // Quick Cash Buttons
  $('#cash-section').onclick = e => {
    const b = e.target.closest('[data-qc]');
    if (!b) return;
    const g = calc();
    if (b.dataset.qc === 'exact') {
      $('#bayar').value = g;
    } else {
      $('#bayar').value = b.dataset.qc;
    }
    calc();
  };

  $('#bayar').oninput = calc;

  // Checkout Action
  $('#simpan').onclick = async () => {
    if (!cart.length) return toast('Pilih minimal 1 item pesanan terlebih dahulu', false);
    if (orderType === 'dine-in' && !$('#meja').value.trim()) {
      return toast('Nomor meja wajib diisi untuk pesanan Dine-In', false);
    }
    const g = calc();
    if (paymentMethod === 'tunai' && (+$('#bayar').value || 0) < g) {
      return toast('Uang pembayaran tunai kurang dari total tagihan', false);
    }

    $('#simpan').disabled = true;
    $('#simpan').innerHTML = `Memproses...`;

    try {
      const r = await api('/api/orders', {
        method: 'POST',
        body: {
          tipe_pesanan: orderType,
          nomor_meja: orderType === 'dine-in' ? $('#meja').value.trim() : null,
          nama_pemesan: $('#nama').value.trim(),
          items: cart.map(l => ({ product_id: l.p.id, qty: l.qty, catatan: l.note })),
          diskon_tipe: discountType,
          diskon_nilai: $('#dv').value,
          metode_bayar: paymentMethod,
          uang_dibayar: paymentMethod === 'tunai' ? $('#bayar').value : g
        }
      });
      toast('Transaksi berhasil disimpan!');
      await pos(v);
      await showReceipt(r.id);
    } catch (e) {
      toast(e.message, false);
      $('#simpan').disabled = false;
      $('#simpan').innerHTML = `${svg('check', 18)} Bayar & Simpan Transaksi`;
    }
  };

  grid();
  lines();
}

// ---------- Riwayat ----------
async function riwayat(v) {
  const rows = await api('/api/orders?limit=100');
  v.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2>${me.role === 'admin' ? 'Riwayat Semua Transaksi' : 'Riwayat Transaksi Saya'}</h2>
          <small>Daftar 100 transaksi terbaru</small>
        </div>
      </div>
      <div id="t">${ordersTable(rows, true)}</div>
    </div>`;

  v.onclick = async e => {
    const b = e.target.closest('[data-st]');
    if (!b) return;
    const isCancel = b.dataset.st === 'Dibatalkan';
    if (isCancel && !confirm('Yakin ingin membatalkan pesanan ini? Stok produk akan dikembalikan.')) return;
    try {
      await api(`/api/orders/${b.dataset.id}/status`, {
        method: 'PATCH',
        body: { status: b.dataset.st }
      });
      toast(`Status pesanan berhasil diubah menjadi ${b.dataset.st}`);
      riwayat(v);
    } catch (x) {
      toast(x.message, false);
    }
  };
}

// ---------- Laporan (Admin) ----------
async function laporan(v) {
  const cats = await api('/api/categories');
  const t = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

  v.innerHTML = `
    <div class="card noprint">
      <div class="card-header">
        <div>
          <h2>Filter Laporan Penjualan</h2>
          <small>Sesuaikan rentang tanggal, kategori produk, dan metode bayar</small>
        </div>
      </div>
      <div class="row">
        <label>
          <span>Dari Tanggal</span>
          <input type="date" id="f" value="${t.slice(0, 8)}01">
        </label>
        <label>
          <span>Sampai Tanggal</span>
          <input type="date" id="t" value="${t}">
        </label>
        <label>
          <span>Kategori</span>
          <select id="k">
            <option value="">Semua Kategori</option>
            ${cats.map(c => `<option value="${c.id}">${esc(c.nama_kategori)}</option>`).join('')}
          </select>
        </label>
        <label>
          <span>Metode Bayar</span>
          <select id="m">
            <option value="">Semua Metode</option>
            ${Object.entries(METODE).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="row" style="margin-top: 14px; justify-content: flex-end;">
        <button class="btn pri" id="go">${svg('search', 15)} Terapkan Filter</button>
        <a class="btn" id="csv">${svg('download', 15)} Ekspor Excel/CSV</a>
        <button class="btn" id="pdf">${svg('print', 15)} Cetak Laporan (PDF)</button>
      </div>
    </div>
    <div id="rs"></div>`;

  const load = async () => {
    const qs = new URLSearchParams({
      from: $('#f').value,
      to: $('#t').value,
      kategori: $('#k').value,
      metode: $('#m').value
    });
    const d = await api('/api/reports?' + qs);
    const s = d.summary;
    $('#csv').href = '/api/reports/export?' + qs;

    $('#rs').innerHTML = `
      <div class="card-header" style="margin-top: 24px;">
        <div>
          <h3>Laporan Penjualan Titik Temu Kopi</h3>
          <small>Periode: <b>${$('#f').value}</b> s/d <b>${$('#t').value}</b></small>
        </div>
      </div>
      <div class="kpis">
        <div class="kpi-card">
          <div class="kpi-icon omset">${svg('omset', 20)}</div>
          <div class="kpi-info">
            <small>Omset Bruto</small>
            <b>${rp(s.bruto)}</b>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon pesanan">${svg('pos', 20)}</div>
          <div class="kpi-info">
            <small>Total Diskon</small>
            <b style="color:var(--danger)">-${rp(s.diskon)}</b>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon terlaris">${svg('star', 20)}</div>
          <div class="kpi-info">
            <small>Pajak Restoran (PB1)</small>
            <b>${rp(s.pajak)}</b>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon omset">${svg('omset', 20)}</div>
          <div class="kpi-info">
            <small>Omset Bersih (Netto)</small>
            <b style="color:var(--success)">${rp(s.bersih)}</b>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon pesanan">${svg('pos', 20)}</div>
          <div class="kpi-info">
            <small>Rata-rata Transaksi (AOV)</small>
            <b>${rp(s.aov)}</b>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="scroll">
          <table>
            <thead>
              <tr>
                <th>No. Faktur</th>
                <th>Tanggal & Jam</th>
                <th>Kasir</th>
                <th>Tipe</th>
                <th style="text-align:center">Item</th>
                <th style="text-align:right">Subtotal</th>
                <th style="text-align:right">PB1</th>
                <th style="text-align:right">Grand Total</th>
                <th style="text-align:center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${d.rows.map(o => `
                <tr>
                  <td><b style="font-family:'JetBrains Mono', monospace; font-size:12px">${o.invoice_number}</b></td>
                  <td><small>${o.created_at}</small></td>
                  <td>${esc(o.kasir)}</td>
                  <td><span class="badge" style="background:var(--bg-surface-subtle); border:1px solid var(--border-default)">${o.tipe_pesanan}</span></td>
                  <td style="text-align:center">${o.item_terjual}</td>
                  <td style="text-align:right; font-family:'JetBrains Mono', monospace">${rp(o.total_subtotal)}</td>
                  <td style="text-align:right; font-family:'JetBrains Mono', monospace">${rp(o.pajak_nominal)}</td>
                  <td style="text-align:right"><b style="font-family:'JetBrains Mono', monospace; color:var(--brand-800)">${rp(o.grand_total)}</b></td>
                  <td style="text-align:center"><span class="badge ${o.status}">${o.status}</span></td>
                </tr>
              `).join('') || '<tr><td colspan="9" style="text-align:center; padding:30px">Tidak ada data transaksi pada filter ini</td></tr>'}
            </tbody>
          </table>
        </div>
        <div style="margin-top:12px; font-size:12px; color:var(--text-muted)">
          Catatan: Ringkasan penjualan tidak menghitung transaksi yang berstatus Dibatalkan. Omset Bersih = Bruto − Diskon.
        </div>
      </div>`;
  };

  $('#go').onclick = () => load().catch(e => toast(e.message, false));
  $('#pdf').onclick = () => window.print();
  load();
}

// ---------- Menu & Stok (Admin) ----------
async function menu(v) {
  const [cats, prods] = await Promise.all([
    api('/api/categories'),
    api('/api/products?all=1')
  ]);

  const pf = [
    { k: 'kode_produk', l: 'Kode Produk (SKU)' },
    { k: 'nama_produk', l: 'Nama Menu' },
    { k: 'category_id', l: 'Kategori', t: 'select', o: cats.map(c => [c.id, c.nama_kategori]) },
    { k: 'harga_jual', l: 'Harga Jual (Rp)', t: 'number' },
    { k: 'harga_pokok', l: 'Harga Pokok (HPP Rp)', t: 'number' },
    { k: 'stok', l: 'Jumlah Stok Saat Ini', t: 'number' },
    { k: 'min_stok', l: 'Batas Minimum Stok', t: 'number' },
    { k: 'unit', l: 'Satuan Porsi (contoh: cup / porsi / pcs)' },
    { k: 'aktif', l: 'Status Menu', t: 'select', o: [[1, 'Aktif (Tampil di POS)'], [0, 'Nonaktif (Disembunyikan)']] }
  ];

  const cf = [
    { k: 'nama_kategori', l: 'Nama Kategori Baru' },
    { k: 'status', l: 'Status Kategori', t: 'select', o: [['aktif', 'Aktif'], ['nonaktif', 'Nonaktif']] }
  ];

  v.innerHTML = `
    <div class="card-header">
      <div>
        <h2>Manajemen Menu & Stok Bahan</h2>
        <small>Kelola katalog produk, harga jual, HPP, serta pantau stok minimum</small>
      </div>
      <div class="row" style="margin:0">
        <button class="btn pri" id="ap">${svg('plus', 16)} <span>Tambah Menu</span></button>
        <button class="btn" id="ac">${svg('plus', 16)} <span>Tambah Kategori</span></button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Kategori Produk</h3>
        <small>Klik kategori untuk mengedit nama atau statusnya</small>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px">
        ${cats.map(c => `
          <button class="chip" data-ec="${c.id}">
            ${esc(c.nama_kategori)}
            ${c.status !== 'aktif' ? '<span style="color:var(--danger)">(Nonaktif)</span>' : ''}
          </button>
        `).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Katalog Produk (${prods.length} Menu)</h3>
      </div>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Menu</th>
              <th>Kategori</th>
              <th style="text-align:right">Harga Jual</th>
              <th style="text-align:right">HPP</th>
              <th style="text-align:center">Stok</th>
              <th style="text-align:center">Min.</th>
              <th style="text-align:center">Status</th>
              <th style="text-align:center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${prods.map(p => {
              const isLow = p.stok < p.min_stok;
              return `
                <tr class="${isLow ? 'low' : ''}">
                  <td><b style="font-family:'JetBrains Mono', monospace; font-size:12px">${esc(p.kode_produk)}</b></td>
                  <td><b>${esc(p.nama_produk)}</b></td>
                  <td><span class="chip" style="margin:0; padding:2px 8px; font-size:11.5px">${esc(p.nama_kategori)}</span></td>
                  <td style="text-align:right; font-family:'JetBrains Mono', monospace">${rp(p.harga_jual)}</td>
                  <td style="text-align:right; font-family:'JetBrains Mono', monospace; color:var(--text-muted)">${rp(p.harga_pokok)}</td>
                  <td style="text-align:center">
                    <span class="badge" style="${isLow ? 'background:var(--warning-bg); color:var(--warning-text); border:1px solid var(--warning-border)' : ''}">
                      ${p.stok} ${esc(p.unit || 'porsi')}
                    </span>
                  </td>
                  <td style="text-align:center; color:var(--text-muted)">${p.min_stok}</td>
                  <td style="text-align:center">
                    <span class="badge ${p.aktif ? 'Selesai' : 'Dibatalkan'}">${p.aktif ? 'Aktif' : 'Nonaktif'}</span>
                  </td>
                  <td style="text-align:center">
                    <button class="btn" style="padding:4px 10px; font-size:12px" data-ep="${p.id}">
                      Ubah
                    </button>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  const done = m => async b => {
    await m(b);
    toast('Data menu/kategori berhasil disimpan');
    menu(v);
  };

  $('#ap').onclick = () => formModal('Tambah Menu Baru', pf, { aktif: 1, min_stok: 5, stok: 10, harga_pokok: 0, unit: 'porsi' }, done(b => api('/api/products', { method: 'POST', body: b })));
  $('#ac').onclick = () => formModal('Tambah Kategori Baru', cf, {}, done(b => api('/api/categories', { method: 'POST', body: b })));

  v.onclick = e => {
    const p = e.target.closest('[data-ep]');
    const c = e.target.closest('[data-ec]');
    if (p) {
      const o = prods.find(x => x.id == p.dataset.ep);
      formModal('Ubah Menu', pf, o, done(b => api('/api/products/' + o.id, { method: 'PUT', body: b })));
    }
    if (c) {
      const o = cats.find(x => x.id == c.dataset.ec);
      formModal('Ubah Kategori', cf, o, done(b => api('/api/categories/' + o.id, { method: 'PUT', body: b })));
    }
  };
}

// ---------- Pengguna (Admin) ----------
async function users(v) {
  const list = await api('/api/users');
  const f = isNew => [
    ...(isNew ? [{ k: 'username', l: 'Username (huruf/angka)' }] : []),
    { k: 'nama_lengkap', l: 'Nama Lengkap Pegawai' },
    { k: 'role', l: 'Peran / Hak Akses', t: 'select', o: [['kasir', 'Kasir / Waiter'], ['admin', 'Administrator / Manajer']] },
    { k: 'status', l: 'Status Akun', t: 'select', o: [['aktif', 'Aktif'], ['nonaktif', 'Nonaktif']] },
    { k: 'password', l: isNew ? 'Password (minimal 6 karakter)' : 'Password Baru (kosongkan jika tidak ingin mengubah)', t: 'password' }
  ];

  v.innerHTML = `
    <div class="card-header">
      <div>
        <h2>Manajemen Pengguna & Kasir</h2>
        <small>Kelola akun staf kasir dan administrator sistem</small>
      </div>
      <button class="btn pri" id="au">${svg('plus', 16)} <span>Tambah Pengguna</span></button>
    </div>

    <div class="card">
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Nama Lengkap</th>
              <th>Peran</th>
              <th style="text-align:center">Status</th>
              <th>Terdaftar</th>
              <th style="text-align:center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(u => `
              <tr>
                <td>#${u.id}</td>
                <td><b style="font-family:'JetBrains Mono', monospace">${esc(u.username)}</b></td>
                <td>${esc(u.nama_lengkap)}</td>
                <td>
                  <span class="badge" style="background:var(--bg-surface-subtle); border:1px solid var(--border-default)">
                    ${u.role === 'admin' ? '👑 Admin' : '☕ Kasir'}
                  </span>
                </td>
                <td style="text-align:center">
                  <span class="badge ${u.status === 'aktif' ? 'Selesai' : 'Dibatalkan'}">
                    ${u.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td><small>${u.created_at}</small></td>
                <td style="text-align:center">
                  <button class="btn" style="padding:4px 10px; font-size:12px" data-eu="${u.id}">
                    Ubah
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  const done = m => async b => {
    await m(b);
    toast('Data pengguna berhasil diperbarui');
    users(v);
  };

  $('#au').onclick = () => formModal('Tambah Pengguna Baru', f(true), { role: 'kasir', status: 'aktif' }, done(b => api('/api/users', { method: 'POST', body: b })));

  v.onclick = e => {
    const b = e.target.closest('[data-eu]');
    if (b) {
      const o = list.find(x => x.id == b.dataset.eu);
      formModal('Ubah Pengguna', f(false), o, done(x => api('/api/users/' + o.id, { method: 'PUT', body: x })));
    }
  };
}

// Inisialisasi awal
api('/api/me')
  .then(u => {
    me = u;
    shell();
  })
  .catch(showLogin);
