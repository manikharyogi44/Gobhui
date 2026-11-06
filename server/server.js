import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./src/routes/productRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import transactionRoutes from "./src/routes/transactionRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import { authenticateToken } from "./src/middlewares_helpers/authMiddleware.js";
import { initializeDatabase } from "./src/config/database.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) =>
  res.json({ success: true, message: "KasirKita API aktif" }),
);
app.get("/", (req, res) => {
  res.send("KasirKita POS API Server Berhasil Berjalan!");
});
app.use("/api/auth", authRoutes);
app.use("/api/products", authenticateToken, productRoutes);
app.use("/api/customers", authenticateToken, customerRoutes);
app.use("/api/transactions", authenticateToken, transactionRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res
    .status(500)
    .json({ success: false, message: "Terjadi kesalahan pada server" });
});
const PORT = process.env.PORT || 3000;
initializeDatabase()
  .then(() =>
    app.listen(PORT, () =>
      console.log(`API berjalan di http://localhost:${PORT}`),
    ),
  )
  .catch((err) => {
    console.error("Gagal menginisialisasi database:", err);
    process.exit(1);
  });
