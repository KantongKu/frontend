# 💼 KantongKu - Smart Expense Tracker & AI Budgeting

**KantongKu** adalah aplikasi web pengelolaan keuangan pribadi yang dirancang khusus untuk membantu Anda mengelola pengeluaran dan merencanakan keuangan bulanan dengan lebih efisien. Dilengkapi dengan asisten finansial cerdas berbasis AI Gemini, pemindai struk belanja (OCR) terpadu di sisi frontend, serta dashboard analisis kesehatan keuangan real-time.

---

## ✨ Fitur Utama

### 📸 Smart Receipt Scanner (OCR)
- Memindai dan mengekstrak informasi penting dari struk belanja secara otomatis (nama toko/merchant, tanggal, nominal belanja).
- **Akurasi & Kecepatan**: Menghubungi API OCR Hugging Face secara langsung dari frontend dengan batas waktu (timeout) 20 detik.
- **AI Fallback & Anti-Crash**: Jika server OCR lambat atau down, sistem otomatis menggunakan multimodal AI (Gemini 2.5 Flash) untuk menganalisis gambar. Jika kuota API penuh, aplikasi secara cerdas beralih ke form tinjauan manual agar aplikasi tidak crash.

### 🤖 AI Pocket Recommendations
- Menyusun alokasi anggaran bulanan secara otomatis berdasarkan status/pekerjaan Anda (misalnya: anggaran khusus kos untuk mahasiswa, atau anggaran bensin untuk ojek online).
- Memberikan saran target limit bulanan yang rasional untuk setiap kantong yang baru dibuat.

### 📊 Interactive Financial Health Dashboard
- Visualisasi persentase pengeluaran terhadap total gaji bulanan.
- Indikator kesehatan keuangan (*Financial Health Score*) dinamis yang menyesuaikan dengan rasio pengeluaran.
- Pengelompokan dana melalui **Budget Pockets** (Kantong Anggaran) secara dinamis.

---

## 🔌 Tautan Model Machine Learning (ML) & AI

Aplikasi ini memanfaatkan model Machine Learning (ML) dan Artificial Intelligence (AI) berikut untuk memproses data:

1. **Hugging Face OCR Space (Model Deteksi Teks Struk)**
   - **Tautan Layanan**: [suherlan-kantongku on Hugging Face Spaces](https://huggingface.co/spaces/suherlan/kantongku)
   - **Endpoint Prediksi**: `https://suherlan-kantongku.hf.space/predict`
   - **Fungsi**: Menerima file gambar struk belanja dan mengurai nama merchant, total harga, tanggal, serta kategori transaksi.

2. **Google Gemini 2.5 Flash Model**
   - **Dokumentasi Model**: [Gemini 2.5 Flash API Docs](https://ai.google.dev/gemini-api/docs/models/gemini)
   - **Fungsi**: Digunakan sebagai fallback multimodal OCR (menganalisis gambar struk belanja dalam format Base64 secara langsung di sisi client) serta untuk memberikan rekomendasi pembagian kantong keuangan cerdas.

---

## ⚙️ Petunjuk Setup Environment

Sebelum menjalankan aplikasi, buat file `.env` di masing-masing direktori proyek.

### 1. Frontend Environment (`frontend/.env`)
Buat berkas `.env` di dalam direktori `frontend`:
```env
VITE_GEMINI_API_KEY="your_gemini_api_key_here"
```
*(Catatan: Gantilah nilai di atas dengan API Key Gemini Anda yang valid.)*

### 2. Backend Environment (`be-kantongku/.env`)
Buat berkas `.env` di dalam direktori `be-kantongku`:
```env
# Koneksi Database PostgreSQL (Neon / Local)
DATABASE_URL="postgresql://your_db_user:your_db_password@your_db_host:5432/your_db_name?sslmode=require"

# Port Server & Kredensial JWT
PORT=4000
JWT_SECRET="your_jwt_secret_here"

# Kredensial Cloudinary (Penyimpanan Gambar Struk Bukti Transaksi)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# API OCR Space (Hugging Face)
AI_PREDICT_URL="https://suherlan-kantongku.hf.space/predict"
```

---

## 🚀 Cara Menjalankan Aplikasi

Ikuti instruksi berikut untuk menjalankan backend dan frontend secara lokal.

### Langkah 1: Jalankan Backend (API Server)
1. Buka terminal baru dan masuk ke direktori backend:
   ```bash
   cd be-kantongku
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Lakukan migrasi database dan generate Prisma client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
4. Jalankan server dalam mode development:
   ```bash
   npm run dev
   ```
   *Server backend akan berjalan di `http://localhost:4000`.*

### Langkah 2: Jalankan Frontend (React App)
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Instal semua dependensi:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Jalankan server development frontend:
   ```bash
   npm run dev
   ```
   *Aplikasi frontend akan berjalan di `http://localhost:5173`.*

---

## 📁 Struktur Folder Proyek (Frontend)

```
src/
├── components/
│   ├── Dashboard/          # Tinjauan anggaran, list kantong & review overlay
│   ├── Scanner/            # Mobile scanner view lama (depresiasi)
│   ├── Categorization/     # Interface kategorisasi NLP
│   └── Layout/             # Navigasi & layout global
├── context/
│   └── ExpenseContext.jsx  # State management transaksi & kantong
├── pages/
│   ├── HomePage.jsx        # Halaman dashboard utama & integrasi OCR
│   ├── ScannerPage.jsx     # Halaman pemindai
│   └── OnboardingPage.jsx  # Alur onboarding baru berbasis status/gaji & AI
├── services/
│   ├── api.js              # Klien HTTP Axios, format mata uang & backend calls
│   └── ai.js               # Parser AI Gemini, pencocokan kantong lokal & multimodal OCR
├── styles/
│   └── globals.css         # Reset style global & tema glassmorphism
├── App.jsx                 # Router utama aplikasi
└── main.jsx                # Entry point React
```

---
**Made with ❤️ by KantongKu Team**
