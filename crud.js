/* HiFive Inventory — Master Data CRUD
   Front-end CRUD persistence uses localStorage for prototype/testing.
   Replace the storage adapter with the team's API when the MySQL backend is ready. */
(function () {
  'use strict';

  const STORAGE_KEY = 'hifive_master_data_v1';
  const PAGE_SIZE = 5;
  const MASTER_KEYS = new Set(['barang', 'kategori', 'satuan', 'supplier', 'pengguna']);
  let activePage = 1;
  let activeFilters = { query: '', status: '', relation: '' };

  const SEED = {
    categories: [
      { id: 'ktg-001', code: 'KTG-01', name: 'Makanan', description: 'Makanan dan produk siap saji', status: 'Aktif', createdAt: '2026-01-12T08:00:00.000Z' },
      { id: 'ktg-002', code: 'KTG-02', name: 'Minuman', description: 'Air mineral dan minuman kemasan', status: 'Aktif', createdAt: '2026-01-12T08:00:00.000Z' },
      { id: 'ktg-003', code: 'KTG-03', name: 'Sembako', description: 'Kebutuhan pokok sehari-hari', status: 'Aktif', createdAt: '2026-01-13T08:00:00.000Z' },
      { id: 'ktg-004', code: 'KTG-04', name: 'Bakery', description: 'Roti dan produk bakery', status: 'Aktif', createdAt: '2026-01-13T08:00:00.000Z' },
      { id: 'ktg-005', code: 'KTG-05', name: 'Perawatan Diri', description: 'Produk perawatan pribadi', status: 'Aktif', createdAt: '2026-01-14T08:00:00.000Z' }
    ],
    units: [
      { id: 'st-001', code: 'ST-01', name: 'Pieces', symbol: 'pcs', description: 'Produk satuan', status: 'Aktif' },
      { id: 'st-002', code: 'ST-02', name: 'Botol', symbol: 'btl', description: 'Minuman kemasan', status: 'Aktif' },
      { id: 'st-003', code: 'ST-03', name: 'Kilogram', symbol: 'kg', description: 'Beras dan telur', status: 'Aktif' },
      { id: 'st-004', code: 'ST-04', name: 'Liter', symbol: 'L', description: 'Minyak dan cairan', status: 'Aktif' },
      { id: 'st-005', code: 'ST-05', name: 'Kotak', symbol: 'box', description: 'Susu dan kemasan', status: 'Aktif' }
    ],
    suppliers: [
      { id: 'sup-001', code: 'SUP-001', name: 'Indofood', contact: 'Customer Service', phone: '0711-100200', email: 'sales@indofood.co.id', city: 'Palembang', address: 'Jl. Industri No. 10', status: 'Aktif' },
      { id: 'sup-002', code: 'SUP-002', name: 'Danone', contact: 'Sales Area', phone: '0711-300400', email: 'halo@danone.co.id', city: 'Palembang', address: 'Jl. Demang Lebar Daun', status: 'Aktif' },
      { id: 'sup-003', code: 'SUP-003', name: 'CV Sejahtera', contact: 'Budi Santoso', phone: '0711-500600', email: 'order@sejahtera.co.id', city: 'Palembang', address: 'Jl. Veteran No. 21', status: 'Aktif' },
      { id: 'sup-004', code: 'SUP-004', name: 'Sari Roti', contact: 'Mitra Distribusi', phone: '0711-700800', email: 'mitra@sariroti.id', city: 'Palembang', address: 'Jl. Soekarno Hatta', status: 'Aktif' },
      { id: 'sup-005', code: 'SUP-005', name: 'Ultrajaya', contact: 'Sales Representative', phone: '0711-900100', email: 'sales@ultrajaya.co.id', city: 'Palembang', address: 'Jl. Kolonel H. Burlian', status: 'Aktif' }
    ],
    items: [
      { id: 'brg-001', code: 'BRG-001', name: 'Indomie Goreng', categoryId: 'ktg-001', unitId: 'st-001', supplierId: 'sup-001', purchasePrice: 2400, salePrice: 3000, stock: 50, minStock: 10, status: 'Aktif' },
      { id: 'brg-002', code: 'BRG-002', name: 'Aqua 600 ml', categoryId: 'ktg-002', unitId: 'st-002', supplierId: 'sup-002', purchasePrice: 2800, salePrice: 3500, stock: 120, minStock: 20, status: 'Aktif' },
      { id: 'brg-003', code: 'BRG-003', name: 'Telur Ayam', categoryId: 'ktg-003', unitId: 'st-003', supplierId: 'sup-003', purchasePrice: 26000, salePrice: 28000, stock: 8, minStock: 10, status: 'Aktif' },
      { id: 'brg-004', code: 'BRG-004', name: 'Roti Tawar', categoryId: 'ktg-004', unitId: 'st-001', supplierId: 'sup-004', purchasePrice: 12000, salePrice: 15000, stock: 75, minStock: 15, status: 'Aktif' },
      { id: 'brg-005', code: 'BRG-005', name: 'Susu UHT 1 L', categoryId: 'ktg-002', unitId: 'st-005', supplierId: 'sup-005', purchasePrice: 15500, salePrice: 18000, stock: 5, minStock: 12, status: 'Aktif' }
    ]
  };

  const CONFIG = {
    barang: {
      title: 'Barang', crumb: 'MASTER DATA', icon: 'Barang',
      description: 'Kelola katalog produk, kode barang, satuan, harga, dan batas minimum stok.',
      add: 'Tambah Barang', search: 'Cari barang berdasarkan kode atau nama...',
      columns: ['KODE', 'NAMA BARANG', 'KATEGORI', 'SATUAN', 'SUPPLIER', 'STOK', 'HARGA JUAL', 'STATUS', 'AKSI'],
      fields: [
        { name: 'code', label: 'Kode Barang / SKU', required: true, placeholder: 'Contoh: BRG-006' },
        { name: 'name', label: 'Nama Barang', required: true, placeholder: 'Masukkan nama barang' },
        { name: 'categoryId', label: 'Kategori', type: 'select', required: true, options: 'categories' },
        { name: 'unitId', label: 'Satuan', type: 'select', required: true, options: 'units' },
        { name: 'supplierId', label: 'Supplier', type: 'select', required: true, options: 'suppliers', full: true },
        { name: 'purchasePrice', label: 'Harga Beli (Rp)', type: 'number', required: true, min: '0', step: '1', placeholder: 'Contoh: 2500' },
        { name: 'salePrice', label: 'Harga Jual (Rp)', type: 'number', required: true, min: '0', step: '1', placeholder: 'Contoh: 3000' },
        { name: 'stock', label: 'Stok Saat Ini', type: 'number', required: true, min: '0', step: '0.01', placeholder: 'Masukkan jumlah stok' },
        { name: 'minStock', label: 'Batas Minimum Stok', type: 'number', required: true, min: '0', step: '0.01', placeholder: 'Contoh: 10' }
      ],
      formSections: [
        { title: 'Informasi Barang', description: 'Identitas dan hubungan barang dengan master data.', fields: ['code','name','categoryId','unitId','supplierId'] },
        { title: 'Harga & Persediaan', description: 'Harga beli, harga jual, stok saat ini, dan batas minimum.', fields: ['purchasePrice','salePrice','stock','minStock'] }
      ]
    },
    kategori: {
      title: 'Kategori', crumb: 'MASTER DATA', icon: 'Kategori',
      description: 'Kelompokkan produk agar pencarian dan pengelolaan persediaan lebih mudah.',
      add: 'Tambah Kategori', search: 'Cari kategori...',
      columns: ['KODE', 'NAMA KATEGORI', 'DESKRIPSI', 'JUMLAH BARANG', 'DIBUAT PADA', 'STATUS', 'AKSI'],
      fields: [
        { name: 'code', label: 'Kode Kategori', required: true, placeholder: 'Contoh: KTG-06' },
        { name: 'name', label: 'Nama Kategori', required: true, placeholder: 'Masukkan nama kategori' },
        { name: 'description', label: 'Deskripsi', type: 'textarea', full: true, placeholder: 'Keterangan kategori' },
        { name: 'status', label: 'Status', type: 'select', options: 'status' }
      ]
    },
    satuan: {
      title: 'Satuan', crumb: 'MASTER DATA', icon: 'Satuan',
      description: 'Atur satuan pengukuran yang digunakan pada pencatatan stok dan transaksi.',
      add: 'Tambah Satuan', search: 'Cari satuan...',
      columns: ['KODE', 'NAMA SATUAN', 'SIMBOL', 'CONTOH PENGGUNAAN', 'JUMLAH BARANG', 'STATUS', 'AKSI'],
      fields: [
        { name: 'code', label: 'Kode Satuan', required: true, placeholder: 'Contoh: ST-06' },
        { name: 'name', label: 'Nama Satuan', required: true, placeholder: 'Contoh: Dus' },
        { name: 'symbol', label: 'Simbol', required: true, placeholder: 'Contoh: dsn' },
        { name: 'description', label: 'Contoh Penggunaan', type: 'textarea', full: true, placeholder: 'Contoh penggunaan satuan' },
        { name: 'status', label: 'Status', type: 'select', options: 'status' }
      ]
    },
    supplier: {
      title: 'Supplier', crumb: 'MASTER DATA', icon: 'Supplier',
      description: 'Kelola informasi pemasok dan pantau hubungan pembelian barang.',
      add: 'Tambah Supplier', search: 'Cari supplier...',
      columns: ['KODE', 'NAMA SUPPLIER', 'KONTAK', 'EMAIL', 'KOTA', 'TOTAL BARANG', 'STATUS', 'AKSI'],
      fields: [
        { name: 'code', label: 'Kode Supplier', required: true, placeholder: 'Contoh: SUP-006' },
        { name: 'name', label: 'Nama Supplier / Perusahaan', required: true, placeholder: 'Nama perusahaan pemasok' },
        { name: 'contact', label: 'Kontak Person', required: true, placeholder: 'Nama kontak yang bisa dihubungi' },
        { name: 'phone', label: 'Nomor Telepon', required: true, placeholder: '08xxxxxxxxxx' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'supplier@email.com' },
        { name: 'city', label: 'Kota', required: true, placeholder: 'Kota supplier' },
        { name: 'address', label: 'Alamat Supplier', type: 'textarea', required: true, full: true, placeholder: 'Alamat lengkap supplier' },
        { name: 'status', label: 'Status', type: 'select', options: 'status' }
      ]
    },
    pengguna: {
      title: 'Pengguna', crumb: 'PREFERENSI', icon: 'Pengguna',
      description: 'Kelola akun dan hak akses Admin, Petugas Gudang, serta Kasir.',
      add: 'Tambah Pengguna', search: 'Cari nama, username, atau email...',
      columns: ['ID', 'NAMA PENGGUNA', 'EMAIL', 'ROLE', 'TERAKHIR AKTIF', 'STATUS', 'AKSI'],
      fields: [
        { name: 'fullName', label: 'Nama Lengkap', required: true, placeholder: 'Nama lengkap pengguna' },
        { name: 'username', label: 'Username', required: true, placeholder: 'Username untuk login' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'nama@email.com' },
        { name: 'role', label: 'Role / Hak Akses', type: 'select', required: true, options: 'roles' },
        { name: 'status', label: 'Status Akun', type: 'select', options: 'status' },
        { name: 'password', label: 'Password Awal', type: 'password', requiredOnCreate: true, placeholder: 'Minimal 6 karakter', full: true }
      ]
    }
  };

  function isMasterPage(key) { return MASTER_KEYS.has(key); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function escape(value) { return typeof escapeHTML === 'function' ? escapeHTML(value) : String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function getState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && Array.isArray(parsed.items) && Array.isArray(parsed.categories) && Array.isArray(parsed.units) && Array.isArray(parsed.suppliers) ? parsed : null;
    } catch { return null; }
  }
  function saveState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function init() {
    if (!getState()) saveState(clone(SEED));
    enrichExistingUsers();
  }
  function enrichExistingUsers() {
    if (typeof readUsers !== 'function' || typeof writeUsers !== 'function') return;
    const users = readUsers();
    const defaults = {
      admin: { fullName: 'Amanda Nur', email: 'amanda@hifive.store' },
      gudang: { fullName: 'Budi Santoso', email: 'budi@hifive.store' },
      kasir: { fullName: 'Dina Putri', email: 'dina@hifive.store' }
    };
    let changed = false;
    users.forEach((user, index) => {
      const fallback = defaults[user.username] || {};
      if (!user.id) { user.id = `USR-${String(index + 1).padStart(3, '0')}`; changed = true; }
      if (!user.fullName) { user.fullName = fallback.fullName || user.username; changed = true; }
      if (!user.email) { user.email = fallback.email || `${user.username}@hifive.store`; changed = true; }
      if (!user.status) { user.status = 'Aktif'; changed = true; }
      if (!user.lastActive) { user.lastActive = user.createdAt || new Date().toISOString(); changed = true; }
    });
    if (changed) writeUsers(users);
  }
  function getCollection(key) {
    const state = getState() || clone(SEED);
    if (key === 'barang') return state.items;
    if (key === 'kategori') return state.categories;
    if (key === 'satuan') return state.units;
    if (key === 'supplier') return state.suppliers;
    if (key === 'pengguna') return typeof readUsers === 'function' ? readUsers() : [];
    return [];
  }
  function setCollection(key, records) {
    if (key === 'pengguna') { writeUsers(records); return; }
    const state = getState() || clone(SEED);
    if (key === 'barang') state.items = records;
    if (key === 'kategori') state.categories = records;
    if (key === 'satuan') state.units = records;
    if (key === 'supplier') state.suppliers = records;
    saveState(state);
  }
  function stateRef() { return getState() || clone(SEED); }
  function byId(list, id) { return list.find(item => item.id === id); }
  function rupiah(value) { return `Rp${Number(value || 0).toLocaleString('id-ID')}`; }
  function dateLabel(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  }
  function countItems(predicate) { return stateRef().items.filter(predicate).length; }
  function itemStatus(item) {
    const stock = Number(item.stock || 0);
    const minimum = Number(item.minStock || 0);
    if (stock <= 0) return 'Habis';
    if (stock <= minimum) return 'Menipis';
    return 'Aman';
  }
  function itemUnit(item, state) { return byId(state.units, item.unitId)?.symbol || '—'; }
  function itemCategory(item, state) { return byId(state.categories, item.categoryId)?.name || '—'; }
  function itemSupplier(item, state) { return byId(state.suppliers, item.supplierId)?.name || '—'; }
  function users() { return typeof readUsers === 'function' ? readUsers() : []; }
  function canManage() { return Boolean(currentUser && currentUser.role === 'admin'); }
  function badgeFor(status) {
    const normalized = String(status || '').toLowerCase();
    let cls = 'w';
    if (normalized.includes('menipis') || normalized.includes('pending') || normalized.includes('proses')) cls = 'm';
    else if (normalized.includes('habis') || normalized.includes('nonaktif') || normalized.includes('batal')) cls = 'h';
    return `<span class="bd ${cls}">${escape(status)}</span>`;
  }
  function actionButtons(record, key) {
    if (!canManage()) return '<span class="crud-readonly">Lihat</span>';
    const editIcon = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>';
    const deleteIcon = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg>';
    const reset = key === 'pengguna' ? `<button type="button" class="action-btn" title="Reset password" data-crud-action="reset" data-id="${escape(record.id)}"><span class="crud-key-icon">↻</span></button>` : '';
    return `<div class="crud-actions">${reset}<button type="button" class="action-btn" title="Edit data" data-crud-action="edit" data-id="${escape(record.id)}">${editIcon}</button><button type="button" class="action-btn danger" title="Hapus data" data-crud-action="delete" data-id="${escape(record.id)}">${deleteIcon}</button></div>`;
  }
  function makeRows(key) {
    const state = stateRef();
    if (key === 'barang') return state.items.map(item => ({ id: item.id, search: [item.code,item.name,itemCategory(item,state),itemUnit(item,state),itemSupplier(item,state)].join(' '), status: itemStatus(item), category: itemCategory(item,state), record: item, cells: [
      `<strong class="code-text">${escape(item.code)}</strong>`, escape(item.name), escape(itemCategory(item,state)), escape(itemUnit(item,state)), escape(itemSupplier(item,state)), `<span class="number-text">${Number(item.stock).toLocaleString('id-ID')} ${escape(itemUnit(item,state))}</span>`, rupiah(item.salePrice), badgeFor(itemStatus(item)), actionButtons(item,key)
    ] }));
    if (key === 'kategori') return state.categories.map(item => ({ id:item.id, search:[item.code,item.name,item.description].join(' '), status:item.status, record:item, cells:[
      `<strong class="code-text">${escape(item.code)}</strong>`, escape(item.name), escape(item.description || '—'), countItems(x => x.categoryId === item.id), dateLabel(item.createdAt), badgeFor(item.status), actionButtons(item,key)
    ] }));
    if (key === 'satuan') return state.units.map(item => ({ id:item.id, search:[item.code,item.name,item.symbol,item.description].join(' '), status:item.status, record:item, cells:[
      `<strong class="code-text">${escape(item.code)}</strong>`, escape(item.name), `<span class="symbol-chip">${escape(item.symbol)}</span>`, escape(item.description || '—'), countItems(x => x.unitId === item.id), badgeFor(item.status), actionButtons(item,key)
    ] }));
    if (key === 'supplier') return state.suppliers.map(item => ({ id:item.id, search:[item.code,item.name,item.contact,item.phone,item.email,item.city].join(' '), status:item.status, record:item, cells:[
      `<strong class="code-text">${escape(item.code)}</strong>`, escape(item.name), `${escape(item.contact || '—')}<small class="cell-sub">${escape(item.phone || '')}</small>`, escape(item.email || '—'), escape(item.city || '—'), countItems(x => x.supplierId === item.id), badgeFor(item.status), actionButtons(item,key)
    ] }));
    if (key === 'pengguna') return users().map((item,index) => ({ id:item.id || item.username, search:[item.id,item.fullName,item.username,item.email,item.role].join(' '), status:item.status || 'Aktif', role:item.role, record:item, cells:[
      `<strong class="code-text">${escape(item.id || `USR-${String(index+1).padStart(3,'0')}`)}</strong>`, `<span class="user-name-cell">${escape(item.fullName || item.username)}<small class="cell-sub">@${escape(item.username)}</small></span>`, escape(item.email || '—'), badgeFor((({admin:'Admin',gudang:'Petugas Gudang',kasir:'Kasir'})[item.role] || item.role)), escape(item.lastActive ? new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(item.lastActive)) : '—'), badgeFor(item.status || 'Aktif'), actionButtons(item,key)
    ] }));
    return [];
  }
  function statCards(key) {
    const state = stateRef();
    if (key === 'barang') {
      const active = state.items.filter(item => itemStatus(item) === 'Aman').length;
      const low = state.items.filter(item => ['Menipis','Habis'].includes(itemStatus(item))).length;
      return [statCard('Total Barang',String(state.items.length),'Produk terdaftar','#F7C6D6','var(--pinkd)','package','#BD6F8D'),statCard('Stok Aktif',String(active),'Barang tersedia','#CBEBE5','var(--deep)','package','#459F96'),statCard('Stok Menipis',String(low),'Butuh perhatian','#FFE2D0','#D9884A','box','#D9884A')].join('');
    }
    if (key === 'kategori') {
      const linked = state.categories.filter(category => state.items.some(item => item.categoryId === category.id)).length;
      const active = state.categories.filter(item => item.status === 'Aktif').length;
      return [statCard('Total Kategori',String(state.categories.length),'Kategori terdaftar','#F7C6D6','var(--pinkd)','tag','#BD6F8D'),statCard('Barang Terhubung',String(state.items.length),'Terhubung ke kategori','#CBEBE5','var(--deep)','package','#459F96'),statCard('Kategori Aktif',String(active),`${linked} kategori digunakan`,'#FFE2D0','#D9884A','tag','#D9884A')].join('');
    }
    if (key === 'satuan') {
      const used = state.units.filter(unit => state.items.some(item => item.unitId === unit.id)).length;
      return [statCard('Total Satuan',String(state.units.length),'Satuan tersedia','#F7C6D6','var(--pinkd)','ruler','#BD6F8D'),statCard('Digunakan',String(used),'Terhubung ke barang','#CBEBE5','var(--deep)','ruler','#459F96'),statCard('Belum Digunakan',String(state.units.length-used),'Tidak ada barang terkait','#FFE2D0','#D9884A','ruler','#D9884A')].join('');
    }
    if (key === 'supplier') {
      const active = state.suppliers.filter(item => item.status === 'Aktif').length;
      const linked = state.suppliers.filter(supplier => state.items.some(item => item.supplierId === supplier.id)).length;
      return [statCard('Total Supplier',String(state.suppliers.length),'Pemasok terdaftar','#F7C6D6','var(--pinkd)','truck','#BD6F8D'),statCard('Supplier Aktif',String(active),'Dapat melakukan transaksi','#CBEBE5','var(--deep)','truck','#459F96'),statCard('Pemasok Barang',String(linked),'Memasok produk terdaftar','#FFE2D0','#D9884A','box','#D9884A')].join('');
    }
    const list = users();
    const admin = list.filter(user => user.role === 'admin').length;
    const operational = list.filter(user => ['gudang','kasir'].includes(user.role)).length;
    return [statCard('Total Pengguna',String(list.length),'Akun terdaftar','#F7C6D6','var(--pinkd)','user','#BD6F8D'),statCard('Administrator',String(admin),'Akses penuh','#CBEBE5','var(--deep)','gear','#459F96'),statCard('Petugas Operasional',String(operational),'Gudang dan kasir','#FFE2D0','#D9884A','users','#D9884A')].join('');
  }
  function statusOptions(key) {
    if (key === 'barang') return '<option value="">Semua Status Stok</option><option value="Aman">Aman</option><option value="Menipis">Menipis</option><option value="Habis">Habis</option>';
    return '<option value="">Semua Status</option><option value="Aktif">Aktif</option><option value="Nonaktif">Nonaktif</option>';
  }
  function toolbar(key) {
    const config = CONFIG[key];
    const relationFilter = key === 'barang'
      ? `<select class="sel" id="crudRelationFilter" aria-label="Filter kategori"><option value="">Semua Kategori</option>${stateRef().categories.map(item=>`<option value="${escape(item.id)}">${escape(item.name)}</option>`).join('')}</select>`
      : key === 'pengguna'
        ? '<select class="sel" id="crudRelationFilter" aria-label="Filter role"><option value="">Semua Role</option><option value="admin">Admin</option><option value="gudang">Petugas Gudang</option><option value="kasir">Kasir</option></select>'
        : '';
    const add = canManage() ? `<button class="btn crud-add-btn" type="button" data-crud-action="add">+ ${escape(config.add)}</button>` : '<span class="crud-readonly-note">Mode lihat saja · perubahan data hanya dapat dilakukan Admin</span>';
    return `<div class="tb crud-toolbar"><div class="sr crud-search"><span data-i="search"></span><input id="crudSearch" type="search" placeholder="${escape(config.search)}" aria-label="Cari ${escape(config.title)}"></div>${relationFilter}<select class="sel" id="crudStatusFilter" aria-label="Filter status">${statusOptions(key)}</select>${add}</div>`;
  }
  function renderTableMount(key) {
    const config = CONFIG[key];
    let rows = makeRows(key);
    rows = rows.filter(row => {
      const queryOK = !activeFilters.query || row.search.toLowerCase().includes(activeFilters.query.toLowerCase());
      const statusOK = !activeFilters.status || String(row.status).toLowerCase() === activeFilters.status.toLowerCase();
      let relationOK = true;
      if (activeFilters.relation && key === 'barang') relationOK = row.record.categoryId === activeFilters.relation;
      if (activeFilters.relation && key === 'pengguna') relationOK = row.record.role === activeFilters.relation;
      return queryOK && statusOK && relationOK;
    });
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    activePage = Math.min(activePage,pages);
    const start = (activePage - 1) * PAGE_SIZE;
    const visible = rows.slice(start,start + PAGE_SIZE);
    const table = `<div class="ovf"><table class="data-table crud-table"><thead><tr>${config.columns.map(label=>`<th>${escape(label)}</th>`).join('')}</tr></thead><tbody>${visible.length ? visible.map(row=>`<tr data-record-id="${escape(row.id)}">${row.cells.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${config.columns.length}"><div class="crud-empty"><span>${icon('package')}</span><b>Data tidak ditemukan</b><small>Coba ubah kata kunci atau filter pencarian.</small></div></td></tr>`}</tbody></table></div>`;
    const from = total ? start + 1 : 0;
    const to = Math.min(start + PAGE_SIZE,total);
    const pagination = `<div class="pg crud-pg"><span>Menampilkan ${from}–${to} dari ${total} data</span><div class="crud-pagination"><button type="button" class="page-btn" data-crud-page="prev" ${activePage<=1?'disabled':''} aria-label="Halaman sebelumnya">‹</button><span class="page-current">${activePage} / ${pages}</span><button type="button" class="page-btn" data-crud-page="next" ${activePage>=pages?'disabled':''} aria-label="Halaman berikutnya">›</button></div></div>`;
    return table + pagination;
  }
  function renderPage(title,key) {
    if (key === 'pengguna' && !canManage()) {
      return `${pageHeader(title,key,'PREFERENSI','Kelola akun dan hak akses pengguna sistem.')}<section class="card pn"><div class="crud-empty"><b>Akses Admin diperlukan</b><small>Halaman Manajemen Pengguna hanya dapat diakses oleh Administrator.</small></div></section>`;
    }
    activePage = 1;
    activeFilters = { query:'', status:'', relation:'' };
    const config = CONFIG[key];
    return `${pageHeader(config.title,key,config.crumb,config.description)}<div class="stats three-stats">${statCards(key)}</div><section class="card pn crud-panel"><div class="hd"><h4>${navIcon(config.icon)}Daftar ${escape(config.title)}</h4><span class="s">Kelola dan pantau data secara terpusat.</span></div>${toolbar(key)}<div id="crudTableMount">${renderTableMount(key)}</div></section>`;
  }
  function renderTableAgain() {
    const mount = $('crudTableMount');
    if (mount) mount.innerHTML = renderTableMount(currentPageKey);
  }
  function fieldOptions(field, selected) {
    let options = [];
    // Hanya master data aktif yang dapat dipilih untuk barang baru. Relasi nonaktif
    // yang sudah dipakai tetap ditampilkan ketika sedang mengedit barang lama.
    if (field.options === 'categories') options = stateRef().categories.filter(item => item.status === 'Aktif' || item.id === selected).map(item => [item.id,item.name]);
    if (field.options === 'units') options = stateRef().units.filter(item => item.status === 'Aktif' || item.id === selected).map(item => [item.id,`${item.name} (${item.symbol})`]);
    if (field.options === 'suppliers') options = stateRef().suppliers.filter(item => item.status === 'Aktif' || item.id === selected).map(item => [item.id,item.name]);
    if (field.options === 'roles') options = [['admin','Admin'],['gudang','Petugas Gudang'],['kasir','Kasir']];
    if (field.options === 'status') options = [['Aktif','Aktif'],['Nonaktif','Nonaktif']];
    return `<option value="">Pilih ${escape(field.label.toLowerCase())}</option>${options.map(([value,label])=>`<option value="${escape(value)}" ${String(selected ?? '')===String(value)?'selected':''}>${escape(label)}</option>`).join('')}`;
  }
  function makeField(field,record,mode) {
    const value = record?.[field.name] ?? (field.options === 'status' ? 'Aktif' : '');
    const required = field.required || (mode === 'create' && field.requiredOnCreate);
    const common = `id="crudField_${field.name}" name="${field.name}" data-crud-field="${field.name}" ${required?'required':''} ${field.readonly?'readonly':''}`;
    let control = '';
    if (field.type === 'select') {
      control = `<select class="in crud-input" ${common}>${fieldOptions(field,value)}</select>`;
    } else if (field.type === 'textarea') {
      control = `<textarea class="in crud-input crud-textarea" ${common} rows="2" placeholder="${escape(field.placeholder || '')}">${escape(value)}</textarea>`;
    } else {
      const type = field.type || 'text';
      const min = field.min ? `min="${field.min}"` : '';
      const step = field.step ? `step="${field.step}"` : '';
      const placeholder = field.placeholder ? `placeholder="${escape(field.placeholder)}"` : '';
      const inputValue = type === 'password' ? '' : `value="${escape(value)}"`;
      const autocomplete = type === 'password' ? 'autocomplete="new-password"' : '';
      const readonly = mode === 'edit' && field.name === 'username' ? 'readonly' : '';
      control = `<input class="in crud-input" type="${type}" ${common} ${inputValue} ${min} ${step} ${placeholder} ${autocomplete} ${readonly}>`;
    }
    return `<div class="crud-field ${field.full?'full':''}"><label for="crudField_${field.name}">${escape(field.label)}${required?' <em>*</em>':''}</label>${control}</div>`;
  }
  function openForm(mode,id='') {
    if (!canManage()) return showToast('Hanya Admin yang dapat mengubah master data.');
    const key = currentPageKey;
    const config = CONFIG[key];
    if (!config) return;
    const collection = getCollection(key);
    const record = mode === 'edit' ? collection.find(item => item.id === id || item.username === id) : null;
    if (mode === 'edit' && !record) return showToast('Data yang akan diedit tidak ditemukan.');
    if (key === 'pengguna' && mode === 'edit' && record.username === currentUser.username) {
      // Admin boleh mengubah data profilnya sendiri, tetapi tidak boleh mengubah role/status sendiri.
    }
    $('modalTitle').textContent = mode === 'edit' ? `Edit ${config.title}` : config.add;
    $('modalDescription').textContent = mode === 'edit' ? 'Perbarui informasi pada formulir berikut, lalu simpan perubahan.' : `Lengkapi formulir berikut untuk menambahkan ${config.title.toLowerCase()} baru.`;
    const fields = config.fields.filter(field => !(key === 'pengguna' && mode === 'edit' && field.name === 'password'));
    const fieldByName = Object.fromEntries(fields.map(field => [field.name, field]));
    const formContent = config.formSections
      ? config.formSections.map(section => `<section class="crud-form-section"><div class="crud-section-heading"><b>${escape(section.title)}</b><small>${escape(section.description || '')}</small></div><div class="crud-section-grid">${section.fields.map(name => fieldByName[name]).filter(Boolean).map(field => makeField(field,record,mode)).join('')}</div></section>`).join('')
      : fields.map(field => makeField(field,record,mode)).join('');
    $('modalFields').classList.add('crud-fields');
    $('modalFields').innerHTML = `<div class="crud-form-error" id="crudFormError" role="alert"></div>${formContent}${key==='pengguna'&&mode==='edit'?'<div class="crud-password-note full">Gunakan tombol Reset Password pada tabel untuk mengganti kata sandi pengguna.</div>':''}`;
    $('recordForm').dataset.crudModule = key;
    $('recordForm').dataset.crudMode = mode;
    $('recordForm').dataset.crudId = record?.id || record?.username || '';
    $('recordForm').dataset.fieldCount = '0';
    $('modalBackdrop').querySelector('.modal-box')?.classList.add('crud-modal');
    const submit = $('recordForm').querySelector('button[type="submit"]');
    if (submit) submit.textContent = mode === 'edit' ? 'Simpan Perubahan' : 'Simpan Data';
    $('modalBackdrop').classList.add('open');
    const first = $('modalFields').querySelector('input:not([readonly]),select,textarea');
    first?.focus();
  }
  function setFormError(message='') {
    const el = $('crudFormError');
    if (!el) { if (message) showToast(message); return; }
    el.textContent = message;
    el.classList.toggle('show',Boolean(message));
  }
  function uniqueCheck(collection,key,value,currentId,label) {
    const normalized = String(value || '').trim().toLowerCase();
    return !collection.some(item => item.id !== currentId && String(item[key] || '').trim().toLowerCase() === normalized);
  }
  function newId(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`; }
  function nextCode(collection,prefix) { return `${prefix}-${String(collection.length+1).padStart(3,'0')}`; }
  function handleSubmit(event) {
    const form = $('recordForm');
    const key = form?.dataset.crudModule;
    if (!MASTER_KEYS.has(key) || key !== currentPageKey) return false;
    event.preventDefault();
    void saveForm(key,form.dataset.crudMode || 'create',form.dataset.crudId || '');
    return true;
  }
  async function saveForm(key,mode,id) {
    if (!canManage()) return setFormError('Akses ditolak. Hanya Admin yang dapat mengubah data.');
    const form = $('recordForm');
    const values = Object.fromEntries(new FormData(form).entries());
    const list = getCollection(key);
    const existing = mode === 'edit' ? list.find(item => item.id === id || item.username === id) : null;
    if (mode === 'edit' && !existing) return setFormError('Data yang akan diperbarui sudah tidak tersedia. Muat ulang halaman lalu coba kembali.');
    const currentId = existing?.id || existing?.username || '';
    const value = name => String(values[name] ?? '').trim();
    setFormError('');

    if (key === 'barang') {
      if (!uniqueCheck(list,'code',value('code'),currentId)) return setFormError('Kode barang sudah digunakan. Gunakan kode yang berbeda.');
      if (!uniqueCheck(list,'name',value('name'),currentId)) return setFormError('Nama barang sudah terdaftar.');
      const state = stateRef();
      if (!byId(state.categories,value('categoryId'))) return setFormError('Pilih kategori yang tersedia.');
      if (!byId(state.units,value('unitId'))) return setFormError('Pilih satuan yang tersedia.');
      if (!byId(state.suppliers,value('supplierId'))) return setFormError('Pilih supplier yang tersedia.');
      const purchasePrice = Number(value('purchasePrice'));
      const salePrice = Number(value('salePrice'));
      const stock = Number(value('stock'));
      const minStock = Number(value('minStock'));
      if ([purchasePrice,salePrice,stock,minStock].some(number=>!Number.isFinite(number)||number<0)) return setFormError('Harga dan stok harus berupa angka nol atau lebih.');
      if (salePrice < purchasePrice) return setFormError('Harga jual sebaiknya tidak lebih kecil dari harga beli. Periksa kembali nilainya.');
      const record = { id:existing?.id || newId('brg'), code:value('code'), name:value('name'), categoryId:value('categoryId'), unitId:value('unitId'), supplierId:value('supplierId'), purchasePrice, salePrice, stock, minStock, status:'Aktif', createdAt:existing?.createdAt || new Date().toISOString(), updatedAt:new Date().toISOString() };
      saveCollectionRecord(key,record,mode);
    } else if (key === 'kategori') {
      if (!uniqueCheck(list,'code',value('code'),currentId)) return setFormError('Kode kategori sudah digunakan.');
      if (!uniqueCheck(list,'name',value('name'),currentId)) return setFormError('Nama kategori sudah terdaftar.');
      const record = { id:existing?.id || newId('ktg'), code:value('code'), name:value('name'), description:value('description'), status:value('status') || 'Aktif', createdAt:existing?.createdAt || new Date().toISOString(), updatedAt:new Date().toISOString() };
      saveCollectionRecord(key,record,mode);
    } else if (key === 'satuan') {
      if (!uniqueCheck(list,'code',value('code'),currentId)) return setFormError('Kode satuan sudah digunakan.');
      if (!uniqueCheck(list,'name',value('name'),currentId)) return setFormError('Nama satuan sudah terdaftar.');
      if (!uniqueCheck(list,'symbol',value('symbol'),currentId)) return setFormError('Simbol satuan sudah digunakan.');
      const record = { id:existing?.id || newId('st'), code:value('code'), name:value('name'), symbol:value('symbol'), description:value('description'), status:value('status') || 'Aktif', createdAt:existing?.createdAt || new Date().toISOString(), updatedAt:new Date().toISOString() };
      saveCollectionRecord(key,record,mode);
    } else if (key === 'supplier') {
      if (!uniqueCheck(list,'code',value('code'),currentId)) return setFormError('Kode supplier sudah digunakan.');
      if (!uniqueCheck(list,'name',value('name'),currentId)) return setFormError('Nama supplier sudah terdaftar.');
      if (value('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))) return setFormError('Format email supplier belum benar.');
      const record = { id:existing?.id || newId('sup'), code:value('code'), name:value('name'), contact:value('contact'), phone:value('phone'), email:value('email'), city:value('city'), address:value('address'), status:value('status') || 'Aktif', createdAt:existing?.createdAt || new Date().toISOString(), updatedAt:new Date().toISOString() };
      saveCollectionRecord(key,record,mode);
    } else if (key === 'pengguna') {
      const username = value('username');
      if (username.length < 3 || !/^[a-zA-Z0-9._-]+$/.test(username)) return setFormError('Username minimal 3 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung.');
      if (!uniqueCheck(list,'username',username,currentId)) return setFormError('Username sudah digunakan.');
      if (!uniqueCheck(list,'email',value('email'),currentId)) return setFormError('Email sudah digunakan.');
      if (!['admin','gudang','kasir'].includes(value('role'))) return setFormError('Pilih role yang tersedia.');
      if (mode === 'create' && value('password').length < 6) return setFormError('Password awal minimal 6 karakter.');
      if (existing && existing.username === currentUser.username && (value('role') !== existing.role || (value('status') || 'Aktif') !== (existing.status || 'Aktif'))) return setFormError('Role dan status akun yang sedang digunakan tidak dapat diubah dari sesi ini.');
      if (existing && existing.role === 'admin' && (value('role') !== 'admin' || (value('status') || 'Aktif') !== 'Aktif')) {
        const activeAdmins = list.filter(user => user.role === 'admin' && (user.status || 'Aktif') === 'Aktif');
        if (activeAdmins.length <= 1) return setFormError('Administrator aktif terakhir tidak dapat dinonaktifkan atau diubah role-nya.');
      }
      const updated = { ...existing, id:existing?.id || newId('USR'), fullName:value('fullName'), username, email:value('email'), role:value('role'), status:value('status') || 'Aktif', createdAt:existing?.createdAt || new Date().toISOString(), lastActive:existing?.lastActive || null, updatedAt:new Date().toISOString() };
      if (mode === 'create' || value('password')) {
        const salt = makeSalt();
        updated.salt = salt;
        updated.passwordHash = await hashPassword(value('password'),salt);
      }
      const updatedUsers = mode === 'edit' ? list.map(user => (user.id === id || user.username === id) ? updated : user) : [...list,updated];
      setCollection(key,updatedUsers);
      if (currentUser && currentUser.username === updated.username) {
        currentUser = { username:updated.username, role:updated.role };
        updateProfileUI();
      }
    }
    closeModal();
    renderRoute();
    showToast(mode === 'edit' ? 'Perubahan data berhasil disimpan.' : 'Data baru berhasil ditambahkan.');
  }
  function saveCollectionRecord(key,record,mode) {
    const list = getCollection(key);
    const updated = mode === 'edit' ? list.map(item => item.id === record.id ? record : item) : [...list,record];
    setCollection(key,updated);
  }
  function relationLabel(key,record) {
    const state = stateRef();
    if (key === 'kategori') {
      const used = state.items.filter(item => item.categoryId === record.id).length;
      if (used) return `Kategori ${record.name} masih digunakan oleh ${used} barang. Ubah statusnya menjadi Nonaktif jika tidak ingin dipakai lagi.`;
    }
    if (key === 'satuan') {
      const used = state.items.filter(item => item.unitId === record.id).length;
      if (used) return `Satuan ${record.name} masih digunakan oleh ${used} barang. Hapus atau ubah relasi barang terlebih dahulu.`;
    }
    if (key === 'supplier') {
      const used = state.items.filter(item => item.supplierId === record.id).length;
      if (used) return `Supplier ${record.name} masih terhubung dengan ${used} barang. Hapus atau ubah relasi barang terlebih dahulu.`;
    }
    return '';
  }
  function deleteRecord(key,id) {
    if (!canManage()) return showToast('Hanya Admin yang dapat menghapus data.');
    const list = getCollection(key);
    const record = list.find(item => item.id === id || item.username === id);
    if (!record) return showToast('Data tidak ditemukan.');
    if (key === 'pengguna') {
      if (record.username === currentUser.username) return showToast('Akun yang sedang digunakan tidak dapat dihapus.');
      if (record.role === 'admin' && list.filter(user => user.role === 'admin' && (user.status || 'Aktif') === 'Aktif').length <= 1) return showToast('Administrator aktif terakhir tidak dapat dihapus.');
    } else {
      const warning = relationLabel(key,record);
      if (warning) return showToast(warning);
    }
    const label = record.name || record.fullName || record.username || record.code;
    if (!window.confirm(`Hapus data "${label}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setCollection(key,list.filter(item => item.id !== id && item.username !== id));
    renderRoute();
    showToast('Data berhasil dihapus.');
  }
  async function resetPassword(id) {
    if (!canManage()) return showToast('Hanya Admin yang dapat mereset password.');
    const list = users();
    const record = list.find(item => item.id === id || item.username === id);
    if (!record) return showToast('Pengguna tidak ditemukan.');
    const password = window.prompt(`Masukkan password baru untuk ${record.username} (minimal 6 karakter):`);
    if (password === null) return;
    if (password.length < 6) return showToast('Password minimal 6 karakter.');
    const salt = makeSalt();
    record.salt = salt;
    record.passwordHash = await hashPassword(password,salt);
    record.updatedAt = new Date().toISOString();
    writeUsers(list);
    showToast(`Password ${record.username} berhasil diubah.`);
  }
  function bind() {
    const view = $('view');
    view.oninput = event => {
      if (event.target.id === 'crudSearch') { activeFilters.query = event.target.value; activePage = 1; renderTableAgain(); }
    };
    view.onchange = event => {
      if (event.target.id === 'crudStatusFilter') { activeFilters.status = event.target.value; activePage = 1; renderTableAgain(); }
      if (event.target.id === 'crudRelationFilter') { activeFilters.relation = event.target.value; activePage = 1; renderTableAgain(); }
    };
    view.onclick = event => {
      const action = event.target.closest('[data-crud-action]');
      if (action) {
        const kind = action.dataset.crudAction;
        const id = action.dataset.id || '';
        if (kind === 'add') openForm('create');
        if (kind === 'edit') openForm('edit',id);
        if (kind === 'delete') deleteRecord(currentPageKey,id);
        if (kind === 'reset') void resetPassword(id);
        return;
      }
      const pageButton = event.target.closest('[data-crud-page]');
      if (pageButton && !pageButton.disabled) {
        activePage += pageButton.dataset.crudPage === 'next' ? 1 : -1;
        renderTableAgain();
      }
    };
  }

  window.HiFiveCRUD = { isMasterPage, init, renderPage, bind, openForm, handleSubmit };
})();
