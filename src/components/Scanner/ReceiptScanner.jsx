import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import './Scanner.css';

const ReceiptScanner = () => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const { addExpense, categorizeExpense } = useExpense();

  // Handle file upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Process file (simulate OCR)
  const processFile = async (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      simulateOCR(file);
    };
    reader.readAsDataURL(file);
  };

  // Simulate OCR extraction (replace with real API call later)
  const simulateOCR = async (file) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock extracted data (in real app, this comes from backend)
      const mockData = {
        storeName: 'Warung Makan Asri',
        date: new Date().toLocaleDateString('id-ID'),
        items: [
          { name: 'Sate Ayam', price: 25000 },
          { name: 'Es Teh Manis', price: 8000 },
          { name: 'Sambal Terasi', price: 2000 },
        ],
        subtotal: 35000,
        total: 35000,
      };

      setExtractedData(mockData);
    } catch (error) {
      console.error('Error processing receipt:', error);
      alert('Gagal memproses struk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Submit extracted data
  const handleSubmit = () => {
    if (extractedData) {
      const expense = addExpense({
        description: extractedData.storeName,
        amount: extractedData.total,
        category: 'Uncategorized',
        receipt: preview,
      });

      // Auto-categorize (can be improved with ML)
      const storeName = extractedData.storeName.toLowerCase();
      let category = 'Lainnya';

      if (storeName.includes('makan') || storeName.includes('warung') || storeName.includes('resto')) {
        category = 'Makanan & Minuman';
      } else if (storeName.includes('bensin') || storeName.includes('parkir')) {
        category = 'Transportasi';
      } else if (storeName.includes('obat') || storeName.includes('farmasi')) {
        category = 'Kesehatan';
      }

      categorizeExpense(expense.id, category);

      // Reset
      setPreview(null);
      setExtractedData(null);
      alert('Pengeluaran berhasil ditambahkan!');
    }
  };

  // Handle camera
  const handleCameraClick = async () => {
    setUseCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Tidak dapat mengakses kamera');
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob(blob => {
        processFile(blob);
        setUseCamera(false);
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      });
    }
  };

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <h1>📸 Pemindai Struk</h1>
        <p>Upload atau ambil foto struk belanja Anda</p>
      </div>

      {/* Camera View */}
      {useCamera && (
        <div className="camera-view">
          <video ref={videoRef} autoPlay playsInline />
          <div className="camera-controls">
            <button className="btn btn-primary" onClick={handleCapture}>
              Ambil Foto
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setUseCamera(false);
                if (videoRef.current?.srcObject) {
                  videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                }
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!preview && !useCamera && (
        <div className="upload-area">
          <div
            className="upload-box"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('drag-over');
            }}
            onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('drag-over');
              if (e.dataTransfer.files[0]) {
                processFile(e.dataTransfer.files[0]);
              }
            }}
          >
            <Upload size={48} className="upload-icon" />
            <h3>Drag & Drop Struk di sini</h3>
            <p>atau klik untuk memilih file</p>
          </div>

          <div className="upload-actions">
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={20} /> Pilih File
            </button>
            <button className="btn btn-secondary" onClick={handleCameraClick}>
              <Camera size={20} /> Ambil Foto
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Preview & Results */}
      {preview && (
        <div className="scanner-result">
          <div className="preview-section">
            <img src={preview} alt="Preview struk" className="receipt-preview" />
          </div>

          {loading && (
            <div className="loading-state">
              <Loader size={32} className="spinner" />
              <p>Memproses struk...</p>
            </div>
          )}

          {extractedData && (
            <div className="extracted-data">
              <div className="store-info">
                <h2>{extractedData.storeName}</h2>
                <p>{extractedData.date}</p>
              </div>

              <div className="items-list">
                <h3>📝 Daftar Barang:</h3>
                {extractedData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <span>{item.name}</span>
                    <span>Rp {item.price.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="amount-summary">
                <div className="amount-row">
                  <span>Subtotal:</span>
                  <span>Rp {extractedData.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="amount-row total">
                  <span>Total:</span>
                  <span>Rp {extractedData.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn btn-success" onClick={handleSubmit}>
                  ✅ Konfirmasi & Simpan
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setPreview(null);
                    setExtractedData(null);
                  }}
                >
                  ❌ Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;
