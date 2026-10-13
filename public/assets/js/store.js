/* Data layer. Same function names as before, now backed by the Express + MongoDB API. */
(function () {
  'use strict';
  const adminKey = () => { try { return sessionStorage.getItem('a303_admin_key') || ''; } catch (e) { return ''; } };

  async function api(path, { method = 'GET', body, admin = false } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (admin) headers['x-admin-key'] = adminKey();
    let res;
    try { res = await fetch('/api' + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined }); }
    catch (e) { throw new Error('Cannot reach the server. Please try again.'); }
    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status}).`);
    return data;
  }

  const Store = {
    /* ---- admin ---- */
    async adminLogin(key) {
      try { await api('/admin/login', { method: 'POST', body: { key } }); return true; }
      catch (e) { return false; }
    },

    /* ---- products ---- */
    listProducts({ category, q, featured, sort, page = 1, perPage = 0 } = {}) {
      const p = new URLSearchParams();
      if (category) p.set('category', category);
      if (q) p.set('q', q);
      if (featured) p.set('featured', 'true');
      if (sort) p.set('sort', sort);
      p.set('page', page); p.set('perPage', perPage);
      return api('/products?' + p);
    },
    getProduct(id) { return api('/products/' + encodeURIComponent(id)); },
    addProduct(data) { return api('/products', { method: 'POST', body: data, admin: true }); },
    updateProduct(id, patch) { return api('/products/' + encodeURIComponent(id), { method: 'PUT', body: patch, admin: true }); },
    async deleteProduct(id) { await api('/products/' + encodeURIComponent(id), { method: 'DELETE', admin: true }); return true; },
    async resetProducts() { await api('/products/reset', { method: 'POST', admin: true }); return (await Store.listProducts({})).items; },

    /* ---- promo ---- */
    getPromo() { return api('/promo'); },
    setPromo(cfg) { return api('/promo', { method: 'PUT', body: cfg, admin: true }); },
    checkPromo(code) { return api('/promo/check', { method: 'POST', body: { code } }); },

    /* ---- orders + customers ---- */
    placeOrder(payload) { return api('/orders', { method: 'POST', body: payload }); },
    listCustomers(q) { return api('/customers' + (q ? '?q=' + encodeURIComponent(q) : ''), { admin: true }); },

    /* ---- contact messages ---- */
    addMessage(msg) { return api('/messages', { method: 'POST', body: msg }); },
    listMessages() { return api('/messages', { admin: true }); },

    /* ---- newsletter ---- */
    subscribe(email) { return api('/subscribers', { method: 'POST', body: { email } }); },
    listSubscribers() { return api('/subscribers', { admin: true }); }
  };

  window.Store = Store;
})();
