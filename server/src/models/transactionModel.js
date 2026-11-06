import { db } from "../config/database.js";
import { dbAll, dbGet, dbRun } from "../middlewares_helpers/sqlite3_helpers.js";
export const getTransactions = () =>
  dbAll(
    db,
    `SELECT t.*, c.name AS customer_name FROM transactions t LEFT JOIN customers c ON c.id=t.customer_id ORDER BY t.id DESC`,
  );
export const getTransactionById = (id) =>
  dbGet(db, "SELECT * FROM transactions WHERE id=?", [id]);
export const getItems = (id) =>
  dbAll(db, "SELECT * FROM transaction_items WHERE transaction_id=?", [id]);
export async function createTransaction(data) {
  const run = (sql, params = []) => dbRun(db, sql, params);
  await run("BEGIN TRANSACTION");
  try {
    let total = 0;
    const prepared = [];
    for (const item of data.items) {
      const product = await dbGet(db, "SELECT * FROM products WHERE id=?", [
        item.product_id,
      ]);
      const qty = Number(item.quantity);
      if (!product || !Number.isInteger(qty) || qty < 1)
        throw new Error("Produk atau jumlah barang tidak valid");
      if (product.stock < qty)
        throw new Error(`Stok ${product.name} tidak mencukupi`);
      const subtotal = product.price * qty;
      total += subtotal;
      prepared.push({ product, qty, subtotal });
    }
    if (Number(data.paid_amount) < total)
      throw new Error("Jumlah pembayaran kurang dari total");
    const invoice = `INV-${Date.now()}`;
    const tx = await run(
      "INSERT INTO transactions(invoice_number,customer_id,total,payment_method,paid_amount,change_amount) VALUES(?,?,?,?,?,?)",
      [
        invoice,
        data.customer_id || null,
        total,
        data.payment_method,
        Number(data.paid_amount),
        Number(data.paid_amount) - total,
      ],
    );
    for (const x of prepared) {
      await run(
        "INSERT INTO transaction_items(transaction_id,product_id,product_name,quantity,price,subtotal) VALUES(?,?,?,?,?,?)",
        [
          tx.lastID,
          x.product.id,
          x.product.name,
          x.qty,
          x.product.price,
          x.subtotal,
        ],
      );
      await run(
        "UPDATE products SET stock=stock-?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [x.qty, x.product.id],
      );
    }
    await run("COMMIT");
    return {
      id: tx.lastID,
      invoice_number: invoice,
      total,
      change_amount: Number(data.paid_amount) - total,
    };
  } catch (e) {
    await run("ROLLBACK");
    throw e;
  }
}
