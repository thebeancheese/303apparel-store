require('dotenv').config();
if (process.env.DNS_SERVERS) require('dns').setServers(process.env.DNS_SERVERS.split(','));
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const { Product, Customer, Order, Message, Promo, Subscriber } = require('./models');
const { seed } = require('./seed');

const { MONGODB_URI, ADMIN_KEY } = process.env;
const PORT = process.env.PORT || 3000;
if (!MONGODB_URI) { console.error('Missing MONGODB_URI. Create a .env file (see .env.example).'); process.exit(1); }
if (!ADMIN_KEY) { console.error('Missing ADMIN_KEY. Add it to .env or your Render environment variables.'); process.exit(1); }

const CATS = { tops: 'Tops', outerwear: 'Outerwear', sets: 'Sets', kids: 'Kids' };
const app = express();
app.use(express.json({ limit: '15mb' }));          // admin photos are sent as data URLs

/* ---------- helpers ---------- */
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const clean = d => { const o = d.toObject ? d.toObject() : d; delete o._id; delete o.createdAt; delete o.updatedAt; return o; };
const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const requireAdmin = (req, res, next) => same(req.get('x-admin-key') || '', ADMIN_KEY) ? next() : next(new HttpError(401, 'Admin key required.'));
const todayISO = () => new Date().toISOString().slice(0, 10);
const money = n => Math.round(n * 100) / 100;

async function getPromoDoc() {
  let p = await Promo.findOne({ key: 'main' });
  if (!p) p = await Promo.create({ key: 'main', code: '15FF', pct: 15, validUntil: '2026-10-15' });
  return { code: p.code, pct: p.pct, validUntil: p.validUntil, active: todayISO() <= p.validUntil };
}
function productFields(b) {
  const out = {};
  if (b.name !== undefined) out.name = String(b.name).trim();
  if (b.category !== undefined) out.category = b.category;
  if (b.price !== undefined) out.price = Number(b.price);
  if (b.stock !== undefined) out.stock = Math.max(0, parseInt(b.stock, 10) || 0);
  if (b.featured !== undefined) out.featured = !!b.featured;
  if (b.description !== undefined) out.description = String(b.description);
  if (Array.isArray(b.images)) out.images = b.images.filter(x => typeof x === 'string').slice(0, 8);
  return out;
}

/* ---------- admin ---------- */
app.post('/api/admin/login', (req, res) => {
  if (same(req.body.key || '', ADMIN_KEY)) return res.json({ ok: true });
  res.status(401).json({ error: 'That admin key is not correct.' });
});

/* ---------- products ---------- */
app.get('/api/products', wrap(async (req, res) => {
  const { category, q, featured, sort } = req.query;
  const perPage = Math.max(0, parseInt(req.query.perPage, 10) || 0);
  const filter = {};
  if (category && category !== 'all') filter.category = category;
  if (featured === 'true' || featured === '1') filter.featured = true;
  if (q) {
    const rx = new RegExp(esc(q), 'i');
    const catKeys = Object.keys(CATS).filter(k => rx.test(CATS[k]));
    filter.$or = [{ name: rx }, ...(catKeys.length ? [{ category: { $in: catKeys } }] : [])];
  }
  const order = sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : { createdAt: 1, _id: 1 };
  const total = await Product.countDocuments(filter);
  const pages = perPage ? Math.max(1, Math.ceil(total / perPage)) : 1;
  const page = Math.min(Math.max(1, parseInt(req.query.page, 10) || 1), pages);
  let query = Product.find(filter).sort(order);
  if (perPage) query = query.skip((page - 1) * perPage).limit(perPage);
  res.json({ items: (await query).map(clean), total, page, pages });
}));

app.post('/api/products/reset', requireAdmin, wrap(async (req, res) => {
  await seed({ reset: true });
  res.json({ ok: true });
}));

app.get('/api/products/:id', wrap(async (req, res) => {
  const p = await Product.findOne({ id: req.params.id });
  res.json(p ? clean(p) : null);
}));

app.post('/api/products', requireAdmin, wrap(async (req, res) => {
  const f = productFields(req.body);
  if (!f.name) throw new HttpError(400, 'Enter a product name.');
  if (!(f.price > 0)) throw new HttpError(400, 'Enter a price above zero.');
  if (!CATS[f.category]) throw new HttpError(400, 'Pick a valid category.');
  const id = 'p' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex');
  res.status(201).json(clean(await Product.create({ id, ...f })));
}));

app.put('/api/products/:id', requireAdmin, wrap(async (req, res) => {
  const p = await Product.findOneAndUpdate({ id: req.params.id }, productFields(req.body), { new: true, runValidators: true });
  if (!p) throw new HttpError(404, 'Product not found.');
  res.json(clean(p));
}));

app.delete('/api/products/:id', requireAdmin, wrap(async (req, res) => {
  await Product.deleteOne({ id: req.params.id });
  res.json({ ok: true });
}));

/* ---------- promo ---------- */
app.get('/api/promo', wrap(async (req, res) => res.json(await getPromoDoc())));

