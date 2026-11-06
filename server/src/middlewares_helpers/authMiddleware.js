import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Token tidak ditemukan. Silakan login.",
    });
  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET || "kasirkita-dev-secret-ganti-di-env",
    );
    next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message:
        "Token tidak valid atau sudah kedaluwarsa. Silakan login kembali.",
    });
  }
}
