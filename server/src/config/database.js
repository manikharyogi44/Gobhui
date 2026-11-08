import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dbRun, dbGet } from "../middlewares_helpers/sqlite3_helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../database.sqlite");
export const db = new sqlite3.Database(dbPath);

export async function initializeDatabase() {
  await dbRun(db, "PRAGMA foreign_keys = ON");
  await dbRun(
    db,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  );
  const admin = await dbGet(db, "SELECT id FROM users WHERE email = ?", ["admin@kasirkita.com"]);
  if (!admin) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await dbRun(
      db,
      "INSERT INTO users(name, email, password_hash, role) VALUES(?,?,?,?)",
      ["Admin Toko", "admin@kasirkita.com", passwordHash, "admin"],
    );
  }
  await dbRun(
    db,
    `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL CHECK(price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0), category TEXT, description TEXT,
    is_available INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  );
  await dbRun(
    db,
    `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, email TEXT,
    address TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  );
  await dbRun(
    db,
    `CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_number TEXT NOT NULL UNIQUE,
    customer_id INTEGER, total REAL NOT NULL, payment_method TEXT NOT NULL,
    paid_amount REAL NOT NULL, change_amount REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
  )`,
  );
  await dbRun(
    db,
    `CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT, transaction_id INTEGER NOT NULL,
    product_id INTEGER, product_name TEXT NOT NULL, quantity INTEGER NOT NULL,
    price REAL NOT NULL, subtotal REAL NOT NULL,
    FOREIGN KEY(transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
  )`,
  );
  const count = await dbGet(db, "SELECT COUNT(*) AS total FROM products");
  if (count.total === 0) {
    const samples = [
      [
        "Kopi Susu Gula Aren",
        22000,
        50,
        "Minuman",
        "Kopi susu dengan gula aren",
      ],
      ["Croissant Butter", 18000, 30, "Makanan", "Croissant mentega"],
      ["Air Mineral 600ml", 5000, 100, "Minuman", "Air mineral botol"],
      ["Roti Cokelat", 12000, 24, "Makanan", "Roti isi cokelat"], 
      ["Indomie Hype Abis", 4000, 30, "Makanan", "Indomie Goreng"],
      ["Rinso", 20000, 15, "Deterjen", "Pembersih Pakaian"],
      ["Sempurna 16", 37000, 20, "Rokok", "Rokok Sempurna"],
      ["Daia", 15000, 15, "Deterjen", "Pembersih Pakaian"],
      ["Surya 16", 36000, 20, "Rokok", "Rokok Surya"],
      ["Axe", 28000, 20, "Deodorant", "Pembersih Ketiak"],
      ["Posh" 25000, 20, "Deodorant", "Pembersih Ketiak"],
      ["Pocari Sweat", 8000, 20, "Minuman", "Minuman ION"],
      ["Hydro Coco", 13000, 20, "Minuman", "Minuman Segar"],
      ["Sari Roti Tawar", 20000, 10, "Makanan", "Roti Sehat"],
      
    ];
    for (const p of samples)
      await dbRun(
        db,
        "INSERT INTO products(name,price,stock,category,description) VALUES(?,?,?,?,?)",
        p,
      );
  }
}
