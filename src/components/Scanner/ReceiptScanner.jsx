import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Loader, AlertCircle } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { scannerService, transactionService } from '../../services/api';
import './Scanner.css';

const ReceiptScanner = () => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const fileRefForOCR = useRef(null);
  const { wallets } = useExpense();

  useEffect(() => {
    // Auto-select first wallet if available
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0].id);
    }
  }, [wallets, selectedWallet]);

  // Handle file upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Process file with API OCR
  const processFile = async (file) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      fileRefForOCR.current = file;
      performOCR(file);
    };
    reader.readAsDataURL(file);
  };

  // Call API for OCR extraction
  const performOCR = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const result = await scannerService.extractData(file);
      
      console.log('OCR API response:', result);
      
      // Handle berbagai format response dari API
      let data = result;
      if (result.data) {
        data = result.data;
      }
      
      if (!data || typeof data !== 'object') {
        console.error('Invalid response format:', data);
        throw new Error('Format respons tidak valid dari server. Response: ' + JSON.stringify(result));
      }

      // Extract field dengan multiple fallback
      const total = data.total || data.amount || data.totalAmount || 0;
      const storeName = data.merchant_name || data.store_name || data.storeName || data.merchant || 'Toko';
      const items = data.items || data.products || [];
      const date = data.transaction_date || data.date || data.transactionDate || new Date().toLocaleDateString('id-ID');
      const subtotal = data.subtotal || data.subTotal || 0;

      console.log('Parsed data:', { total, storeName, items, date, subtotal });

      const extractedResult = {
        storeName,
        date,
        items,
        subtotal,
        total,
      };
      
      setExtractedData(extractedResult);
    } catch (error) {
      console.error('Error during OCR extraction:', error);
      setError('Gagal memproses struk: ' + (error.message || 'Pastikan gambar jelas dan coba lagi.'));
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Submit extracted data to API
  const handleSubmit = async () => {
    if (!extractedData || !selectedWallet) {
      setError('Silakan pilih kantong dan pastikan data struk tersedia');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Create transaction with receipt image
      const transaction = await transactionService.create({
        wallet_id: selectedWallet,
        amount: extractedData.total,
        type: 'expense',
        description: extractedData.storeName,
        transaction_date: new Date().toISOString().split('T')[0],
        is_ocr: true,
        receiptImage: fileRefForOCR.current
      });

      // Reset
      setPreview(null);
      setExtractedData(null);
      setError(null);
      alert('✅ Pengeluaran berhasil ditambahkan ke ' + wallets.find(w => w.id === selectedWallet)?.title);
      
      // Refresh dashboard
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error submitting transaction:', error);
      setError('Gagal menyimpan transaksi. Silakan coba lagi.');
      setLoading(false);
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
      setError('Tidak dapat mengakses kamera. Gunakan unggah file sebagai alternatif.');
      setUseCamera(false);
    }
  };

  const stopCameraStream = () => {
    console.log('Stopping camera stream...');
    try {
      if (videoRef.current) {
        // Pause dan unload video
        videoRef.current.pause();
        videoRef.current.src = '';
        
        // Stop all tracks dengan force
        if (videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          console.log('Stopping', tracks.length, 'tracks');
          tracks.forEach(track => {
            console.log('Stopping track:', track.kind, 'enabled:', track.enabled);
            track.enabled = false;
            track.stop();
          });
          videoRef.current.srcObject = null;
        }
      }
    } catch (error) {
      console.error('Error stopping camera stream:', error);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) {
      setError('Kamera tidak siap. Coba lagi.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      if (canvas.width === 0 || canvas.height === 0) {
        setError('Video belum siap. Tunggu sebentar dan coba lagi.');
        return;
      }

      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob(blob => {
        if (!blob || blob.size === 0) {
          setError('Foto tidak berhasil diambil. Coba lagi.');
          return;
        }
        processFile(blob);
        setUseCamera(false);
        stopCameraStream();
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error capturing:', error);
      setError('Gagal mengambil foto: ' + error.message);
      setUseCamera(false);
      stopCameraStream();
    }
  };

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <h1>📸 Pemindai Struk</h1>
        <p>Upload atau ambil foto struk belanja Anda</p>
      </div>

      {/* Wallet Selector */}
      <div className="wallet-selector">
        <label htmlFor="wallet-select">Pilih Kantong:</label>
        <select
          id="wallet-select"
          value={selectedWallet || ''}
          onChange={(e) => setSelectedWallet(e.target.value)}
          className="wallet-select-input"
        >
          <option value="">-- Pilih Kantong --</option>
          {wallets.map(wallet => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.title} ({wallet.amount})
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
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
                stopCameraStream();
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
