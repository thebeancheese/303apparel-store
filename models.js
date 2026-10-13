const mongoose = require('mongoose');
const { Schema } = mongoose;

const Product = mongoose.model('Product', new Schema({
  id: { type: String, required: true, unique: true },       // slug for seeded items
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['tops', 'outerwear', 'sets', 'kids'] },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false },
  description: { type: String, default: '' },
  images: { type: [String], default: [] }
}, { timestamps: true, versionKey: false }));

const Customer = mongoose.model('Customer', new Schema({
  name: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: String,
  address: String,
  orderCount: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 }
}, { timestamps: true, versionKey: false }));

const Order = mongoose.model('Order', new Schema({
  orderNo: { type: String, unique: true },
  customer: { name: String, email: String, phone: String, address: String },
  items: [{ _id: false, productId: String, name: String, size: String, qty: Number, price: Number }],
  subtotal: Number,
  discount: Number,
  promoCode: String,
  total: Number,
  payment: String
}, { timestamps: true, versionKey: false }));

const Message = mongoose.model('Message', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  subject: { type: String, default: '', trim: true },
  message: { type: String, required: true, trim: true },
  date: String
}, { timestamps: true, versionKey: false }));

const Promo = mongoose.model('Promo', new Schema({
  key: { type: String, default: 'main', unique: true },
  code: String,
  pct: Number,
  validUntil: String
}, { versionKey: false }));

const Subscriber = mongoose.model('Subscriber', new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true }
}, { timestamps: true, versionKey: false }));

module.exports = { Product, Customer, Order, Message, Promo, Subscriber };
