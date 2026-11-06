import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as Auth from "../models/authModel.js";

export async function login(req, res, next) {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email dan password wajib diisi" });
    }
    const user = await Auth.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "kasirkita-dev-secret-ganti-di-env",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );
    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
