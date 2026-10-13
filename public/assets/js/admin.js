/* Admin page: products and photos, featured flags, promo code, customers and messages.
   Data goes through store.js (API + MongoDB). The admin key is checked by the server. */
(function () {
  const { esc, peso, CATS, toast, $, $$ } = window.A303;
  let editId = null, photos = [];    // photos: data URLs for the product being edited

  const authed = () => !!sessionStorage.getItem('a303_admin_key');
  function enter() {
    $('#loginBox').hidden = true; $('#dash').hidden = false; $('#logout').hidden = false;
    loadProducts(); loadPromo();
  }
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const key = $('#key').value;
    if (await window.Store.adminLogin(key)) { sessionStorage.setItem('a303_admin_key', key); enter(); }
    else { $('#loginMsg').textContent = 'That admin key is not correct.'; $('#key').select(); }
  });
  $('#logout').addEventListener('click', () => { sessionStorage.removeItem('a303_admin_key'); location.reload(); });
  if (authed()) enter();

  $$('[data-tab]').forEach(b => b.addEventListener('click', () => {
    $$('[data-tab]').forEach(x => x.setAttribute('aria-pressed', x === b));
    ['products', 'customers', 'messages', 'subscribers'].forEach(t => $('#tab-' + t).hidden = t !== b.dataset.tab);
    if (b.dataset.tab === 'customers') loadCustomers();
    if (b.dataset.tab === 'messages') loadMessages();
    if (b.dataset.tab === 'subscribers') loadSubscribers();
  }));

  /* ---- newsletter subscribers ---- */
  async function loadSubscribers() {
    const list = await window.Store.listSubscribers();
    $('#subCount').textContent = `${list.length} subscriber${list.length === 1 ? '' : 's'}`;
    $('#subBody').innerHTML = list.map(s => `<tr><td>${esc(s.email)}</td><td>${esc(String(s.createdAt).slice(0, 10))}</td></tr>`).join('') || '<tr><td colspan="2">No subscribers yet.</td></tr>';
  }

  /* ---- products ---- */
  let products = [];
  async function loadProducts() {
    ({ items: products } = await window.Store.listProducts({}));
    const n = products.filter(p => p.featured).length;
    $('#featStat').textContent = n ? `${n} of ${products.length} products are featured on the home page.` : 'No products are featured, so the Featured row is hidden.';
    $('#plist').innerHTML = products.map(p => `<li class="prow"><img src="${esc(p.images[0])}" alt="">
      <div><h3>${esc(p.name)}</h3><p class="sub">${esc(CATS[p.category])} · ${peso(p.price)} · ${p.stock} in stock · ${p.images.length} photo${p.images.length === 1 ? '' : 's'}</p></div>
      <div class="acts"><label class="feat"><input type="checkbox" data-feat="${p.id}" ${p.featured ? 'checked' : ''}> Featured</label>
        <button class="btn small ghost" type="button" data-edit="${p.id}">Edit</button>
        <button class="btn small ghost danger" type="button" data-del="${p.id}">Delete</button></div></li>`).join('') || '<li class="msg">No products yet.</li>';
  }
  $('#plist').addEventListener('change', async e => {
    const id = e.target.dataset.feat; if (!id) return;
    const p = products.find(x => x.id === id);
    await window.Store.updateProduct(id, { featured: e.target.checked });
    toast(e.target.checked ? `${p.name} is now featured` : `${p.name} removed from featured`);
    loadProducts();
  });
  let armed = null;
  $('#plist').addEventListener('click', async e => {
    const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
    if (ed) startEdit(ed.dataset.edit);
    if (del) {
      if (armed !== del.dataset.del) { armed = del.dataset.del; del.textContent = 'Confirm delete'; return; }
      const p = products.find(x => x.id === armed);
      await window.Store.deleteProduct(armed);
      armed = null; if (editId === p.id) resetForm();
      loadProducts(); toast(`${p.name} deleted`);
    }
  });
  document.addEventListener('click', e => { if (armed && !e.target.closest('[data-del]')) { armed = null; loadProducts(); } });

  function renderThumbs() {
    $('#thumbs').innerHTML = photos.map((src, i) => `<span class="t"><img src="${src}" alt="Photo ${i + 1}"><button type="button" data-rmphoto="${i}" aria-label="Remove photo ${i + 1}">✕</button></span>`).join('');
  }
  $('#thumbs').addEventListener('click', e => { const b = e.target.closest('[data-rmphoto]'); if (b) { photos.splice(+b.dataset.rmphoto, 1); renderThumbs(); } });

  function resetForm() {
    editId = null; photos = []; $('#prodForm').reset(); renderThumbs();
    $('#formTitle').textContent = 'Add product'; $('#formSave').textContent = 'Add product';
    $('#formCancel').hidden = true; $('#formMsg').textContent = ''; $('#aStock').value = 10;
  }
  function startEdit(id) {
    const p = products.find(x => x.id === id); resetForm(); editId = id;
    $('#aName').value = p.name; $('#aPrice').value = p.price; $('#aCat').value = p.category; $('#aStock').value = p.stock;
    $('#aDesc').value = p.description || ''; $('#aFeat').checked = !!p.featured;
    photos = [...p.images]; renderThumbs();
    $('#formTitle').textContent = 'Edit product'; $('#formSave').textContent = 'Save changes'; $('#formCancel').hidden = false;
    $('#prodForm').scrollIntoView({ behavior: 'smooth' }); $('#aName').focus();
  }
  $('#formCancel').addEventListener('click', resetForm);
  $('#aPhotos').addEventListener('change', async e => {
    const files = [...e.target.files].slice(0, 8 - photos.length);
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      const url = await new Promise((res, rej) => { const im = new Image(), obj = URL.createObjectURL(f); im.onload = () => res({ im, obj }); im.onerror = rej; im.src = obj; })
        .then(({ im, obj }) => {
          const W = 640, H = 853, c = document.createElement('canvas'); c.width = W; c.height = H;
          const r = W / H; let sw = im.width, sh = im.height, sx = 0, sy = 0;
          if (sw / sh > r) { const nw = sh * r; sx = (sw - nw) / 2; sw = nw; } else { const nh = sw / r; sy = (sh - nh) / 2; sh = nh; }
          c.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, W, H);
          URL.revokeObjectURL(obj);
          return c.toDataURL('image/jpeg', 0.8);
        }).catch(() => null);
      if (url) photos.push(url);
    }
    renderThumbs(); e.target.value = '';
  });
  $('#prodForm').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('#formMsg'); msg.className = 'msg err';
    if (!$('#aName').value.trim()) { msg.textContent = 'Enter a product name.'; return; }
    if (!(parseFloat($('#aPrice').value) > 0)) { msg.textContent = 'Enter a price above zero.'; return; }
    if (!photos.length) { msg.textContent = 'Add at least one photo.'; return; }
    const data = { name: $('#aName').value.trim(), price: parseFloat($('#aPrice').value), category: $('#aCat').value,
      stock: parseInt($('#aStock').value || '0', 10), description: $('#aDesc').value.trim(), featured: $('#aFeat').checked, images: [...photos] };
    try {
      if (editId) { await window.Store.updateProduct(editId, data); toast('Product saved'); }
      else { await window.Store.addProduct(data); toast('Product added' + (data.featured ? ' and featured' : '')); }
      resetForm(); loadProducts();
    } catch (err) { msg.textContent = err.message; }
  });
  $('#resetCat').addEventListener('click', async () => {
    if ($('#resetCat').dataset.arm !== '1') { $('#resetCat').dataset.arm = '1'; $('#resetCat').textContent = 'Click again to confirm. This removes every product you added.'; return; }
    $('#resetCat').dataset.arm = ''; $('#resetCat').textContent = 'Reset to the original catalog';
    await window.Store.resetProducts(); resetForm(); loadProducts(); toast('Catalog reset');
  });
  renderThumbs();

  /* ---- promo ---- */
  async function loadPromo() { const p = await window.Store.getPromo(); $('#pCode').value = p.code; $('#pPct').value = p.pct; $('#pEnd').value = p.validUntil; }
  $('#promoForm').addEventListener('submit', async e => {
    e.preventDefault(); const m = $('#promoMsg');
    const code = $('#pCode').value.trim().toUpperCase(), pct = parseFloat($('#pPct').value), end = $('#pEnd').value;
    if (!code || !(pct >= 1 && pct <= 90) || !end) { m.className = 'msg err'; m.textContent = 'Fill in the code, a discount from 1 to 90, and an end date.'; return; }
    const p = await window.Store.setPromo({ code, pct, validUntil: end });
    m.className = 'msg ok'; m.textContent = `Saved. ${p.code} gives ${p.pct}% off through ${p.validUntil}.`;
  });

  /* ---- customers and messages ---- */
  const date = iso => iso ? new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  async function loadCustomers(q = '') {
    const list = await window.Store.listCustomers(q);
    $('#custCount').textContent = `${list.length} ${list.length === 1 ? 'customer' : 'customers'}`;
    $('#custBody').innerHTML = list.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${esc(c.phone)}</td><td>${esc(c.address)}</td><td>${c.orderCount ?? 0}</td><td>${peso(c.totalSpent ?? 0)}</td><td>${date(c.createdAt)}</td></tr>`).join('') || '<tr><td colspan="7">No customers yet — they appear here after their first order.</td></tr>';
  }
  $('#custSearch').addEventListener('submit', e => { e.preventDefault(); loadCustomers($('#cq').value.trim()); });
  async function loadMessages() {
    const list = await window.Store.listMessages();
    $('#msgCount').textContent = `${list.length} ${list.length === 1 ? 'message' : 'messages'}`;
    $('#msgBody').innerHTML = list.map(m => `<tr><td>${esc(m.date)}</td><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${esc(m.subject)}</td><td style="white-space:normal;min-width:260px">${esc(m.message)}</td></tr>`).join('') || '<tr><td colspan="5">No messages yet.</td></tr>';
  }
})();
