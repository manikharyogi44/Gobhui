import { useState, type FormEvent } from "react";
import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  Store,
  ShieldCheck,
} from "lucide-react";
import "./login.css";

const API = "http://localhost:3000/api";
type LoginResult = {
  token: string;
  user: { id: number; name: string; email: string; role: string };
};

export default function Login({
  onLogin,
}: {
  onLogin: (result: LoginResult) => void;
}) {
  const [email, setEmail] = useState("admin@kasirkita.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Login gagal");
      onLogin(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Tidak dapat terhubung ke server",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          <span className="login-brand-icon">
            <Store size={25} />
          </span>
          <span>
            KasirKita<small>POINT OF SALE</small>
          </span>
        </div>
        <div className="visual-copy">
          <span className="visual-kicker">SISTEM KASIR MODERN</span>
          <h1>Kelola bisnis lebih mudah, setiap hari.</h1>
          <p>
            Kelola produk, pelanggan, dan transaksi penjualan dalam satu sistem
            yang praktis dan terintegrasi.
          </p>
          <div className="visual-feature">
            <ShieldCheck size={19} /> Akses aman dengan autentikasi JWT
          </div>
        </div>
        <div className="visual-footer">
          KASIRKITA POS · SISTEM INFORMASI PENJUALAN
        </div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="mobile-login-brand">
            <span className="login-brand-icon">
              <Store size={22} />
            </span>
            <b>KasirKita</b>
          </div>
          <div className="login-heading">
            <span className="login-heading-icon">
              <LockKeyhole size={21} />
            </span>
            <h2>Selamat datang!</h2>
            <p>Masuk ke akun untuk melanjutkan ke dashboard KasirKita.</p>
          </div>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          <label className="login-label">Email</label>
          <div className="login-input-wrap">
            <Mail size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              autoComplete="username"
            />
          </div>
          <label className="login-label password-label">Password</label>
          <div className="login-input-wrap">
            <LockKeyhole size={18} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              autoComplete="current-password"
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? "Memeriksa akun..." : "Masuk ke Dashboard"}
          </button>
          <div className="login-security">
            <ShieldCheck size={15} /> Login dilindungi token keamanan JWT
          </div>
          <div className="login-demo">
            <b>Akun demo</b>
            <span>Email: admin@kasirkita.com</span>
            <span>Password: admin123</span>
          </div>
        </form>
        <div className="login-copyright">
          © 2026 KasirKita POS. All rights reserved.
        </div>
      </section>
    </main>
  );
}
