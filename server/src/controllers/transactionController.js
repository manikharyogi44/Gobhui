import * as T from "../models/transactionModel.js";
export async function list(req, res, next) {
  try {
    res.json({ success: true, data: await T.getTransactions() });
  } catch (e) {
    next(e);
  }
}
export async function detail(req, res, next) {
  try {
    const t = await T.getTransactionById(Number(req.params.id));
    if (!t)
      return res
        .status(404)
        .json({ success: false, message: "Transaksi tidak ditemukan" });
    res.json({ success: true, data: { ...t, items: await T.getItems(t.id) } });
  } catch (e) {
    next(e);
  }
}
export async function create(req, res, next) {
  try {
    const d = req.body;
    if (
      !Array.isArray(d?.items) ||
      !d.items.length ||
      !["Tunai", "QRIS", "Transfer", "Kartu"].includes(d.payment_method) ||
      !Number.isFinite(Number(d.paid_amount))
    )
      return res
        .status(400)
        .json({ success: false, message: "Data transaksi tidak valid" });
    const result = await T.createTransaction(d);
    res.status(201).json({
      success: true,
      message: "Transaksi berhasil disimpan",
      data: result,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}
