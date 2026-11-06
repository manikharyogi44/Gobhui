import * as Product from "../models/productModel.js";
const valid = (p) =>
  p &&
  typeof p.name === "string" &&
  p.name.trim() &&
  Number.isFinite(Number(p.price)) &&
  Number(p.price) >= 0 &&
  Number.isInteger(Number(p.stock ?? 0)) &&
  Number(p.stock ?? 0) >= 0;
export async function list(req, res, next) {
  try {
    res.json({ success: true, data: await Product.getProducts() });
  } catch (e) {
    next(e);
  }
}
export async function detail(req, res, next) {
  try {
    const item = await Product.getProductById(Number(req.params.id));
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });
    res.json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
}
export async function create(req, res, next) {
  try {
    const p = req.body;
    if (!valid(p))
      return res.status(400).json({
        success: false,
        message: "Nama, harga, dan stok produk tidak valid",
      });
    const r = await Product.createProduct({
      ...p,
      name: p.name.trim(),
      price: Number(p.price),
      stock: Number(p.stock ?? 0),
    });
    res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan",
      data: await Product.getProductById(r.lastID),
    });
  } catch (e) {
    next(e);
  }
}
export async function update(req, res, next) {
  try {
    const p = req.body;
    if (!valid(p))
      return res
        .status(400)
        .json({ success: false, message: "Data produk tidak valid" });
    const r = await Product.updateProduct(Number(req.params.id), {
      ...p,
      price: Number(p.price),
      stock: Number(p.stock ?? 0),
    });
    if (!r.changes)
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });
    res.json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: await Product.getProductById(Number(req.params.id)),
    });
  } catch (e) {
    next(e);
  }
}
export async function remove(req, res, next) {
  try {
    const r = await Product.deleteProduct(Number(req.params.id));
    if (!r.changes)
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });
    res.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (e) {
    next(e);
  }
}
