# 💼 KantongKu - Smart Expense Tracker

**KantongKu** adalah aplikasi web pengelolaan keuangan pribadi yang dirancang untuk membantu Anda memantau dan mengelola pengeluaran dengan lebih efisien. Dilengkapi dengan dashboard interaktif, tracking budget real-time, kategorisasi otomatis, serta fitur pemindaian struk belanja (OCR), KantongKu mempermudah pencatatan keuangan harian Anda secara teratur dan cerdas.

---

## 🚀 Cara Menjalankan Proyek

### 1. Prasyarat
Pastikan Anda sudah menginstal:
- **Node.js** (v14 atau lebih tinggi)
- **npm** (biasanya otomatis terinstal dengan Node.js)

### 2. Instalasi Dependensi
Jalankan perintah berikut di terminal Anda untuk menginstal semua dependensi proyek:
```bash
npm install
```
*Catatan: Jika terjadi masalah kompatibilitas peer dependencies, gunakan:*
```bash
npm install --legacy-peer-deps
```

### 3. Konfigurasi Environment Variables
Buat file bernama `.env` di root direktori proyek ini (sejajar dengan `package.json`), lalu masukkan konfigurasi API backend:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Menjalankan Server Development
Jalankan perintah berikut untuk memulai server development lokal:
```bash
npm run dev
```
Setelah server berjalan, buka browser dan akses alamat yang tertera di terminal (biasanya [http://localhost:5173](http://localhost:5173)).
