import { db } from "../config/database.js";
import { dbAll, dbRun } from "../middlewares_helpers/sqlite3_helpers.js";
export const getCustomers = () =>
  dbAll(db, "SELECT * FROM customers ORDER BY id DESC");
export const createCustomer = (c) =>
  dbRun(db, "INSERT INTO customers(name,phone,email,address) VALUES(?,?,?,?)", [
    c.name,
    c.phone ?? "",
    c.email ?? "",
    c.address ?? "",
  ]);
