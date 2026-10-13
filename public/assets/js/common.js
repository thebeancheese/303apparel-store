/* Shared code for every page: header/footer, cart, product dialog, image viewer, checkout. */
(function () {
  const S = window.SITE || { COMPANY: { address: [], social: {} } };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const peso = n => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const CATS = window.CATEGORIES || {};
  const SIZES = ['S', 'M', 'L', 'XL'];
  const fmtDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });

  let toastTimer;
  function toast(msg, withCart) {
    const t = $('#toast'); if (!t) return;
    $('#toastMsg').textContent = msg; $('#toastCart').hidden = !withCart;
    t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 4200);
  }

  const ICON = {
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.3a2.9 2.9 0 1 1-2-2.8V9.1a6.3 6.3 0 1 0 5.4 6.2V8.9a8.1 8.1 0 0 0 4.7 1.5V7a4.8 4.8 0 0 1-.9-.3z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.2 2.3h3.3l-7.2 8.3 8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.6l7.7-8.8L1.2 2.3H8l4.7 6.2 5.5-6.2zm-1.2 17.5h1.8L7 4.2H5.1L17 19.8z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5.5-5.5L5 21"/></svg>'
  };
  const socialLinks = () => Object.entries(S.COMPANY.social || {}).map(([k, url]) =>
    `<li><a href="${esc(url)}" aria-label="${k[0].toUpperCase() + k.slice(1)}">${ICON[k] || ''}</a></li>`).join('');

  const PAGES = [['home', 'index.html', 'Home'], ['features', 'features.html', 'Features'], ['products', 'products.html', 'Products'], ['social', 'social.html', 'Social campaign'], ['fit', 'infographic.html', 'The Fit Formula'], ['contact', 'contact.html', 'Contact'], ['credits', 'credits.html', 'Credits']];
  function renderChrome() {
    const page = document.body.dataset.page;
    const c = S.COMPANY;
    document.body.insertAdjacentHTML('afterbegin', `
      <header class="site-top"><div class="in">
        <a class="logo" href="index.html" aria-label="303 Apparel home"><img src="assets/img/logo-mark-cream.png" alt="303 Apparel" width="149" height="160"></a>
        <nav aria-label="Main"><ul class="nav">${PAGES.map(([k, href, label]) => `<li><a href="${href}" ${k === page ? 'aria-current="page"' : ''}>${label}</a></li>`).join('')}</ul></nav>
        <button class="cartbtn" id="openCart" type="button" aria-label="Open cart">${ICON.bag}<span class="count" id="cartCount" data-n="0">0</span></button>
      </div></header>`);
    document.body.insertAdjacentHTML('beforeend', `
      <section class="newsletter" aria-labelledby="nlTitle"><div class="wrap">
        <div><h2 id="nlTitle">Join the drop list</h2><p>Be first to hear about new drops and members-only promo codes. No spam, unsubscribe anytime.</p></div>
        <form id="nlForm" novalidate>
          <label class="sr" for="nlEmail">Email address</label>
          <input id="nlEmail" type="email" placeholder="you@email.com" autocomplete="email" required>
          <button class="btn" type="submit">Subscribe</button>
          <p class="msg" id="nlMsg" role="status"></p>
        </form></div></section>
      <section class="brandline">
        <h2>Don’t follow the trend, set it.</h2><p>${esc(c.name)}</p><p><em>Stay Ahead of the Trend.</em></p>
        <ul class="social" aria-label="Social media">${socialLinks()}</ul>
      </section>
      <footer class="legal">
        <nav aria-label="Footer">${PAGES.map(([, href, label]) => `<a href="${href}">${label}</a>`).join('')}<a href="contact.html#faq">FAQ</a><a href="admin.html">Staff login</a></nav>
        <address>${(c.address || []).map(esc).join('<br>')}</address>
        <small>© ${new Date().getFullYear()} ${esc(c.name)}. All rights reserved.</small>
        <p class="madeby">Created with Love by: M. Chamdal | V.M. Cruzada | J.P. David | E.L. Madla | E.K. Sicat | C.M. Yabut</p>
      </footer>

      <div class="scrim" id="scrim"></div>
      <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="cartTitle" inert>
        <header><h2 id="cartTitle">Your cart</h2><button class="iconbtn" type="button" id="closeCart" aria-label="Close cart">${ICON.close}</button></header>
        <ul class="lines" id="lines"></ul>
        <div class="cart-empty" id="cartEmpty" hidden><h3>Your cart is empty</h3><p>Pick something from the latest drop.</p><a class="btn" href="products.html">Start shopping</a></div>
        <footer id="cartFoot">
          <div><div class="promo"><label class="sr" for="promoIn">Promo code</label><input id="promoIn" placeholder="Promo code" autocomplete="off"><button type="button" id="promoBtn">Apply</button></div><p class="msg" id="promoMsg" role="status"></p></div>
          <dl class="totals"><dt>Subtotal</dt><dd id="tSub"></dd><dt id="tDiscLabel" hidden>Discount</dt><dd id="tDisc" hidden></dd><dt class="grand">Total</dt><dd class="grand" id="tTotal"></dd></dl>
          <button class="btn block" type="button" id="toCheckout">Checkout</button>
          ${window.EXTRAS ? window.EXTRAS.trustHTML() : ''}
        </footer>
      </aside>

      <dialog id="pdDialog" aria-labelledby="pdName"><div class="pd">
        <button class="iconbtn closex" type="button" data-close aria-label="Close">${ICON.close}</button>
        <div class="pd-gallery" id="pdGallery">
          <img id="pdImg" alt="">
          <button class="pd-arrow prev" type="button" id="pdPrev" aria-label="Previous photo">${ICON.chevL}</button>
          <button class="pd-arrow next" type="button" id="pdNext" aria-label="Next photo">${ICON.chevR}</button>
          <div class="pd-dots" id="pdDots"></div>
        </div>
        <div class="pd-body">
          <h2 id="pdName"></h2><p class="cat" id="pdCat"></p><p class="rate" id="pdRate"></p><p class="price" id="pdPrice"></p><p class="desc" id="pdDesc"></p><p class="avail" id="pdAvail"></p>
          <fieldset><legend>Size</legend><div class="sizes" id="pdSizes"></div></fieldset>
          <details class="sizeguide" id="pdGuide"><summary>Size guide</summary><div id="pdGuideBody"></div></details>
          <div><p class="sr" id="qtyLabel">Quantity</p><div class="qty" role="group" aria-labelledby="qtyLabel"><button type="button" id="pdMinus" aria-label="Decrease quantity">−</button><output id="pdQty">1</output><button type="button" id="pdPlus" aria-label="Increase quantity">+</button></div></div>
          <div class="btns"><button class="btn" type="button" id="pdOrder">Order now</button><button class="btn ghost" type="button" id="pdAdd">Add to cart</button></div>
        </div>
        <div class="pd-more">
          <section class="pd-reviews" aria-labelledby="pdRevTitle"><h3 id="pdRevTitle">Customer reviews</h3><div id="pdRevSummary" class="rev-sum"></div><ul class="reviews" id="pdReviews"></ul></section>
          <section class="pd-related" id="pdRelatedBox" aria-labelledby="pdRelTitle"><h3 id="pdRelTitle">You may also like</h3><ul class="related" id="pdRelated"></ul></section>
        </div></div></dialog>

      <dialog id="lbDialog" class="lb" aria-label="Image viewer">
        <div class="lb-bar"><button class="iconbtn closex" type="button" data-close aria-label="Close">${ICON.close}</button></div>
        <img id="lbImg" alt="">
      </dialog>

      <dialog id="coDialog" aria-labelledby="coTitle">
        <div id="coForm" class="co">
          <button class="iconbtn closex" type="button" data-close aria-label="Close checkout">${ICON.close}</button>
          <h2 id="coTitle">Checkout</h2>
          <form id="orderForm"><div class="co-grid">
            <div>
              <div class="field"><label for="fName">Full name</label><input id="fName" name="name" required autocomplete="name"></div>
              <div class="field"><label for="fEmail">Email</label><input id="fEmail" name="email" type="email" required autocomplete="email"></div>
              <div class="field"><label for="fPhone">Mobile number</label><input id="fPhone" name="phone" type="tel" required autocomplete="tel"></div>
              <div class="field"><label for="fAddr">Delivery address</label><textarea id="fAddr" name="address" required autocomplete="street-address" style="min-height:76px"></textarea></div>
              <fieldset class="pay"><legend>Payment method</legend>
                <label><input type="radio" name="pay" value="Cash on delivery" checked> Cash on delivery</label>
                <label><input type="radio" name="pay" value="GCash"> GCash</label></fieldset>
            </div>
            <div class="summary"><h3>Order summary</h3><ul id="coItems"></ul><dl class="totals" id="coTotals"></dl>
              <p class="msg err" id="coMsg" role="alert"></p>
              <button class="btn block" type="submit" id="coSubmit">Place order</button>
              ${window.EXTRAS ? window.EXTRAS.trustHTML() : ''}</div>
          </div></form>
        </div>
        <div id="coDone" class="done" hidden><h2>Order placed</h2><p>Thanks, <span id="doneName"></span>. Your order number is <span class="order" id="doneNo"></span>.</p><p id="donePay"></p><button class="btn" type="button" id="doneBtn">Keep shopping</button></div>
      </dialog>
      <div class="toast" id="toast" role="status"><span id="toastMsg"></span><button type="button" id="toastCart">View cart</button></div>`);
    $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); }));
  }

  /* ---------- product cards ---------- */
  const registry = new Map();
  const availability = p => (p.stock ?? 0) <= 0 ? { text: 'Sold out', low: true } : p.stock <= 5 ? { text: `Only ${p.stock} left`, low: true } : { text: 'In stock', low: false };
  const X = () => window.EXTRAS || null;
  function ratingLine(p) {
    const x = X(); if (!x) return '';
    const r = x.reviewData(p);
    return `<p class="rate">${x.starsHTML(r.rating)}<span>${r.rating.toFixed(1)} <small>(${r.count})</small></span></p>`;
  }
  function productCard(p) {
    registry.set(p.id, p);
    const a = availability(p);
    const n = (p.images || []).length;
    return `<li class="card">
      <div class="media"><button class="card-img" type="button" data-open="${esc(p.id)}" aria-label="View ${esc(p.name)}"><img src="${esc(p.images[0])}" alt="${esc(p.name)}" loading="lazy"></button>
        ${p.featured ? '<span class="badge">Featured</span>' : ''}
        ${n > 1 ? `<span class="photocount">${ICON.photo}${n}</span>` : ''}</div>
      <h3>${esc(p.name)}</h3><p class="cat">${esc(CATS[p.category] || p.category)}</p>${ratingLine(p)}<p class="desc">${esc(p.description)}</p>
      <div class="row"><p class="price">${peso(p.price)}</p><span class="avail ${a.low ? 'low' : ''}">${a.text}</span></div>
      <button class="btn small" type="button" data-open="${esc(p.id)}" style="margin-top:.6rem">View details</button></li>`;
  }

  /* ---------- product dialog (with gallery) ---------- */
  let pd = { p: null, size: 'M', qty: 1, photo: 0 };
  function renderGallery() {
    const imgs = pd.p.images || [];
    $('#pdImg').src = imgs[pd.photo]; $('#pdImg').alt = `${pd.p.name}, photo ${pd.photo + 1} of ${imgs.length}`;
    $('#pdPrev').hidden = $('#pdNext').hidden = imgs.length < 2;
    $('#pdDots').innerHTML = imgs.length > 1 ? imgs.map((_, i) => `<button type="button" data-dot="${i}" aria-current="${i === pd.photo}" aria-label="Photo ${i + 1}"></button>`).join('') : '';
  }
  function openProduct(id) {
    const p = registry.get(id); if (!p) return;
    const a = availability(p);
    pd = { p, size: 'M', qty: 1, photo: 0 };
    renderGallery();
    $('#pdName').textContent = p.name; $('#pdCat').textContent = CATS[p.category] || p.category;
    $('#pdPrice').textContent = peso(p.price); $('#pdDesc').textContent = p.description || '';
    $('#pdAvail').textContent = a.text; $('#pdAvail').className = 'avail' + (a.low ? ' low' : '');
    $('#pdSizes').innerHTML = SIZES.map(s => `<label><input type="radio" name="size" value="${s}" ${s === 'M' ? 'checked' : ''}><span>${s}</span></label>`).join('');
    $('#pdQty').textContent = 1;
    $('#pdAdd').disabled = $('#pdOrder').disabled = (p.stock ?? 0) <= 0;
    const x = X();
    if (x) {
      const r = x.reviewData(p);
      $('#pdRate').innerHTML = `${x.starsHTML(r.rating)}<span>${r.rating.toFixed(1)} <small>(${r.count} reviews)</small></span>`;
      $('#pdGuide').open = false; $('#pdGuideBody').innerHTML = x.sizeGuideHTML(p.category);
      $('#pdRevSummary').innerHTML = `<b>${r.rating.toFixed(1)}</b>${x.starsHTML(r.rating)}<span>${r.count} reviews</span>`;
      $('#pdReviews').innerHTML = r.reviews.map(v => `<li><div class="rv-top">${x.starsHTML(v.stars)}<b>${esc(v.title)}</b></div><p>${esc(v.body)}</p><small>${esc(v.name)} · ${esc(v.when)}</small></li>`).join('');
    }
    renderRelated(p);
    if (!$('#pdDialog').open) $('#pdDialog').showModal();
    $('#pdDialog').scrollTop = 0;
  }
  /* "You may also like": same category first, then fill with other products */
  async function renderRelated(p) {
    const box = $('#pdRelatedBox'), ul = $('#pdRelated');
    try {
      const { items } = await window.Store.listProducts({});
      const others = items.filter(o => o.id !== p.id);
      const rel = [...others.filter(o => o.category === p.category), ...others.filter(o => o.category !== p.category)].slice(0, 3);
      if (pd.p !== p) return;                       // another product was opened meanwhile
      rel.forEach(o => registry.set(o.id, o));
      box.hidden = !rel.length;
      ul.innerHTML = rel.map(o => `<li><button type="button" data-open="${esc(o.id)}" aria-label="View ${esc(o.name)}"><img src="${esc(o.images[0])}" alt="" loading="lazy"><span class="rn">${esc(o.name)}</span><span class="rp">${peso(o.price)}</span></button></li>`).join('');
    } catch (e) { box.hidden = true; }
  }

  /* ---------- cart ---------- */
  let state = { items: [], promo: null };
  try { state = Object.assign(state, JSON.parse(localStorage.getItem('a303_cart3') || '{}')); } catch (e) { /* ignore */ }
  const persist = () => { try { localStorage.setItem('a303_cart3', JSON.stringify(state)); } catch (e) { /* ignore */ } render(); };
  function totals() {
    const sub = state.items.reduce((s, l) => s + l.price * l.qty, 0);
    const disc = state.promo ? Math.round(sub * state.promo.pct) / 100 : 0;
    return { sub, disc, total: sub - disc };
  }
  function render() {
    const n = state.items.reduce((s, l) => s + l.qty, 0);
    const badge = $('#cartCount'); if (!badge) return;
    badge.textContent = n; badge.dataset.n = n;
    const empty = state.items.length === 0;
    $('#cartEmpty').hidden = !empty; $('#lines').hidden = empty; $('#cartFoot').hidden = empty;
    $('#lines').innerHTML = state.items.map((l, i) => `<li class="line"><img src="${esc(l.image)}" alt="">
      <div><h3>${esc(l.name)}</h3><p class="sub">Size ${esc(l.size)} · ${peso(l.price)}</p>
        <div class="qty" role="group" aria-label="Quantity for ${esc(l.name)}, size ${esc(l.size)}"><button type="button" data-dec="${i}" aria-label="Decrease quantity">−</button><output>${l.qty}</output><button type="button" data-inc="${i}" aria-label="Increase quantity">+</button></div></div>
      <div class="amt">${peso(l.price * l.qty)}<button class="rm" type="button" data-rm="${i}" aria-label="Remove ${esc(l.name)}">Remove</button></div></li>`).join('');
    const t = totals();
    $('#tSub').textContent = peso(t.sub);
    $('#tDiscLabel').hidden = $('#tDisc').hidden = !state.promo;
    if (state.promo) { $('#tDiscLabel').textContent = `Discount (${state.promo.code})`; $('#tDisc').textContent = '−' + peso(t.disc); $('#promoMsg').className = 'msg ok'; $('#promoMsg').textContent = `${state.promo.code} applied: ${state.promo.pct}% off.`; }
    $('#tTotal').textContent = peso(t.total);
  }
  function addToCart(p, size, qty) {
    const ex = state.items.find(l => l.id === p.id && l.size === size);
    if (ex) ex.qty = Math.min(20, ex.qty + qty); else state.items.push({ id: p.id, size, qty, name: p.name, price: p.price, image: p.images[0] });
    persist();
    const b = $('#openCart'); if (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  }
  async function applyPromo(code) {
    const r = await window.Store.checkPromo(code);
    if (!r.valid) return { ok: false, msg: r.message };
    state.promo = { code: r.code, pct: r.pct }; persist();
    return { ok: true, msg: `${r.code} applied: ${r.pct}% off.` };
  }
  let lastFocus = null;
  function openCart() {
    $('#toast').classList.remove('on'); lastFocus = document.activeElement;
    $('#drawer').inert = false; $('#drawer').classList.add('open'); $('#scrim').classList.add('on');
    document.body.style.overflow = 'hidden'; $('#closeCart').focus();
  }
  function closeCart() {
    $('#drawer').classList.remove('open'); $('#scrim').classList.remove('on'); $('#drawer').inert = true;
    document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function openCheckout() {
    if (!state.items.length) return;
    const t = totals();
    $('#coItems').innerHTML = state.items.map(l => `<li><span>${esc(l.name)} (${esc(l.size)}) × ${l.qty}</span><span>${peso(l.price * l.qty)}</span></li>`).join('');
    $('#coTotals').innerHTML = `<dt>Subtotal</dt><dd>${peso(t.sub)}</dd>` + (state.promo ? `<dt>Discount (${esc(state.promo.code)})</dt><dd>−${peso(t.disc)}</dd>` : '') + `<dt class="grand">Total</dt><dd class="grand">${peso(t.total)}</dd>`;
    $('#coMsg').textContent = ''; $('#coForm').hidden = false; $('#coDone').hidden = true;
    closeCart(); if (!$('#coDialog').open) $('#coDialog').showModal();
  }

  function wire() {
    document.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) openProduct(b.dataset.open); });
    document.addEventListener('click', e => {
      const a = e.target.closest('a[data-lightbox]'); if (!a) return;
      e.preventDefault();
      const src = a.querySelector('img'); $('#lbImg').src = a.getAttribute('href'); $('#lbImg').alt = src ? src.alt : '';
      $('#lbDialog').showModal();
    });
    $('#openCart').addEventListener('click', openCart);
    $('#closeCart').addEventListener('click', closeCart);
    $('#scrim').addEventListener('click', closeCart);
    $('#toastCart').addEventListener('click', openCart);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && $('#drawer').classList.contains('open')) closeCart();
      if ($('#pdDialog').open) { if (e.key === 'ArrowLeft') $('#pdPrev').click(); if (e.key === 'ArrowRight') $('#pdNext').click(); }
    });
    $('#pdPrev').addEventListener('click', () => { const n = pd.p.images.length; pd.photo = (pd.photo - 1 + n) % n; renderGallery(); });
    $('#pdNext').addEventListener('click', () => { const n = pd.p.images.length; pd.photo = (pd.photo + 1) % n; renderGallery(); });
    $('#pdDots').addEventListener('click', e => { const b = e.target.closest('[data-dot]'); if (b) { pd.photo = +b.dataset.dot; renderGallery(); } });
    $('#pdSizes').addEventListener('change', e => { pd.size = e.target.value; });
    $('#pdMinus').addEventListener('click', () => { pd.qty = Math.max(1, pd.qty - 1); $('#pdQty').textContent = pd.qty; });
    $('#pdPlus').addEventListener('click', () => { pd.qty = Math.min(20, pd.qty + 1); $('#pdQty').textContent = pd.qty; });
    $('#pdAdd').addEventListener('click', () => { addToCart(pd.p, pd.size, pd.qty); $('#pdDialog').close(); toast(`${pd.p.name} (${pd.size}) added`, true); });
    $('#pdOrder').addEventListener('click', () => { addToCart(pd.p, pd.size, pd.qty); $('#pdDialog').close(); openCheckout(); });
    $('#lines').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.inc !== undefined) state.items[+b.dataset.inc].qty = Math.min(20, state.items[+b.dataset.inc].qty + 1);
      else if (b.dataset.dec !== undefined) state.items[+b.dataset.dec].qty = Math.max(1, state.items[+b.dataset.dec].qty - 1);
      else if (b.dataset.rm !== undefined) state.items.splice(+b.dataset.rm, 1);
      persist();
    });
    $('#promoBtn').addEventListener('click', async () => { const r = await applyPromo($('#promoIn').value); $('#promoMsg').className = 'msg ' + (r.ok ? 'ok' : 'err'); $('#promoMsg').textContent = r.msg; });
    $('#promoIn').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#promoBtn').click(); } });
    $('#toCheckout').addEventListener('click', openCheckout);
    $('#orderForm').addEventListener('submit', async e => {
      e.preventDefault();
      const f = new FormData(e.target), btn = $('#coSubmit');
      btn.disabled = true; $('#coMsg').textContent = '';
      try {
        const r = await window.Store.placeOrder({
          customer: { name: f.get('name'), email: f.get('email'), phone: f.get('phone'), address: f.get('address') },
          items: state.items.map(l => ({ id: l.id, size: l.size, qty: l.qty })),
          payment: f.get('pay'), promoCode: state.promo ? state.promo.code : ''
        });
        $('#doneName').textContent = String(f.get('name')).split(' ')[0];
        $('#doneNo').textContent = r.orderNo;
        $('#donePay').textContent = `Total ${peso(r.total)}. Payment: ${r.payment}.`;
        state = { items: [], promo: null }; persist(); e.target.reset();
        $('#coForm').hidden = true; $('#coDone').hidden = false;
      } catch (err) { $('#coMsg').textContent = err.message; }
      btn.disabled = false;
    });
    $('#doneBtn').addEventListener('click', () => $('#coDialog').close());
    $('#nlForm').addEventListener('submit', async e => {
      e.preventDefault();
      const msg = $('#nlMsg'), btn = e.target.querySelector('button'); btn.disabled = true;
      try {
        const r = await window.Store.subscribe($('#nlEmail').value);
        msg.className = 'msg ok';
        msg.textContent = r.already ? 'You are already on the list. See you in your inbox!' : 'You are in! Watch your inbox for the next drop.';
        if (!r.already) e.target.reset();
      } catch (err) { msg.className = 'msg err'; msg.textContent = err.message; }
      btn.disabled = false;
    });
  }

  /* ---------- scroll reveal ---------- */
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function revealIn(elements) {
    const els = [...elements];
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion()) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => { el.classList.add('reveal'); io.observe(el); });
  }

  /* Builds a <video> or <iframe>. Called twice, once for the floating player and once for the
     section on the page. They're separate elements because moving one video between parents
     while it plays freezes the picture on some phones. */
  function createMediaEl(title) {
    const S = window.SITE || {};
    if (S.VIDEO_FILE) {
      const v = document.createElement('video');
      v.controls = true; v.preload = 'metadata';
      v.playsInline = true; v.setAttribute('playsinline', '');   // older iOS needs the attribute
      v.poster = 'assets/img/promo/video-poster.jpg'; v.src = S.VIDEO_FILE; v.title = title;
      return v;
    }
    if (S.VIDEO_EMBED_URL) {
      const f = document.createElement('iframe');
      f.src = S.VIDEO_EMBED_URL; f.title = title; f.loading = 'lazy'; f.allowFullscreen = true;
      f.allow = 'accelerometer; encrypted-media; picture-in-picture; fullscreen';
      return f;
    }
    return null;
  }
  function placeholderEl() {
    const d = document.createElement('div'); d.className = 'placeholder';
    d.innerHTML = '<div><h3 style="font-size:1.1rem;margin:0 0 .3rem">Promotional video</h3><p style="font-size:.8rem">Add it in assets/js/config.js</p></div>';
    return d;
  }

  /* ---------- floating mini player ---------- */
  function initVideoSystem() {
    const dockSection = $('#video'); if (!dockSection) return;
    const dockContent = $('#videoContent');
    const S = window.SITE || {};
    const title = S.VIDEO_TITLE || '303 Apparel promotional video';
    const MIN_W = 160, MAX_W = 420;
    const floatMedia = createMediaEl(title);
    const dockMedia = createMediaEl(title);
    if (dockMedia) dockContent.appendChild(dockMedia); else dockContent.appendChild(placeholderEl());

    const float = document.createElement('div');
    float.className = 'vidfloat';
    float.innerHTML = `
      <div class="vf-bar" id="vfBar">
        <span class="vf-label">${esc(title)}</span>
        <button type="button" class="vf-close" aria-label="Dismiss video preview">${ICON.close}</button>
      </div>
      <div class="vf-video" id="vfVideo">
        <button type="button" class="video-handle vf-handle" id="vfHandle" aria-label="Resize this video. Drag, or focus and use the arrow keys.">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M19 5L5 19M19 13l-6 6M19 19h-3M19 19v-3"/></svg>
        </button>
      </div>`;
    document.body.appendChild(float);
    const bar = $('#vfBar', float), vfVideo = $('#vfVideo', float), handle = $('#vfHandle', float);

    if (!floatMedia) { vfVideo.insertBefore(placeholderEl(), handle); return; }
    vfVideo.insertBefore(floatMedia, handle);   // stays in this parent

    /* size: width only, height follows at 4:3 */
    const clampW = w => Math.min(MAX_W, Math.max(MIN_W, Math.round(w)));
    function applyWidth(w, save) {
      w = clampW(w); vfVideo.style.width = w + 'px';
      if (save) { try { localStorage.setItem('a303_floatvid_w', w); } catch (e) { /* ignore */ } }
    }
    const savedW = parseInt(localStorage.getItem('a303_floatvid_w') || '', 10);
    applyWidth(Number.isFinite(savedW) ? savedW : 220, false);

    let rsz = false, rStartX = 0, rStartY = 0, rStartW = 0;
    handle.addEventListener('pointerdown', e => {
      e.stopPropagation(); rsz = true; rStartX = e.clientX; rStartY = e.clientY;
      rStartW = vfVideo.getBoundingClientRect().width; handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', e => {
      if (!rsz) return;
      applyWidth(rStartW + ((e.clientX - rStartX) + (e.clientY - rStartY)) / 2, false);
    });
    function endResize() { if (!rsz) return; rsz = false; applyWidth(parseFloat(vfVideo.style.width), true); }
    handle.addEventListener('pointerup', endResize);
    handle.addEventListener('pointercancel', endResize);
    handle.addEventListener('keydown', e => {
      const w = vfVideo.getBoundingClientRect().width;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); applyWidth(w + 20, true); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); applyWidth(w - 20, true); }
    });

    /* position: drag by the title bar, clamped so it stays on screen */
    let drag = false, dStartX = 0, dStartY = 0, baseLeft = 0, baseTop = 0;
    function toLeftTop() {
      const r = float.getBoundingClientRect();
      float.style.left = r.left + 'px'; float.style.top = r.top + 'px'; float.style.right = 'auto'; float.style.bottom = 'auto';
    }
    bar.addEventListener('pointerdown', e => {
      if (e.target.closest('.vf-close')) return;
      drag = true; toLeftTop(); dStartX = e.clientX; dStartY = e.clientY;
      baseLeft = parseFloat(float.style.left); baseTop = parseFloat(float.style.top);
      bar.setPointerCapture(e.pointerId); float.classList.add('dragging');
    });
    bar.addEventListener('pointermove', e => {
      if (!drag) return;
      const r = float.getBoundingClientRect();
      const maxL = innerWidth - r.width - 6, maxT = innerHeight - r.height - 6;
      const left = Math.min(Math.max(6, baseLeft + (e.clientX - dStartX)), Math.max(6, maxL));
      const top = Math.min(Math.max(6, baseTop + (e.clientY - dStartY)), Math.max(6, maxT));
      float.style.left = left + 'px'; float.style.top = top + 'px';
    });
    function endDrag() { if (!drag) return; drag = false; float.classList.remove('dragging'); }
    bar.addEventListener('pointerup', endDrag);
    bar.addEventListener('pointercancel', endDrag);

    /* handoff: pause the one leaving, start the other at the same time */
    let dismissed = false;
    function handOff(from, to) {
      if (from && from.tagName === 'VIDEO' && !from.paused) {
        if (to && to.tagName === 'VIDEO') { to.currentTime = from.currentTime; to.play().catch(() => { /* browser wants a tap first */ }); }
        from.pause();
      }
    }
    new IntersectionObserver(entries => entries.forEach(e => {
      if (dismissed) return;                            // closed by the user, leave it alone
      if (e.isIntersecting) { handOff(floatMedia, dockMedia); float.classList.add('hide'); }
      else { handOff(dockMedia, floatMedia); float.classList.remove('hide'); }
    }), { threshold: 0.2 }).observe(dockSection);

    $('.vf-close', float).addEventListener('click', e => {
      e.stopPropagation(); dismissed = true;
      if (floatMedia && floatMedia.tagName === 'VIDEO') floatMedia.pause();   // pause so the audio stops
      float.remove();
    });
  }

  window.A303 = { esc, peso, fmtDate, toast, productCard, applyPromo, ICON, CATS, S, $, $$, availability, revealIn };
  document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.bare) return;         // admin has its own layout
    renderChrome(); wire(); render();
    revealIn(document.querySelectorAll('.feature, .kpi, .timeline > li, .post, .about-grid > *, .spotlight > *, .info, #form-title, .hero-copy'));
    initVideoSystem();
    if (state.promo) {                               // clear a saved code that expired
      const r = await applyPromo(state.promo.code);
      if (!r.ok) { state.promo = null; persist(); }
    }
    document.dispatchEvent(new Event('a303:ready'));
  });
})();
