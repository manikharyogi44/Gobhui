import Logo from "./asset/logo KasirKita POS.png";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  ShoppingCart,
  X,
  Store,
  TrendingUp,
  Boxes,
  CircleDollarSign,
  LogOut,
} from "lucide-react";
import Login from "./Login";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  is_available: number;
};
type Customer = { id: number; name: string; phone?: string; email?: string };
type Tx = {
  id: number;
  invoice_number: string;
  customer_name?: string;
  total: number;
  payment_method: string;
  created_at: string;
};
const API = "http://localhost:3000/api";
const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("kasirkita_token")
        ? { Authorization: `Bearer ${localStorage.getItem("kasirkita_token")}` }
        : {}),
      ...(options?.headers || {}),
    },
  });
  const j = await r.json();
  if (r.status === 401) {
    localStorage.removeItem("kasirkita_token");
    localStorage.removeItem("kasirkita_user");
    window.location.reload();
    throw new Error("Sesi berakhir. Silakan login kembali.");
  }
  if (!r.ok || j.success === false)
    throw new Error(j.message || "Permintaan gagal");
  return j.data;
}
export default function App() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("kasirkita_token"),
  );
  const [loggedUser, setLoggedUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kasirkita_user") || "null") as {
        name: string;
        email: string;
        role: string;
      } | null;
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showProduct, setShowProduct] = useState(false);
  const [edit, setEdit] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
  });
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(
    [],
  );
  const [paid, setPaid] = useState("");
  const [method, setMethod] = useState("Tunai");
  const [customerId, setCustomerId] = useState("");
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
  });
  async function load() {
    setLoading(true);
    setError("");
    try {
      const [p, c, t] = await Promise.all([
        request<Product[]>("/products"),
        request<Customer[]>("/customers"),
        request<Tx[]>("/transactions"),
      ]);
      setProducts(p);
      setCustomers(c);
      setTransactions(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (token) load();
  }, [token]);
  function handleLogin(result: {
    token: string;
    user: { name: string; email: string; role: string };
  }) {
    localStorage.setItem("kasirkita_token", result.token);
    localStorage.setItem("kasirkita_user", JSON.stringify(result.user));
    setLoggedUser(result.user);
    setToken(result.token);
  }
  function handleLogout() {
    localStorage.removeItem("kasirkita_token");
    localStorage.removeItem("kasirkita_user");
    setToken(null);
    setLoggedUser(null);
    setProducts([]);
    setCustomers([]);
    setTransactions([]);
  }
  const filtered = useMemo(
    () =>
      products.filter((p) =>
        `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );
  const total = cart.reduce((s, x) => s + x.product.price * x.quantity, 0);
  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const body = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        is_available: 1,
      };
      await request(edit ? `/products/${edit.id}` : "/products", {
        method: edit ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      setShowProduct(false);
      setEdit(null);
      setForm({
        name: "",
        price: "",
        stock: "",
        category: "",
        description: "",
      });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan");
    }
  }
  function openEdit(p: Product) {
    setEdit(p);
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      category: p.category || "",
      description: p.description || "",
    });
    setShowProduct(true);
  }
  async function deleteProduct(id: number) {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await request(`/products/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus");
    }
  }
  function addCart(p: Product) {
    setCart((old) => {
      const found = old.find((x) => x.product.id === p.id);
      if (found)
        return old.map((x) =>
          x.product.id === p.id
            ? { ...x, quantity: Math.min(x.quantity + 1, p.stock) }
            : x,
        );
      return [...old, { product: p, quantity: 1 }];
    });
  }
  async function checkout() {
    if (!cart.length) return alert("Keranjang masih kosong");
    if (Number(paid) < total) return alert("Pembayaran kurang dari total");
    try {
      await request("/transactions", {
        method: "POST",
        body: JSON.stringify({
          customer_id: customerId ? Number(customerId) : null,
          payment_method: method,
          paid_amount: Number(paid),
          items: cart.map((x) => ({
            product_id: x.product.id,
            quantity: x.quantity,
          })),
        }),
      });
      setCart([]);
      setPaid("");
      setCustomerId("");
      await load();
      alert("Transaksi berhasil disimpan");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Transaksi gagal");
    }
  }
  async function addCustomer(e: React.FormEvent) {
    e.preventDefault();
    try {
      await request("/customers", {
        method: "POST",
        body: JSON.stringify(customerForm),
      });
      setCustomerForm({ name: "", phone: "", email: "" });
      await load();
      alert("Pelanggan berhasil ditambahkan");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal");
    }
  }
  const nav = [
    ["dashboard", "Ringkasan", LayoutDashboard],
    ["products", "Produk", Package],
    ["customers", "Pelanggan", Users],
    ["sales", "Kasir / POS", ShoppingCart],
    ["transactions", "Transaksi", Receipt],
  ] as const;
  if (!token) return <Login onLogin={handleLogin} />;
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img src={Logo} alt="Logo KasirKita POS" className="brand-logo" />
          <div>
            <b>KasirKita</b>
            <small>POINT OF SALE</small>
          </div>
        </div>
        <div className="nav-label">MENU UTAMA</div>
        {nav.map(([id, label, Icon]) => (
          <button
            key={id}
            className={`nav-item ${page === id ? "active" : ""}`}
            onClick={() => setPage(id)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
        <div className="side-bottom">
          <div className="status-dot" /> API Server <span>●</span>
          <small>localhost:3000</small>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">SISTEM INFORMASI PENJUALAN</div>
            <h1>{nav.find((n) => n[0] === page)?.[1]}</h1>
          </div>
          <div className="top-actions">
            <button className="icon-btn" onClick={load} title="Muat ulang">
              <RefreshCw size={17} />
            </button>
            <div className="avatar">
              {(loggedUser?.name || "A").charAt(0).toUpperCase()}
            </div>
            <div className="profile">
              <b>{loggedUser?.name || "Admin Toko"}</b>
              <small>{loggedUser?.role || "Administrator"}</small>
            </div>
            <button
              className="secondary logout-btn"
              onClick={handleLogout}
              title="Keluar"
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </header>
        {error && (
          <div className="alert">
            {error} — Pastikan backend aktif pada port 3000.
          </div>
        )}
        {loading && <div className="loading">Memuat data dari REST API…</div>}
        {page === "dashboard" && (
          <>
            <section className="welcome">
              <div>
                <span className="pill">● SISTEM AKTIF</span>
                <h2>Selamat datang di KasirKita 👋</h2>
                <p>
                  Kelola produk, pelanggan, dan transaksi penjualan dalam satu
                  tempat.
                </p>
              </div>
              <button className="primary" onClick={() => setPage("sales")}>
                <ShoppingCart size={17} /> Buat Transaksi
              </button>
            </section>
            <section className="stats">
              <Stat
                icon={<Package />}
                label="Total Produk"
                value={String(products.length)}
                note="Produk terdaftar"
              />
              <Stat
                icon={<Users />}
                label="Total Pelanggan"
                value={String(customers.length)}
                note="Pelanggan tersimpan"
              />
              <Stat
                icon={<Receipt />}
                label="Total Transaksi"
                value={String(transactions.length)}
                note="Transaksi tercatat"
              />
              <Stat
                icon={<CircleDollarSign />}
                label="Total Penjualan"
                value={rupiah(transactions.reduce((s, t) => s + t.total, 0))}
                note="Akumulasi transaksi"
              />
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h3>Produk Terbaru</h3>
                  <p>Daftar produk yang tersedia di sistem</p>
                </div>
                <button
                  className="text-btn"
                  onClick={() => setPage("products")}
                >
                  Lihat semua →
                </button>
              </div>
              <ProductTable
                products={products.slice(0, 5)}
                onEdit={openEdit}
                onDelete={deleteProduct}
              />
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h3>Transaksi Terakhir</h3>
                  <p>Riwayat penjualan terbaru</p>
                </div>
                <button
                  className="text-btn"
                  onClick={() => setPage("transactions")}
                >
                  Lihat semua →
                </button>
              </div>
              <TransactionTable items={transactions.slice(0, 5)} />
            </section>
          </>
        )}
        {page === "products" && (
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>Manajemen Produk</h3>
                <p>Tambah, ubah, dan hapus data produk</p>
              </div>
              <button
                className="primary"
                onClick={() => {
                  setEdit(null);
                  setForm({
                    name: "",
                    price: "",
                    stock: "",
                    category: "",
                    description: "",
                  });
                  setShowProduct(true);
                }}
              >
                <Plus size={17} /> Tambah Produk
              </button>
            </div>
            <div className="toolbar">
              <div className="search">
                <Search size={17} />
                <input
                  placeholder="Cari nama atau kategori produk…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <span>{filtered.length} produk</span>
            </div>
            <ProductTable
              products={filtered}
              onEdit={openEdit}
              onDelete={deleteProduct}
            />
          </section>
        )}
        {page === "customers" && (
          <div className="two-col">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h3>Tambah Pelanggan</h3>
                  <p>Data pelanggan disimpan ke database server</p>
                </div>
              </div>
              <form className="form-grid" onSubmit={addCustomer}>
                <label>
                  Nama pelanggan
                  <input
                    required
                    value={customerForm.name}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, name: e.target.value })
                    }
                    placeholder="Nama lengkap"
                  />
                </label>
                <label>
                  Nomor telepon
                  <input
                    value={customerForm.phone}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        phone: e.target.value,
                      })
                    }
                    placeholder="08xxxxxxxxxx"
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="nama@email.com"
                  />
                </label>
                <button className="primary">Simpan Pelanggan</button>
              </form>
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h3>Daftar Pelanggan</h3>
                  <p>{customers.length} pelanggan terdaftar</p>
                </div>
              </div>
              {customers.map((c) => (
                <div className="customer-row" key={c.id}>
                  <div className="customer-avatar">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <b>{c.name}</b>
                    <small>
                      {c.phone || c.email || "Kontak belum tersedia"}
                    </small>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
        {page === "sales" && (
          <div className="sales-layout">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h3>Pilih Produk</h3>
                  <p>Klik produk untuk memasukkan ke keranjang</p>
                </div>
              </div>
              <div className="search full">
                <Search size={17} />
                <input
                  placeholder="Cari produk…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="product-grid">
                {filtered.map((p) => (
                  <button
                    className="product-card"
                    key={p.id}
                    disabled={p.stock < 1}
                    onClick={() => addCart(p)}
                  >
                    <div className="product-symbol">
                      <Package size={24} />
                    </div>
                    <b>{p.name}</b>
                    <small>
                      {p.category || "Umum"} · Stok {p.stock}
                    </small>
                    <strong>{rupiah(p.price)}</strong>
                    <span>+ Tambahkan</span>
                  </button>
                ))}
              </div>
            </section>
            <section className="panel cart-panel">
              <div className="panel-head">
                <div>
                  <h3>
                    <ShoppingCart size={18} /> Keranjang
                  </h3>
                  <p>{cart.length} jenis produk</p>
                </div>
                <button className="text-btn" onClick={() => setCart([])}>
                  Kosongkan
                </button>
              </div>
              {cart.length === 0 ? (
                <div className="empty">
                  <ShoppingCart size={32} />
                  <b>Keranjang masih kosong</b>
                  <small>Pilih produk untuk memulai transaksi</small>
                </div>
              ) : (
                cart.map((x) => (
                  <div className="cart-row" key={x.product.id}>
                    <div>
                      <b>{x.product.name}</b>
                      <small>{rupiah(x.product.price)} / item</small>
                    </div>
                    <div className="qty">
                      <button
                        onClick={() =>
                          setCart((c) =>
                            c.map((y) =>
                              y.product.id === x.product.id
                                ? {
                                    ...y,
                                    quantity: Math.max(1, y.quantity - 1),
                                  }
                                : y,
                            ),
                          )
                        }
                      >
                        −
                      </button>
                      <b>{x.quantity}</b>
                      <button
                        onClick={() =>
                          setCart((c) =>
                            c.map((y) =>
                              y.product.id === x.product.id
                                ? {
                                    ...y,
                                    quantity: Math.min(
                                      y.product.stock,
                                      y.quantity + 1,
                                    ),
                                  }
                                : y,
                            ),
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove"
                      onClick={() =>
                        setCart((c) =>
                          c.filter((y) => y.product.id !== x.product.id),
                        )
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
              <div className="checkout">
                <label>
                  Pelanggan
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  >
                    <option value="">Pelanggan umum</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Metode pembayaran
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    {["Tunai", "QRIS", "Transfer", "Kartu"].map((x) => (
                      <option>{x}</option>
                    ))}
                  </select>
                </label>
                <div className="total-line">
                  <span>Total</span>
                  <b>{rupiah(total)}</b>
                </div>
                <label>
                  Jumlah dibayar
                  <input
                    type="number"
                    min={total}
                    value={paid}
                    onChange={(e) => setPaid(e.target.value)}
                    placeholder="Masukkan nominal pembayaran"
                  />
                </label>
                <div className="total-line change">
                  <span>Kembalian</span>
                  <b>{rupiah(Math.max(0, Number(paid || 0) - total))}</b>
                </div>
                <button
                  className="primary checkout-btn"
                  disabled={!cart.length}
                  onClick={checkout}
                >
                  Selesaikan Transaksi
                </button>
              </div>
            </section>
          </div>
        )}
        {page === "transactions" && (
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>Riwayat Transaksi</h3>
                <p>Seluruh transaksi penjualan dari database</p>
              </div>
              <button className="secondary" onClick={load}>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
            <TransactionTable items={transactions} />
          </section>
        )}
      </main>
      {showProduct && (
        <div className="modal-backdrop" onClick={() => setShowProduct(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <div>
                <h3>{edit ? "Ubah Produk" : "Tambah Produk"}</h3>
                <p>Lengkapi informasi produk berikut</p>
              </div>
              <button
                className="icon-btn"
                onClick={() => setShowProduct(false)}
              >
                <X />
              </button>
            </div>
            <form className="form-grid" onSubmit={saveProduct}>
              <label>
                Nama produk
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <div className="inline-fields">
                <label>
                  Harga (Rp)
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </label>
                <label>
                  Stok
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                Kategori
                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="Makanan / Minuman"
                />
              </label>
              <label>
                Deskripsi
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setShowProduct(false)}
                >
                  Batal
                </button>
                <button className="primary">
                  {edit ? "Simpan Perubahan" : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function Stat({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="stat">
      <div className="stat-icon">{icon}</div>
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{note}</span>
    </div>
  );
}
function ProductTable({
  products,
  onEdit,
  onDelete,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>PRODUK</th>
            <th>KATEGORI</th>
            <th>HARGA</th>
            <th>STOK</th>
            <th>STATUS</th>
            <th>AKSI</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="table-product">
                  <div className="mini-icon">
                    <Boxes size={17} />
                  </div>
                  <div>
                    <b>{p.name}</b>
                    <small>SKU-{String(p.id).padStart(4, "0")}</small>
                  </div>
                </div>
              </td>
              <td>{p.category || "Umum"}</td>
              <td>
                <b>{rupiah(p.price)}</b>
              </td>
              <td>{p.stock}</td>
              <td>
                <span className={`badge ${p.stock > 0 ? "good" : "bad"}`}>
                  {p.stock > 0 ? "Tersedia" : "Habis"}
                </span>
              </td>
              <td>
                <button className="action" onClick={() => onEdit(p)}>
                  Ubah
                </button>
                <button
                  className="action danger"
                  onClick={() => onDelete(p.id)}
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="empty-cell">
                Belum ada data produk.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
function TransactionTable({ items }: { items: Tx[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>INVOICE</th>
            <th>PELANGGAN</th>
            <th>TANGGAL</th>
            <th>PEMBAYARAN</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id}>
              <td>
                <b>{t.invoice_number}</b>
              </td>
              <td>{t.customer_name || "Pelanggan umum"}</td>
              <td>{new Date(t.created_at).toLocaleString("id-ID")}</td>
              <td>
                <span className="badge good">{t.payment_method}</span>
              </td>
              <td>
                <b>{rupiah(t.total)}</b>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="empty-cell">
                Belum ada transaksi.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
