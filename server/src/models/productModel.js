import { db } from "../config/database.js";
import { dbAll, dbGet, dbRun } from "../middlewares_helpers/sqlite3_helpers.js";
export const getProducts = () =>
  dbAll(db, "SELECT * FROM products ORDER BY id DESC");
export const getProductById = (id) =>
  dbGet(db, "SELECT * FROM products WHERE id = ?", [id]);
export const createProduct = (p) =>
  dbRun(
    db,
    "INSERT INTO products(name,price,stock,category,description,is_available) VALUES(?,?,?,?,?,?)",
    [
      p.name,
      p.price,
      p.stock ?? 0,
      p.category ?? "",
      p.description ?? "",
      p.is_available ?? 1,
    ],
  );
export const updateProduct = (id, p) =>
  dbRun(
    db,
    "UPDATE products SET name=?,price=?,stock=?,category=?,description=?,is_available=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
    [
      p.name,
      p.price,
      p.stock,
      p.category ?? "",
      p.description ?? "",
      p.is_available ?? 1,
      id,
    ],
  );
export const deleteProduct = (id) =>
  dbRun(db, "DELETE FROM products WHERE id=?", [id]);
