# Fullstack Template

Starter template sederhana: `backend` (Express) + `frontend` (Vite + React +
Tailwind). Backend cuma punya 1 endpoint (`/health`) sebagai contoh, frontend
nampilin status koneksi ke backend itu di halaman utama.

## Struktur
```
fullstack-template/
├── backend/     # Express API (app.js, config/, routes/, controllers/, utils/) - lihat backend/README.md
└── frontend/    # Vite + React + Tailwind - lihat frontend/README.md
```

Tiap folder (termasuk sub-folder di `frontend/src/`) punya README sendiri
yang jelasin isi & fungsinya masing-masing.

## Cara jalanin semuanya

Butuh 2 terminal terpisah (backend & frontend jalan bareng):

**Terminal 1 - Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Jalan di `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Jalan di `http://localhost:5173`

Buka `http://localhost:5173` di browser - kalo backend-nya juga jalan,
halaman utama bakal nunjukin badge hijau "Backend Aktif" beserta respons
JSON dari `/health`.

## Kenapa dipisah 2 folder (bukan 1 project)

Backend dan frontend punya `package.json`, `node_modules`, dan siklus
deploy masing-masing (misal backend di-deploy ke Railway, frontend ke
Vercel/Netlify) - misahin dari awal biar gak perlu direstrukturisasi nanti
kalo project makin gede.

## Cara pake template ini buat project baru

1. Backend: tambah model/route/controller baru ngikutin pola `health.*`
   yang udah ada (`routes/<nama>.routes.js` + `controllers/<nama>.controller.js`)
2. Frontend: tambah halaman baru di `pages/`, daftarin di `routes/index.jsx`,
   pisahin logic data-nya ke `hooks/`, potongan UI reusable ke `components/`
