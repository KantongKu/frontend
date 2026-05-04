import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Loader } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import './MobileScanner.css';

const MobileScannerOverlay = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
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
      addExpense({
        description: 'Starbucks Coffee (Simulasi)',
        amount: 55000,
        category: 'Uncategorized',
        date: new Date().toISOString()
      });
      setLoading(false);
      alert('Struk berhasil dipindai dan ditambahkan!');
      onClose();
    }, 2500);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="mobile-scanner-overlay">
      <div className="scanner-top-bar">
        <h3>Pindai Struk</h3>
        <button className="btn-close" onClick={() => { stopCamera(); onClose(); }}>
          <X size={24} />
        </button>
      </div>

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
    </div>
  );
};

export default MobileScannerOverlay;
