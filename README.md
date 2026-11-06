<<<<<<< HEAD
# KasirKita POS — Proyek UTS PBAD 2026/2027

Project UTS: Sistem E-Commerce/POS berbasis web dengan backend REST API terpusat.

## Cakupan UTS

- Backend Node.js + Express + SQLite3.
- Web Client React + TypeScript + Vite.
- Integrasi dua arah melalui REST API JSON (GET, POST, PUT, DELETE).
- Pengelolaan produk, pelanggan, dan transaksi penjualan.
- Satu database SQLite yang digunakan oleh API; web tidak memiliki database sendiri.

## Prasyarat

- Node.js 20 atau lebih baru
- npm

## Login JWT

Jalankan `npm install` kembali di folder `server` setelah perubahan ini agar paket `bcryptjs` dan `jsonwebtoken` terpasang. Saat pertama kali backend dijalankan, sistem membuat akun admin demo jika belum ada:

- Email: `admin@kasirkita.com`
- Password: `admin123`

Login melalui `POST /api/auth/login`. API mengembalikan JWT yang dikirim frontend sebagai header `Authorization: Bearer <token>`. Endpoint produk, pelanggan, dan transaksi memerlukan token. Ubah `JWT_SECRET` pada file `.env` sebelum digunakan di lingkungan nyata. Password akun disimpan sebagai hash bcrypt.

## Menjalankan backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

API berjalan di `http://localhost:3000`. Database dan tabel dibuat otomatis, lalu data contoh dimasukkan jika tabel produk masih kosong.

## Menjalankan web

Buka terminal kedua:

```bash
cd web
npm install
npm run dev
```

Buka URL Vite yang tampil (umumnya `http://localhost:5173`).

## Pengujian cepat API

```bash
curl http://localhost:3000/api/products
curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -d '{"name":"Teh Lemon","price":12000,"stock":25,"category":"Minuman","description":"Teh lemon dingin","is_available":1}'
```

## Struktur

- `server/`: REST API, routes/controllers/models, SQLite dan SQL init.
- `web/`: React TypeScript web client.
- `docs/`: dokumen perencanaan, use case, flowchart, model data, dan dokumentasi API.

## Catatan

Nama, identitas kelompok, dan anggota masih perlu diisi. Fitur Mobile (React Native) dan Desktop (C# WinForms) merupakan target UAS, bukan cakupan implementasi UTS ini.
=======
# Gobhui
UTS Pengembangan
>>>>>>> 881d05102bf3d516f00a8c4b371070c34b43b89f
