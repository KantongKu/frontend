import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Loader, CheckCircle, RefreshCcw, FileText } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import './MobileScanner.css';

const MobileScannerOverlay = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const videoRef = useRef(null);
  const { addExpense } = useExpense();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      // In development/desktop without camera, this will fail gracefully.
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  const handleCapture = () => {
    setLoading(true);
    // Simulate capture and OCR processing delay
    setTimeout(() => {
      stopCamera();
      
      // Set dummy scan result for the summary view
      setScanResult({
        merchant: "Starbucks Coffee",
        date: "04 May 2026, 08:30 AM",
        total: 55000,
        items: [
          { name: "Caffe Latte", qty: 1, price: 40000 },
          { name: "Caramel Syrup", qty: 1, price: 15000 }
        ]
      });
      
      setLoading(false);
    }, 2500);
  };

  const handleSaveResult = () => {
    addExpense({
      description: scanResult.merchant + ' (Simulasi OCR)',
      amount: scanResult.total,
      category: 'Dining', // Could be inferred
      date: new Date().toISOString()
    });
    alert('Struk berhasil disimpan ke riwayat!');
    onClose();
  };

  const handleRetake = () => {
    setScanResult(null);
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="mobile-scanner-overlay">
      <div className="scanner-modal-backdrop" onClick={() => { stopCamera(); onClose(); }}></div>
      <div className="scanner-modal-content">
        <div className="scanner-top-bar">
          <h3>Pindai Struk</h3>
          <button className="btn-close" onClick={() => { stopCamera(); onClose(); }}>
            <X size={24} />
          </button>
        </div>

        {!scanResult ? (
          <>
            <div className="scanner-viewfinder">
              {loading ? (
                <div className="scanner-loading">
                  <Loader size={48} className="spin-fast" />
                  <p>Menganalisis struk...</p>
                </div>
              ) : (
                 <>
                  <video ref={videoRef} autoPlay playsInline className="camera-video" />
                  <div className="scan-frame">
                     <div className="scan-corner top-left"></div>
                     <div className="scan-corner top-right"></div>
                     <div className="scan-corner bottom-left"></div>
                     <div className="scan-corner bottom-right"></div>
                  </div>
                 </>
              )}
            </div>

            {!loading && (
              <div className="scanner-bottom-controls">
                <button className="btn-upload">
                  <Upload size={24} />
                </button>
                <button className="btn-capture-ring" onClick={handleCapture}>
                  <div className="btn-capture-inner"></div>
                </button>
                <div className="spacer-btn"></div>
              </div>
            )}
          </>
        ) : (
          <div className="scanner-result-view">
            <div className="result-card glass-card">
              <div className="result-header">
                <div className="result-icon-wrapper">
                  <FileText size={28} color="#10b981" />
                </div>
                <div className="result-title">
                  <h2>Rincian Nota</h2>
                  <p>Hasil Ekstraksi AI</p>
                </div>
              </div>

              <div className="result-body">
                <div className="result-row">
                  <span className="result-label">Merchant</span>
                  <span className="result-value strong">{scanResult.merchant}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Tanggal</span>
                  <span className="result-value">{scanResult.date}</span>
                </div>
                
                <div className="result-divider"></div>
                
                <div className="result-items">
                  <span className="result-label mb-2">Item Belanja</span>
                  {scanResult.items.map((item, idx) => (
                    <div key={idx} className="result-item-row">
                      <span className="item-qty">{item.qty}x</span>
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>

                <div className="result-divider"></div>

                <div className="result-row total-row">
                  <span className="result-label">Total Belanja</span>
                  <span className="result-total">Rp {scanResult.total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <button className="btn-retake" onClick={handleRetake}>
                <RefreshCcw size={20} />
                Pindai Ulang
              </button>
              <button className="btn-save" onClick={handleSaveResult}>
                <CheckCircle size={20} />
                Simpan Transaksi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileScannerOverlay;
