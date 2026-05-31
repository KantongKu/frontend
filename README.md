# 💼 KantongKu - Smart Expense Tracker

**KantongKu** adalah aplikasi web pengelolaan keuangan pribadi yang dirancang khusus untuk membantu Anda mengelola pengeluaran dengan lebih efisien. Dengan fitur pemindai struk berbasis OCR, kategorisasi otomatis, dan dashboard interaktif, KantongKu membuat manajemen keuangan menjadi mudah dan menyenangkan.

## ✨ Fitur Utama

### 📸 Smart Receipt Scanner
- Upload atau ambil foto struk belanja
- Ekstraksi otomatis informasi penting (nama toko, tanggal, total harga)
- Sinkronisasi dengan sistem pengelolaan pengeluaran

### 🏷️ Automated Expense Categorization
- Kategorisasi otomatis pengeluaran berdasarkan deskripsi
- 7 kategori pengeluaran: Makanan & Minuman, Transportasi, Hiburan, Utilitas, Kesehatan, Pendidikan, Lainnya
- Interface yang user-friendly untuk mengelola kategori

### 📊 Interactive Financial Dashboard
- Visualisasi pengeluaran dengan grafik yang menarik
- Tracking budget real-time per kategori
- Tren pengeluaran mingguan dan analitik mendalam
- Indikator status budget (normal, warning, critical)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 atau lebih tinggi)
- npm atau yarn

### Installation

1. **Clone repository** (jika menggunakan Git)
```bash
git clone <repository-url>
cd frontend
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Setup environment variables**
Buat file `.env` di root project:
```
VITE_API_URL=http://localhost:5000/api
```

4. **Run development server**
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard/          # Dashboard overview dan visualisasi
│   ├── Scanner/            # Receipt scanner interface
│   ├── Categorization/     # Expense categorization view
│   └── Layout/             # Header dan navigation
├── context/
│   └── ExpenseContext.jsx  # Global state management
├── pages/
│   ├── HomePage.jsx        # Main dashboard page
│   ├── ScannerPage.jsx     # Scanner page
│   └── CategorizationPage.jsx # Categorization page
├── services/
│   └── api.js              # API service calls
├── styles/
│   └── globals.css         # Global styling
├── App.jsx                 # Main app component
├── main.jsx                # Entry point
└── index.css               # Root styles
```

## 📚 Available Scripts

### Development
```bash
npm run dev
```
Jalankan aplikasi dalam mode development dengan hot reload.

### Build for Production
```bash
npm run build
```
Build aplikasi untuk production. Output akan tersimpan di folder `dist/`.

### Preview Production Build
```bash
npm run preview
```
Preview production build secara lokal.

### Linting
```bash
npm run lint
```
Check code quality dengan ESLint.

## 🔌 API Integration

Aplikasi ini siap untuk diintegrasikan dengan backend API. Update file `src/services/api.js` dengan URL backend Anda.

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client

## 📱 Responsive Design

Aplikasi ini sepenuhnya responsive untuk Desktop, Tablet, dan Mobile.

---

**Made with ❤️ by KantongKu Team**
