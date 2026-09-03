# Product Requirements Document (PRD)
## Sistem Kasir Berbasis Web untuk Coffee Shop

| | |
|---|---|
| **Nama Produk** | Kopi Senja — Sistem Self-Order QR, Kasir & Antrian Cerdas |
| **Jenis Dokumen** | PRD (Product Requirements Document) |
| **Mata Kuliah** | PAW (Pengembangan Aplikasi Web) — Final Project |
| **Kelompok** | Kelompok 3 |
| **Repositori** | [github.com/iizaghz/final-project-Kelompok-3](https://github.com/iizaghz/final-project-Kelompok-3) |
| **Drive** | [Link Drive Final Project](https://drive.google.com/drive/folders/1JJwn7uKRks8dhfiiyzq7b8TZ_HwLipRE?usp=sharing) |
| **Versi Dokumen** | 2.0 (Final Implementation) |
| **Status** | Selesai / Siap Evaluasi |

---

## 1. Latar Belakang & Tujuan

### 1.1 Latar Belakang
Pada operasional *coffee shop* modern dengan intensitas pengunjung yang tinggi, antrian manual di depan meja kasir sering kali menimbulkan penumpukan fisik, ketidaknyamanan bagi pelanggan, serta memperlambat alur kerja kasir dan barista terutama pada jam-jam sibuk (*peak hours*). Selain itu, kasir kerap kesulitan memberikan penjelasan detail komposisi atau cita rasa menu baru secara konsisten, sementara pelanggan sering merasa cemas karena tidak memiliki kepastian mengenai estimasi waktu dan status penyelesaian pesanan mereka.

Untuk mengatasi kendala tersebut, sistem **Kopi Senja** dikembangkan sebagai aplikasi web *full-stack* modern yang mengintegrasikan:
1. **Self-Ordering Pelanggan (QR Code Menu)**: Pelanggan dapat memindai kode QR di meja, menelusuri katalog menu digital, mengustomisasi pesanan, serta memilih metode pembayaran secara fleksibel (*Bayar di Kasir* atau *Payment Gateway QRIS*).
2. **Dashboard Kasir & Alur Produksi Barista**: Kasir dapat memantau pesanan masuk secara langsung (*real-time*), mengonfirmasi pembayaran tunai/manual, dan memperbarui status tahapan peracikan pesanan.
3. **Sistem Antrian & Layar Display Publik**: Nomor antrian terbit otomatis dan status pesanan terpantau secara transparan melalui *smartphone* pelanggan maupun layar TV display umum di coffee shop, dilengkapi dengan notifikasi audio dan *voice announcement* bahasa Indonesia alami.
4. **Asisten AI Copywriting (Google Gemini API)**: Membantu pengelola coffee shop menyusun deskripsi produk yang menarik, menggugah selera, dan konsisten hanya dalam hitungan detik.

### 1.2 Tujuan Produk
- **Mempercepat Alur Transaksi**: Menghilangkan antrian fisik di meja kasir dengan memungkinkan pemesanan mandiri (*self-order*) melalui browser *smartphone* tanpa perlu memasang aplikasi native.
- **Fleksibilitas Pembayaran**: Menyediakan opsi pembayaran ganda yang realistis, yaitu pembayaran langsung di meja kasir (*Pay at Cashier*) dan pembayaran online instan via Dynamic QRIS (iPaymu Payment Gateway).
- **Transparansi Status & Antrian Realtime**: Memberikan kejelasan posisi antrian dan pembaruan status bertahap (*Menunggu Pembayaran* &rarr; *Diproses* &rarr; *Siap Diambil* &rarr; *Selesai*) kepada pelanggan dan layar display publik.
- **Efisiensi Manajemen Menu Berbasis AI**: Membantu staf menyusun deskripsi menu berkualitas profesional secara instan menggunakan integrasi Google Gemini API.
- **Standar PAW Capstone Project**: Menghadirkan proyek akhir pengembangan aplikasi web yang mendemonstrasikan integrasi *full-stack* modern (Backend Express REST API, Database PostgreSQL/Supabase, Frontend React SPA, Realtime Polling/Event, serta Third-Party API Integration) yang modular, aman, dan siap pakai.

### 1.3 Target Pengguna
| Peran | Deskripsi Akses & Kebutuhan |
|---|---|
| **Pelanggan (Customer)** | Mengakses aplikasi via scan QR code di HP tanpa login wajib, melihat katalog menu & detail, memesan mandiri (*self-order*), memilih metode pembayaran, serta memantau nomor antrian & status pesanan secara *live*. |
| **Kasir / Barista** | Login ke dashboard kasir, melihat aliran pesanan masuk (*live orders*), mengonfirmasi pembayaran kasir, memperbarui status tahapan pesanan (*Diproses*, *Siap*, *Selesai*), dan memanggil pesanan. |
| **Admin / Pengelola** | Mengelola katalog produk dan kategori (CRUD), mengunggah gambar produk, menggunakan fitur AI Gemini untuk generate deskripsi menu, dan memantau ketersediaan stok. |
| **Layar Display Publik (TV/Monitor)** | Halaman publik di area cafe yang menampilkan daftar nomor antrian yang sedang diracik (*Preparing*) dan yang sudah siap diambil (*Ready*), disertai pengumuman suara (*Text-to-Speech*). |

---

## 2. Ruang Lingkup (Scope)

### 2.1 In-Scope
- **Pemesanan Mandiri Pelanggan (QR Menu & Self-Order)**:
  - Akses menu publik via URL atau pemindaian QR Code meja.
  - Katalog produk interaktif dengan filter kategori, pencarian teks, dan modal detail produk.
  - Keranjang belanja reaktif (*Cart Drawer*) dengan kontrol kuantitas dan catatan khusus (*custom notes* per item).
  - Modal checkout mandiri dengan ringkasan pesanan, nama pelanggan, dan nomor meja.
- **Dua Jalur Metode Pembayaran**:
  - **Bayar di Kasir**: Menerbitkan nomor antrian dengan status *Menunggu Pembayaran*. Pelanggan membayar langsung ke kasir, lalu kasir mengonfirmasi pelunasan pada dashboard.
  - **Payment Gateway (iPaymu v2 Dynamic QRIS)**: Menerbitkan QRIS dinamis yang dapat dibayar melalui DANA, GoPay, OVO, ShopeePay, atau Mobile Banking, dengan verifikasi otomatis via webhook callback.
- **Sistem Antrian & Pelacakan Realtime**:
  - Generator nomor antrian harian berurutan dan reset otomatis setiap hari (format: `A-001`, `A-002`, dst.).
  - Halaman pelacakan status pesanan pelanggan (*Order Tracking*) dengan transisi live (*Menunggu Pembayaran* &rarr; *Diproses* &rarr; *Siap* &rarr; *Selesai*).
  - Notifikasi audio (*sound chime*) dan animasi selebrasi (*confetti*) saat pesanan pelanggan siap diambil.
- **Layar Display Antrian Publik (TV Display)**:
  - Tampilan layar penuh (*fullscreen*) dua kolom: **Sedang Diproses** dan **Siap Diambil**.
  - Fitur pemanggil suara otomatis (*Text-to-Speech*) berbahasa Indonesia alami (*Edge-TTS Microsoft Neural* dengan fallback *Google Translate TTS*).
- **Dashboard Kasir & Manajemen Katalog**:
  - Autentikasi aman bagi kasir/admin menggunakan verifikasi JWT dan password terenkripsi bcrypt.
  - Dashboard kasir untuk memantau pesanan aktif, pencarian tiket antrian, konfirmasi pembayaran, dan pembaruan alur produksi.
  - Manajemen katalog produk & kategori (Tambah, Edit, Hapus, status ketersediaan *In-Stock / Out-of-Stock*).
  - Fitur kompresi gambar otomatis di sisi klien sebelum penyimpanan.
  - Asisten AI Google Gemini API untuk menghasilkan draft deskripsi copywriting menu secara otomatis.

### 2.2 Out-of-Scope (untuk versi final project ini)
- Aplikasi mobile native (Android APK / iOS IPA) &mdash; aplikasi difokuskan sebagai *Mobile-First Responsive Web Application*.
- Pengiriman kurir eksternal jarak jauh &mdash; sistem difokuskan pada layanan pesan di tempat (*Dine-in*) dan bawa pulang (*Takeaway*).
- Manajemen multi-cabang/franchise terpusat &mdash; difokuskan pada pengelolaan satu outlet/coffee shop.
- Modul akuntansi pembukuan laba-rugi mendalam dan perpajakan multi-level.

---

## 3. Tech Stack

Tech stack yang diimplementasikan secara aktual pada repositori proyek:

| Layer | Teknologi | Peran / Keterangan |
|---|---|---|
| **Frontend Framework** | React.js 18 (Vite) | Single Page Application (SPA) yang cepat, modular, dan responsif (*Mobile-First* untuk pelanggan & *Desktop/TV Friendly* untuk kasir dan display). |
| **Styling & UI Components** | Tailwind CSS + Lucide React | Utilitas CSS modern untuk antarmuka elegan bertema *coffee shop*, dipadukan dengan ikon visual dari Lucide. |
| **Interactivity & UI FX** | Canvas Confetti + QRCode.react | Efek selebrasi saat pesanan siap diambil dan generator kode QR tiket pesanan di browser. |
| **Routing** | React Router DOM v6 | Manajemen navigasi halaman sisi klien (`/menu`, `/antrian`, `/kasir`, `/display`, `/track/:id`). |
| **Backend API** | Node.js + Express.js (v4.19) | RESTful API arsitektur modular (Controllers, Routes, Middlewares, Services, dan Utils). |
| **Database & Storage** | Supabase (PostgreSQL) / PostgreSQL Pool (`pg`) | Basis data relasional cloud PostgreSQL lengkap dengan indexes, constraints, dan Supabase Storage bucket `products`. |
| **Autentikasi & Keamanan** | JSON Web Token (JWT) + Bcryptjs | Pengamanan endpoint kasir/admin, hashing password, dan verifikasi token sesi. |
| **AI Integration** | Google Gemini API (`@google/genai` & REST) | Pembuatan deskripsi produk otomatis berbasis AI (model `gemini-3.5-flash-lite`, `gemini-3.6-flash`, dll.). |
| **Payment Gateway** | iPaymu API v2 (Direct Dynamic QRIS) | Pemrosesan pembayaran nontunai QRIS real-time dengan integrasi notifikasi webhook callback server-to-server. |
| **Voice & Audio Announcement** | Edge-TTS (Neural Voice) / Google TTS | Generator suara panggilan antrian berbahasa Indonesia alami (`id-ID-ArdiNeural`) untuk display publik. |
| **Realtime Sync** | Polling Interval (3-4 detik) & Supabase Sync | Sinkronisasi status pesanan dan antrian secara live ke HP pelanggan, dashboard kasir, dan display TV. |

---

## 4. Struktur Tim & Pembagian Kerja

Pembagian tugas kelompok telah diselaraskan dengan PRD versi 2.0 serta commit aktual pada repositori GitHub:

| Anggota | NIM | Bagian yang Dikerjakan (Sesuai Implementasi Aktual) | Cakupan Modul & File Utama |
|---|---|---|---|
| **Salwa Anjaini Futri Endsani** | 20240140139 | **Autentikasi Kasir/Admin, Dashboard Kasir & Display Antrian Publik** | `auth.routes.js`, `auth.controller.js`, `display.routes.js`, `display.controller.js`, `DisplayPage.jsx`, `CashierNavbar.jsx`, `LoginModal.jsx`, sesi JWT & bcrypt. |
| **Sukma Hawa Iza Ghazali** | 20240140148 | **Manajemen Produk & Kategori, Detail Produk & Integrasi AI Gemini** | `product.routes.js`, `product.controller.js`, `category.routes.js`, `category.controller.js`, `gemini.service.js`, `ProductCard.jsx`, `ProductDetailModal.jsx`, Tab Menu `CashierPage.jsx`. |
| **Nur Zukhrufiyati Sartika Putri** | 20240140154 | **Manajemen Pesanan Kasir, Konfirmasi Pembayaran & Update Status Pesanan** | `order.controller.js` (`getOrders`, `getOrderById`, `confirmCashierPayment`, `updateOrderStatus`), Tab Pesanan `CashierPage.jsx`, filter status kasir, alur konfirmasi pelunasan & produksi pesanan. |
| **Tasya Maulida Putri** | 20240140239 | **QR Menu, Keranjang & Checkout, Payment Gateway & Pelacakan Antrian Realtime** | `MenuPage.jsx`, `CartDrawer.jsx`, `CheckoutModal.jsx`, `QueuePage.jsx`, `order.controller.js` (`createOrder`), `queue.service.js`, `ipaymu.service.js`, `payment.routes.js`, `payment.controller.js`. |



## 5. User Stories

| ID | Sebagai | Saya ingin | Agar | Penanggung Jawab |
|---|---|---|---|---|
| **US-01** | Pelanggan | Memindai QR Code di meja coffee shop | Bisa langsung membuka katalog menu digital tanpa antre di kasir atau install aplikasi. | Tasya |
| **US-02** | Pelanggan | Melihat katalog menu lengkap dengan kategori, foto, dan modal detail produk | Mengetahui komposisi, harga, dan karakteristik rasa minuman sebelum memesan. | Iza & Tasya |
| **US-03** | Pelanggan | Menambahkan item ke keranjang dan menyisipkan catatan khusus (misal: *less sugar, ice normal*) | Pesanan saya tercatat secara akurat sesuai preferensi personal. | Tasya |
| **US-04** | Pelanggan | Memilih metode pembayaran (**Bayar di Kasir** atau **Payment Gateway QRIS**) saat checkout | Dapat bertransaksi fleksibel, baik menggunakan uang tunai langsung ke kasir maupun dompet digital (DANA, GoPay, OVO, m-Banking). | Tasya |
| **US-05** | Pelanggan | Memantau nomor antrian dan status pesanan secara *real-time* dari HP | Tahu pasti perkembangan pesanan tanpa perlu berdiri menunggu di depan bar. | Tasya |
| **US-06** | Pelanggan | Menerima notifikasi visual dan audio saat pesanan berstatus **Siap** | Dapat langsung menuju konter untuk mengambil pesanan selagi masih segar dan hangat/dingin. | Tasya |
| **US-07** | Kasir | Login ke dashboard operasional kasir dengan aman | Mengakses data transaksi toko dan mengontrol operasional pemesanan. | Salwa |
| **US-08** | Kasir | Melihat daftar pesanan masuk dan mengonfirmasi pembayaran untuk pesanan "Bayar di Kasir" | Transaksi tercatat lunas sebelum barista mulai meracik pesanan. | Nur |
| **US-09** | Kasir / Barista | Mengubah tahapan pesanan (**Diproses** &rarr; **Siap** &rarr; **Selesai**) secara bertahap | Alur produksi tertata rapi dan pelanggan menerima pembaruan status yang akurat. | Nur |
| **US-10** | Admin / Kasir | Mengelola katalog produk dan memanfaatkan asisten AI Gemini | Menu selalu *up-to-date* dengan deskripsi copywriting yang memikat tanpa mengetik manual. | Iza |
| **US-11** | Pengunjung Cafe | Melihat layar display antrian publik di TV cafe | Seluruh pelanggan di ruangan dapat melihat nomor antrian yang sedang diracik dan siap diambil disertai panggilan suara. | Salwa |

---

## 6. Kebutuhan Fungsional (Functional Requirements)

### 6.1 Modul Salwa: Autentikasi Kasir & Dashboard Operasional
- **FR-1.1**: Sistem menyediakan form login aman khusus kasir dan admin menggunakan email dan kata sandi.
- **FR-1.2**: Sistem mengenkripsi kata sandi menggunakan *bcrypt* dan memvalidasi akses endpoint API menggunakan *JSON Web Token (JWT)*.
- **FR-1.3**: Setelah autentikasi berhasil, kasir diarahkan ke dashboard operasional kasir (`/kasir`), sedangkan akses publik yang tidak memiliki token ditolak.
- **FR-1.4**: Dashboard kasir menyediakan navigasi terpadu (*CashierNavbar*) untuk beralih antara Tab Pesanan Masuk, Tab Manajemen Menu, dan tombol Logout.
- **FR-1.5**: Dashboard menampilkan ringkasan metrik operasional harian (jumlah pesanan aktif, pesanan menunggu pembayaran, dan total antrian berjalan).

### 6.2 Modul Salwa: Layar Display Antrian Publik (Public TV Display)
- **FR-2.1**: Sistem menyediakan antarmuka display antrian publik (`/display` atau `/tv`) yang dirancang khusus untuk layar monitor/TV beresolusi tinggi di area cafe.
- **FR-2.2**: Layar display menampilkan dua kolom antrian utama:
  - **Sedang Diproses / Preparing**: Menampilkan nomor antrian yang pembayarannya telah terverifikasi dan sedang diracik barista.
  - **Siap Diambil / Ready for Pickup**: Menampilkan nomor antrian yang telah selesai diracik dan siap diambil di konter.
- **FR-2.3**: Layar display melakukan sinkronisasi data antrian secara otomatis (*live auto-refresh*) setiap 3–4 detik.
- **FR-2.4**: Sistem mengintegrasikan fitur pemanggilan suara otomatis (*Voice Announcement Text-to-Speech*) berbahasa Indonesia alami menggunakan model Microsoft Neural (`id-ID-ArdiNeural`) dengan *fallback* Google Translate TTS ketika nomor antrian masuk ke status *Siap*.

### 6.3 Modul Iza: Manajemen Katalog Produk & Kategori
- **FR-3.1**: Kasir/Admin dapat melihat, menambah, memperbarui, dan menghapus (CRUD) kategori menu (e.g. Coffee, Non-Coffee, Pastry, Signature).
- **FR-3.2**: Kasir/Admin dapat mengelola data produk meliputi: Nama Produk, Kategori, Harga (Rupiah), Deskripsi Produk, URL/File Foto, dan Status Ketersediaan (*Tersedia / Habis*).
- **FR-3.3**: Produk yang diubah statusnya menjadi "Habis" (*is_available = false*) otomatis dinonaktifkan di katalog pelanggan sehingga tidak dapat dimasukkan ke keranjang belanja.
- **FR-3.4**: Form produk mendukung input URL gambar eksternal maupun *file upload* dengan kompresi gambar otomatis di sisi klien (maksimal lebar 800px, format JPEG) untuk menghemat ruang penyimpanan.

### 6.4 Modul Iza: Detail Produk & Integrasi AI Gemini Copywriter
- **FR-4.1**: Sistem menyediakan komponen kartu produk (*ProductCard*) dan modal informasi detail (*ProductDetailModal*) yang interaktif untuk menampilkan nama, foto resolusi tinggi, kategori, harga, dan deskripsi lengkap.
- **FR-4.2**: Pada form penambahan dan pengeditan produk di dashboard kasir, disediakan tombol khusus **"✨ Generate Deskripsi AI"**.
- **FR-4.3**: Saat tombol ditekan, sistem mengirim nama produk dan kategori ke layanan Gemini Service (`gemini.service.js`) menggunakan Google Gemini API (`@google/genai` / REST).
- **FR-4.4**: Prompt AI dioptimasi khusus untuk menghasilkan narasi deskripsi menu coffee shop modern yang estetik, menggugah selera, dan profesional (2–3 kalimat).
- **FR-4.5**: Hasil draft deskripsi otomatis dimasukkan ke dalam kolom deskripsi form agar staf kasir dapat meninjau, mengedit, atau menyetujuinya sebelum disimpan ke database.

### 6.5 Modul Nur: Manajemen Pesanan Kasir (Order Stream & Monitoring)
- **FR-5.1**: Kasir dapat memantau aliran pesanan masuk (*live order stream*) secara kronologis dari pesanan terbaru.
- **FR-5.2**: Dashboard kasir menyediakan filter tab pesanan berdasarkan status: *Semua*, *Menunggu Pembayaran*, *Diproses*, *Siap*, dan *Selesai*.
- **FR-5.3**: Sistem menampilkan informasi pesanan secara rinci: Nomor Antrian, Nama Pelanggan, Nomor Meja, Waktu Pemesanan, Metode Pembayaran, Status Pembayaran, Total Tagihan, serta rincian item beserta catatan kustomisasi (*notes*).
- **FR-5.4**: Kasir dapat mencari pesanan tertentu berdasarkan nomor antrian atau nama pelanggan melalui kolom pencarian instan.

### 6.6 Modul Nur: Konfirmasi Pembayaran Kasir & Transisi Status Pesanan
- **FR-6.1**: Untuk pesanan dengan metode **Bayar di Kasir**, kasir dapat memverifikasi uang fisik/manual dari pelanggan dan menekan tombol **"Konfirmasi Pembayaran"**.
- **FR-6.2**: Saat konfirmasi pembayaran ditekan, sistem memvalidasi transaksi, memperbarui status pembayaran menjadi `paid`, dan mengubah status pesanan dari `pending_payment` menjadi `processing` (*Diproses*).
- **FR-6.3**: Kasir/barista dapat mengubah status pesanan secara bertahap sesuai alur produksi:
  - Tombol **"Pesanan Siap"**: Mengubah status dari `processing` menjadi `ready`, yang secara otomatis memicu notifikasi suara/visual ke HP pelanggan dan layar display publik.
  - Tombol **"Selesaikan Pesanan"**: Mengubah status dari `ready` menjadi `completed` saat pesanan telah diserahkan kepada pelanggan.
- **FR-6.4**: Kasir memiliki opsi membatalkan pesanan (*cancel order*) jika terjadi kendala pada bahan baku atau pembatalan transaksi oleh pelanggan.

### 6.7 Modul Tasya: Pemesanan Mandiri Pelanggan (QR Menu, Keranjang & Checkout)
- **FR-7.1**: Sistem menyediakan halaman menu publik (`/` atau `/menu`) yang dapat diakses langsung oleh pelanggan via *smartphone* tanpa perlu login atau registrasi.
- **FR-7.2**: Pelanggan dapat memfilter menu berdasarkan kategori dan mencari menu favorit melalui kolom pencarian reaktif.
- **FR-7.3**: Pelanggan dapat memilih produk, menentukan kuantitas pesanan, dan menambahkan catatan preferensi (*notes*, misalnya: *"less sugar, extra espresso shot"*).
- **FR-7.4**: Sistem menyediakan keranjang belanja reaktif (*Cart Drawer*) yang menampilkan daftar item, subtotal, tombol penyesuaian jumlah item, dan total nominal tagihan secara *real-time*.
- **FR-7.5**: Pada modal *Checkout*, pelanggan mengisi informasi identitas singkat (Nama Pemesan dan Nomor Meja) serta memilih metode pembayaran: **Bayar di Kasir** atau **Payment Gateway (iPaymu QRIS)**.

### 6.8 Modul Tasya: Payment Gateway iPaymu Dynamic QRIS & Webhook Callback
- **FR-8.1**: Apabila pelanggan memilih metode pembayaran *Payment Gateway*, sistem memanggil integrasi iPaymu API v2 (`/api/v2/payment/direct` dengan metode `qris`).
- **FR-8.2**: Sistem menerbitkan Dynamic QRIS resmi berstandar nasional yang langsung ditampilkan pada layar checkout pelanggan dan dapat dipindai oleh seluruh aplikasi e-wallet (DANA, GoPay, OVO, ShopeePay) serta m-Banking.
- **FR-8.3**: Sistem menyediakan endpoint webhook callback publik (`POST /api/payment/callback`) untuk menerima notifikasi pelunasan instan dari server iPaymu.
- **FR-8.4**: Saat webhook callback berstatus sukses (`berhasil` / `status_code: 1`) diterima, backend secara otomatis memvalidasi transaksi, mencatat ID referensi iPaymu, mengubah status pembayaran menjadi `paid`, dan mengubah status pesanan menjadi `processing` (*Diproses*).

### 6.9 Modul Tasya: Pelacakan Antrian Realtime & Notifikasi Audio-Visual Pelanggan
- **FR-9.1**: Setelah pesanan berhasil dibuat, sistem secara otomatis menerbitkan nomor antrian harian unik (format `A-001`, `A-002`, dst.) dan mengarahkan pelanggan ke halaman pelacakan antrian (`/antrian` atau `/track/:orderId`).
- **FR-9.2**: Halaman antrian menampilkan kartu tiket digital, kode QR pesanan, nama pelanggan, nomor meja, rincian pesanan, dan indikator tahapan alur (*Stepper Tracker*).
- **FR-9.3**: Halaman antrian melakukan sinkronisasi status live (*realtime polling*) setiap 3 detik sehingga perubahan status dari kasir langsung terefleksi di layar HP pelanggan.
- **FR-9.4**: Saat status pesanan berubah menjadi **Siap**, sistem membunyikan lonceng audio (*sound chime*), menampilkan banner animasi panggil, dan memicu efek visual selebrasi kembang api (*Canvas Confetti*).
- **FR-9.5**: Informasi pesanan tersimpan pada penyimpanan lokal browser (*localStorage*) sehingga pelanggan dapat memuat ulang halaman tanpa kehilangan nomor antriannya.

---

## 7. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan & Standar Kualitas |
|---|---|
| **Usability & UX** | Antarmuka pelanggan mengusung filosofi *Mobile-First Design* dengan palet warna hangat khas coffee shop (*slate*, *amber*, *warm stone*). Alur pemesanan dari scan QR hingga selesai checkout dapat diselesaikan dalam waktu kurang dari 60 detik. |
| **Performance** | Waktu respon rata-rata API backend < 300ms. Latensi sinkronisasi status pesanan ke layar HP pelanggan dan display TV ≤ 3 detik setelah aksi dilakukan oleh kasir. Gambar menu dikompresi di sisi klien sebelum dikirim. |
| **Security** | Seluruh kata sandi kasir dan admin di-hash menggunakan algoritma *bcrypt* dengan salt rounds 10. Endpoint operasional kasir dilindungi verifikasi *JSON Web Token (JWT)*. Endpoint callback webhook diverifikasi berdasarkan nomor referensi transaksi. |
| **Reliability** | Penomoran antrian harian dijamin tidak terjadi duplikasi (*zero race condition*) melalui mekanisme penghitungan atomik berbasis tanggal. Sistem dilengkapi *mock fallback* agar tetap dapat berjalan meskipun koneksi database eksternal terganggu. |
| **Maintainability** | Kode dirancang dengan arsitektur bersih (*Clean Architecture*): pemisahan jelas antara Controllers, Routes, Services, Middlewares di backend, serta Pages, Components, Hooks, Context di frontend. |
| **Compatibility** | Kompatibel penuh dan responsif di berbagai peramban modern (Google Chrome, Safari iOS, Mozilla Firefox, Microsoft Edge) pada perangkat *smartphone*, tablet, laptop kasir, hingga Smart TV monitor cafe. |

---

## 8. Skema Data (Supabase PostgreSQL Schema)

Struktur tabel relasional PostgreSQL yang diimplementasikan pada database proyek:

### 8.1 Users (Tabel Pengguna Kasir & Admin)
| Field | Tipe Data (PostgreSQL) | Constraints | Keterangan |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik pengguna |
| `name` | VARCHAR(100) | NOT NULL | Nama lengkap kasir / admin |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Email untuk autentikasi login |
| `password` | VARCHAR(255) | NOT NULL | Kata sandi terenkripsi (bcrypt) |
| `role` | VARCHAR(20) | NOT NULL, CHECK (role IN ('admin', 'kasir')) | Hak akses akun |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Waktu pembuatan akun |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Waktu pembaruan terakhir |

### 8.2 Categories (Tabel Kategori Menu)
| Field | Tipe Data (PostgreSQL) | Constraints | Keterangan |
|---|---|---|---|
| `id` | BIGSERIAL | PRIMARY KEY | ID kategori |
| `name` | VARCHAR(100) | NOT NULL | Nama kategori (e.g. Coffee, Pastry) |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | URL identifier kategori |
| `icon` | VARCHAR(50) | DEFAULT 'coffee' | Nama ikon UI kategori |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Waktu pembuatan |

### 8.3 Products (Tabel Katalog Produk)
| Field | Tipe Data (PostgreSQL) | Constraints | Keterangan |
|---|---|---|---|
| `id` | BIGSERIAL | PRIMARY KEY | ID produk |
| `category_id` | BIGINT | REFERENCES categories(id) ON DELETE SET NULL | Relasi ke kategori menu |
| `name` | VARCHAR(150) | NOT NULL | Nama produk menu |
| `description` | TEXT | NULLABLE | Deskripsi menu (didukung AI Gemini) |
| `price` | NUMERIC(12, 2) | NOT NULL, DEFAULT 0 | Harga menu dalam Rupiah |
| `image_url` | TEXT | NULLABLE | URL foto produk di Supabase Storage |
| `is_available` | BOOLEAN | NOT NULL, DEFAULT TRUE | Status ketersediaan produk (*In-Stock*) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Waktu pembuatan menu |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Waktu modifikasi terakhir |

### 8.4 Orders (Tabel Transaksi & Antrian)
| Field | Tipe Data (PostgreSQL) | Constraints | Keterangan |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | ID unik transaksi pesanan |
| `queue_number` | VARCHAR(20) | NOT NULL | Nomor antrian harian (e.g. `A-001`) |
| `customer_name` | VARCHAR(100) | NOT NULL | Nama pelanggan |
| `table_number` | VARCHAR(20) | DEFAULT '-' | Nomor meja pemesan |
| `total_amount` | NUMERIC(12, 2) | NOT NULL, DEFAULT 0 | Total nominal belanja (Rp) |
| `payment_method` | VARCHAR(30) | CHECK (payment_method IN ('cashier', 'payment_gateway')) | Opsi pembayaran |
| `payment_status` | VARCHAR(30) | CHECK (payment_status IN ('pending', 'paid', 'cancelled')) | Status pelunasan transaksi |
| `order_status` | VARCHAR(30) | CHECK (order_status IN ('pending_payment', 'processing', 'ready', 'completed', 'cancelled')) | Tahapan alur pesanan |
| `payment_reference`| VARCHAR(100) | NULLABLE | ID Transaksi dari iPaymu / gateway |
| `qris_url` | TEXT | NULLABLE | URL barcode QRIS dari iPaymu |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Waktu pesanan dibuat |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Waktu status terakhir berubah |

### 8.5 OrderItems (Tabel Rincian Item Pesanan)
| Field | Tipe Data (PostgreSQL) | Constraints | Keterangan |
|---|---|---|---|
| `id` | BIGSERIAL | PRIMARY KEY | ID baris item pesanan |
| `order_id` | UUID | REFERENCES orders(id) ON DELETE CASCADE | Relasi ke tabel Orders |
| `product_id` | BIGINT | REFERENCES products(id) ON DELETE RESTRICT | Relasi ke tabel Products |
| `quantity` | INTEGER | NOT NULL, CHECK (quantity > 0) | Jumlah porsi item |
| `unit_price` | NUMERIC(12, 2) | NOT NULL, DEFAULT 0 | Harga satuan saat checkout |
| `subtotal` | NUMERIC(12, 2) | NOT NULL, DEFAULT 0 | Subtotal (`quantity * unit_price`) |
| `notes` | TEXT | NULLABLE | Catatan kustomisasi pesanan |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Waktu item dicatat |

### 8.6 Database Indexes & Storage Bucket
- **Indeks Pencarian Cepat**: `idx_orders_order_status`, `idx_orders_queue_number`, `idx_orders_created_at`, `idx_products_category_id`, `idx_order_items_order_id`.
- **Supabase Storage Bucket**: Bucket publik bernama `products` untuk menyimpan aset foto menu dengan kebijakan *Public Access Read Only*.

---

## 9. Alur Utama (User Flow)

### 9.1 Alur Pelanggan (QR Self-Ordering Flow)
1. **Pindai QR Code**: Pelanggan memindai QR code di meja coffee shop menggunakan kamera smartphone untuk membuka halaman `/menu`.
2. **Eksplorasi Katalog**: Pelanggan memfilter kategori produk (Coffee, Non-Coffee, Pastry, Signature) dan melihat modal detail produk yang memuat deskripsi lengkap racikan AI.
3. **Pilih Menu & Keranjang**: Pelanggan menentukan jumlah porsi, menambahkan catatan khusus (*misal: less sugar, oat milk*), lalu menambahkannya ke Keranjang Belanja.
4. **Checkout & Ringkasan**: Pelanggan membuka modal checkout, menginputkan nama dan nomor meja, serta meninjau rincian tagihan.
5. **Pemilihan Metode Pembayaran**:
   - **Opsi A (Bayar di Kasir)**: Sistem langsung menerbitkan nomor antrian dengan status `Menunggu Pembayaran`. Pelanggan mendatangi kasir, menyebutkan nomor antrian, dan melakukan pembayaran tunai.
   - **Opsi B (Payment Gateway QRIS)**: Sistem menerbitkan kode Dynamic QRIS dari iPaymu. Pelanggan memindai QRIS via aplikasi e-wallet (DANA, OVO, GoPay) atau mobile banking. Server iPaymu memicu webhook callback yang otomatis mengubah status menjadi `Diproses`.
6. **Live Tracking Antrian**: Pelanggan diarahkan ke halaman `/track/:orderId` untuk memantau status pesanan secara real-time.
7. **Notifikasi Pesanan Siap**: Saat barista menyelesaikan racikan dan status diubah menjadi `Siap`, ponsel pelanggan membunyikan suara lonceng (*chime*), menampilkan banner panggilan, dan menyalakan animasi kembang api (*confetti*).
8. **Pengambilan Pesanan**: Pelanggan mendatangi konter pengambilan, menunjukkan nomor antrian, dan menerima menu pesanannya.


### 9.2 Alur Kasir (Operasional Dashboard)
1. **Login Sesi**: Kasir memasukkan email dan password terdaftar untuk memperoleh token JWT.
2. **Monitoring Pesanan Masuk**: Kasir memantau daftar pesanan aktif secara live pada tab *Pesanan Masuk*.
3. **Konfirmasi Pembayaran Kasir**: Untuk pesanan bertanda *Bayar di Kasir*, kasir menerima pembayaran pelanggan lalu mengklik tombol **"Konfirmasi Pembayaran"** (status langsung beralih ke `Diproses`).
4. **Update Alur Produksi**:
   - Setelah pesanan selesai diracik oleh barista, kasir mengklik tombol **"Pesanan Siap"** (membuat status menjadi `Siap` dan memicu audio display serta notifikasi di HP pelanggan).
   - Saat pesanan diserahkan di konter, kasir mengklik tombol **"Selesai"** (menghilangkan nomor dari display antrian aktif).
5. **Manajemen Menu**: Kasir/Admin membuka tab *Katalog Menu* untuk memperbarui harga, ketersediaan stok, foto produk, serta menggunakan generator AI untuk menu baru.

### 9.3 Alur Generator Deskripsi Menu AI (Gemini Integration)
1. Admin/Kasir membuka form *Tambah Produk* atau *Edit Produk* di dashboard kasir.
2. Memasukkan Nama Produk (e.g. *"Caramel Macchiato"*) dan memilih Kategori (e.g. *"Coffee"*).
3. Mengklik tombol **"✨ Generate Deskripsi AI"**.
4. Frontend memanggil endpoint API backend `/api/products/generate-description`.
5. Backend meneruskan parameter ke Google Gemini API dengan prompt *copywriting* spesifik kedai kopi.
6. Hasil copywriting AI ditampilkan langsung di form deskripsi agar dapat ditinjau atau diedit oleh staf sebelum disimpan ke database.

---

## 10. Risiko & Mitigasi

| Risiko Potensial | Tingkat Dampak | Strategi Mitigasi |
|---|---|---|
| **Nomor antrian duplikat saat jam ramai (*race condition*)** | Tinggi | Penomoran antrian menggunakan fungsi sekuensial harian di sisi backend dengan penguncian atomik berbasis tanggal, sehingga nomor tidak akan pernah tabrakan. |
| **Keterlambatan notifikasi webhook dari payment gateway** | Sedang | Backend memvalidasi callback secara asinkron dan halaman pelanggan menyediakan tombol pengecekan status manual jika webhook gateway mengalami kendala jaringan. |
| **Koneksi internet pelanggan terputus setelah melakukan checkout** | Sedang | Menyimpan riwayat tiket pesanan aktif pada *localStorage* browser pelanggan sehingga halaman dapat dipulihkan kapan saja saat koneksi kembali. |
| **Pelanggan tidak mendengar saat pesanannya selesai dibuat** | Sedang | Mengombinasikan notifikasi visual mencolok di HP, suara chime nada tinggi, animasi *confetti*, serta layar TV display publik yang dilengkapi *Voice Announcement (TTS)* berbahasa Indonesia alami. |
| **Batas kuota atau rate limit pada Google Gemini API** | Rendah | Mengimplementasikan beberapa kandidat model (*gemini-3.5-flash-lite*, *gemini-3.6-flash*, *gemini-3.5-flash*) serta menyediakan kalimat *fallback* otomatis berkualitas tinggi bila API key offline. |
| **Pesanan fiktif pada opsi Bayar di Kasir** | Sedang | Pesanan *Bayar di Kasir* hanya tercatat dengan status `Menunggu Pembayaran` dan tidak akan dimasukkan ke antrian racik barista sebelum dikonfirmasi langsung oleh kasir. |

---

## 11. Kriteria Keberhasilan (Definition of Done)

- [x] **Pemesanan Mandiri Pelanggan Berjalan End-to-End**: Pelanggan dapat memindai QR code, menelusuri katalog menu, menambahkan catatan khusus, dan melakukan checkout secara mandiri.
- [x] **Dua Jalur Pembayaran Berfungsi Sempurna**:
  - Jalur *Bayar di Kasir* menerbitkan nomor antrian berstatus *Menunggu Pembayaran* hingga diverifikasi kasir.
  - Jalur *Payment Gateway* menghasilkan Dynamic QRIS iPaymu dan otomatis berstatus lunas via webhook callback.
- [x] **Transisi Status Antrian Real-Time**: Perubahan tahapan pesanan (*Menunggu Pembayaran* &rarr; *Diproses* &rarr; *Siap* &rarr; *Selesai*) tersinkronisasi cepat ke HP pelanggan, dashboard kasir, dan display TV.
- [x] **Notifikasi Audio-Visual Aktif**: Layar pelanggan membunyikan lonceng audio dan menampilkan selebrasi *confetti*, sementara layar display publik mengumumkan nomor panggil melalui *Text-to-Speech* alami.
- [x] **Layar Display Publik TV Beroperasi Mulus**: Tampilan fullscreen menampilkan kolom *Sedang Diproses* dan *Siap Diambil* secara dinamis tanpa perlu refresh manual.
- [x] **Manajemen Menu & Integrasi AI Gemini Berhasil**: Kasir/Admin dapat mengelola katalog produk dan berhasil menghasilkan narasi deskripsi menu yang relevan via Google Gemini API.
- [x] **Autentikasi & Keamanan Teruji**: Akses dashboard kasir dilindungi verifikasi JWT dan password terenkripsi bcrypt.
- [x] **Kode Terstruktur & Siap Diuji**: Repositori tersusun bersih dengan dokumentasi lengkap dan dapat dijalankan ulang tanpa error oleh dosen penguji.

---

*Dokumen ini merupakan Product Requirements Document (PRD) resmi untuk Final Project Mata Kuliah Pengembangan Aplikasi Web (PAW) — Kelompok 3 (Kopi Senja).*