app.put('/api/promo', requireAdmin, wrap(async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const pct = Number(req.body.pct), validUntil = String(req.body.validUntil || '');
  if (!code || !(pct >= 1 && pct <= 90) || !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) throw new HttpError(400, 'Fill in the code, a discount from 1 to 90, and an end date.');
  await Promo.findOneAndUpdate({ key: 'main' }, { code, pct, validUntil }, { upsert: true });
  res.json(await getPromoDoc());
}));

async function checkPromo(code) {
  const promo = await getPromoDoc();
  const c = String(code || '').trim().toUpperCase();
  if (!c) return { valid: false, message: 'Enter a promo code.' };
  if (c !== promo.code.toUpperCase()) return { valid: false, message: 'Code not recognized.' };
  if (!promo.active) return { valid: false, message: `${promo.code} expired on ${promo.validUntil}.` };
  return { valid: true, code: promo.code, pct: promo.pct };
}
app.post('/api/promo/check', wrap(async (req, res) => res.json(await checkPromo(req.body.code))));

/* ---------- orders ---------- */
app.post('/api/orders', wrap(async (req, res) => {
  const { customer, items, payment, promoCode } = req.body;
  const c = customer || {};
  if (!c.name || !c.email || !c.phone || !c.address) throw new HttpError(400, 'Name, email, phone and address are required.');
  if (!Array.isArray(items) || !items.length) throw new HttpError(400, 'Your cart is empty.');

  // Reserve stock one line at a time; undo everything if any line fails.
  const reserved = [], lines = [];
  let subtotal = 0;
  try {
    for (const l of items) {
      const qty = parseInt(l.qty, 10);
      if (!(qty > 0)) throw new HttpError(400, 'Invalid quantity.');
      const p = await Product.findOneAndUpdate({ id: l.id, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { new: true });
      if (!p) {
        const exists = await Product.findOne({ id: l.id });
        throw new HttpError(409, exists ? `Not enough stock for ${exists.name}.` : 'One of the products no longer exists.');
      }
      reserved.push({ id: p.id, qty });
      lines.push({ productId: p.id, name: p.name, size: l.size, qty, price: p.price });
      subtotal += p.price * qty;
    }
  } catch (err) {
    await Promise.all(reserved.map(r => Product.updateOne({ id: r.id }, { $inc: { stock: r.qty } })));
    throw err;
  }

  let discount = 0, code = null;
  if (promoCode) { const r = await checkPromo(promoCode); if (r.valid) { discount = money(subtotal * r.pct / 100); code = r.code; } }
  subtotal = money(subtotal);
  const total = money(subtotal - discount);
  const orderNo = '303-' + crypto.randomInt(100000, 1000000);
  const info = { name: String(c.name).trim(), email: String(c.email).trim().toLowerCase(), phone: String(c.phone).trim(), address: String(c.address).trim() };

  await Order.create({ orderNo, customer: info, items: lines, subtotal, discount, promoCode: code, total, payment });
  await Customer.findOneAndUpdate(
    { email: info.email },
    { $set: { name: info.name, phone: info.phone, address: info.address }, $inc: { orderCount: 1, totalSpent: total } },
    { upsert: true }
  );
  res.status(201).json({ orderNo, subtotal, discount, total, payment });
}));

/* ---------- customers and messages ---------- */
app.get('/api/customers', requireAdmin, wrap(async (req, res) => {
  const filter = {};
  if (req.query.q) { const rx = new RegExp(esc(req.query.q), 'i'); filter.$or = [{ name: rx }, { email: rx }]; }
  const list = await Customer.find(filter).sort({ createdAt: -1 });
  res.json(list.map(d => ({ id: String(d._id), ...d.toObject(), _id: undefined })));
}));

app.post('/api/messages', wrap(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) throw new HttpError(400, 'Name, email and message are required.');
  await Message.create({ name, email, subject: subject || '', message, date: todayISO() });
  res.status(201).json({ ok: true, message: 'Thanks! We received your message.' });
}));

app.get('/api/messages', requireAdmin, wrap(async (req, res) => {
  const list = await Message.find().sort({ createdAt: -1 });
  res.json(list.map(d => ({ id: String(d._id), ...d.toObject(), _id: undefined })));
}));

/* ---------- newsletter ---------- */
app.post('/api/subscribers', wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.');
  const r = await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  res.status(201).json({ ok: true, already: r.upsertedCount === 0 });
}));

app.get('/api/subscribers', requireAdmin, wrap(async (req, res) => {
  const list = await Subscriber.find().sort({ createdAt: -1 });
  res.json(list.map(d => ({ email: d.email, createdAt: d.createdAt })));
}));

/* ---------- static site, 404, errors ---------- */
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public/404.html')));
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') err = new HttpError(400, Object.values(err.errors)[0].message);
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Something went wrong on the server.' : err.message });
});

/* ---------- start ---------- */
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
  .then(async () => {
    console.log('Connected to MongoDB.');
    const added = await seed();
    if (added.products || added.customers || added.promo) console.log('Seeded empty collections:', added);
    app.listen(PORT, () => console.log(`303 Apparel running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('Could not connect to MongoDB:', err.message); process.exit(1); });
