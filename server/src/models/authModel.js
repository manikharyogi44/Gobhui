import { dbGet } from "../middlewares_helpers/sqlite3_helpers.js";
import { db } from "../config/database.js";

export function findUserByEmail(email) {
  return dbGet(
    db,
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
    [email],
  );
}
