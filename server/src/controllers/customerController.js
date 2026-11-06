import * as Customer from "../models/customerModel.js";
export async function list(req, res, next) {
  try {
    res.json({ success: true, data: await Customer.getCustomers() });
  } catch (e) {
    next(e);
  }
}
export async function create(req, res, next) {
  try {
    const c = req.body;
    if (!c?.name?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Nama pelanggan wajib diisi" });
    const r = await Customer.createCustomer({ ...c, name: c.name.trim() });
    res.status(201).json({
      success: true,
      message: "Pelanggan berhasil ditambahkan",
      data: { id: r.lastID, ...c },
    });
  } catch (e) {
    next(e);
  }
}
