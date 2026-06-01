import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Loader, CheckCircle, RefreshCcw, FileText, AlertCircle } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { scannerService, transactionService } from '../../services/api';
import './MobileScanner.css';

const MobileScannerOverlay = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const { wallets } = useExpense();
  const cameraFileRef = useRef(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Auto-select first wallet if available
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0].id);
    }
  }, [wallets, selectedWallet]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current && isMountedRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Kamera tidak tersedia:', err);
      if (isMountedRef.current) {
        setError('Kamera tidak dapat diakses. Gunakan upload file sebagai alternatif.');
        setCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
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
      console.error('Error stopping camera:', error);
    } finally {
      setCameraActive(false);
    }
  };

  const handleCloseModal = () => {
    console.log('Closing modal...');
    stopCamera();
    // Ensure cleanup
    setTimeout(() => {
      isMountedRef.current = false;
      onClose();
    }, 100);
  };

  // Cleanup saat component unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Start camera when component mounts (jika belum ada hasil)
    if (!scanResult) {
      startCamera();
    }

    return () => {
      console.log('Component unmounting, cleaning up...');
      isMountedRef.current = false;
      stopCamera();
      // Cancel any pending API requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Stop camera saat hasil muncul
  useEffect(() => {
    if (scanResult) {
      stopCamera();
    }
  }, [scanResult]);

  const handleCapture = async () => {
    if (!videoRef.current) {
      setError('Kamera tidak siap. Silakan tunggu sebentar dan coba lagi.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      // Check if video is playing
      if (!video.videoWidth || !video.videoHeight) {
        throw new Error('Video belum siap. Coba lagi dalam beberapa detik.');
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (!blob || !isMountedRef.current) {
          console.warn('Blob tidak valid atau component sudah unmount');
          setLoading(false);
          return;
        }

        try {
          if (blob.size === 0) {
            throw new Error('Foto tidak berhasil diambil. Coba lagi.');
          }

          if (!isMountedRef.current) {
            console.warn('Modal ditutup sebelum API call, membatalkan...');
            return;
          }

          cameraFileRef.current = blob;
          console.log('Sending blob to OCR API, size:', blob.size);
          
          // Create abort controller untuk API call
          abortControllerRef.current = new AbortController();
          
          // Matikan kamera sebelum mengirim ke API
          stopCamera();
          
          // Call API OCR dengan timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('OCR timeout - server tidak merespons')), 30000)
          );
          
          try {
            const result = await Promise.race([
              scannerService.extractData(blob),
              timeoutPromise
            ]);
            
            if (!isMountedRef.current) {
              console.warn('Component unmounted, skipping state update');
              return;
            }

            console.log('OCR API response:', result);
            
            // Handle berbagai format response dari API
            let data = result;
            if (result.data) {
              data = result.data;
            }
            
            // Validate response
            if (!data || typeof data !== 'object') {
              console.error('Invalid response format:', data);
              throw new Error('Format respons tidak valid dari server. Response: ' + JSON.stringify(result));
            }

            // Extract field dengan multiple fallback
            const total = data.total || data.amount || data.totalAmount || 0;
            const merchant = data.merchant_name || data.store_name || data.storeName || data.merchant || 'Toko';
            const items = data.items || data.products || [];
            const date = data.transaction_date || data.date || data.transactionDate || new Date().toLocaleDateString('id-ID');
            const subtotal = data.subtotal || data.subTotal || 0;

            console.log('Parsed data:', { total, merchant, items, date, subtotal });

            setScanResult({
              merchant,
              date,
              items,
              total,
              subtotal,
            });
            
            setLoading(false);
          } catch (apiErr) {
            // Check if error is due to abort or timeout
            if (apiErr.name === 'AbortError') {
              console.log('API call aborted');
              return;
            }
            throw apiErr;
          }
        } catch (err) {
          console.error('Error OCR:', err);
          if (isMountedRef.current) {
            // Matikan kamera jika ada error
            stopCamera();
            setError(`Gagal memproses foto: ${err.message || 'Silakan coba lagi'}`);
            setLoading(false);
          }
        }
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error('Error capturing:', err);
      // Matikan kamera jika ada error
      stopCamera();
      if (isMountedRef.current) {
        setError(`Gagal mengambil foto: ${err.message || 'Silakan coba lagi'}`);
        setLoading(false);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Silakan pilih file gambar yang valid');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Ukuran file terlalu besar (max 10MB)');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (!isMountedRef.current) {
        console.warn('Modal ditutup sebelum file processing, membatalkan...');
        return;
      }

      cameraFileRef.current = file;
      console.log('Sending file to OCR API, size:', file.size);
      
      // Create abort controller untuk API call
      abortControllerRef.current = new AbortController();
      
      // Matikan kamera sebelum mengirim file
      stopCamera();
      
      // Call API OCR dengan timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('OCR timeout - server tidak merespons')), 30000)
      );
      
      try {
        const result = await Promise.race([
          scannerService.extractData(file),
          timeoutPromise
        ]);

        if (!isMountedRef.current) {
          console.warn('Component unmounted, skipping state update');
          return;
        }

        console.log('OCR API response:', result);
        
        // Handle berbagai format response dari API
        let data = result;
        if (result.data) {
          data = result.data;
        }

        // Validate response
        if (!data || typeof data !== 'object') {
          console.error('Invalid response format:', data);
          throw new Error('Format respons tidak valid dari server. Response: ' + JSON.stringify(result));
        }

        // Extract field dengan multiple fallback
        const total = data.total || data.amount || data.totalAmount || 0;
        const merchant = data.merchant_name || data.store_name || data.storeName || data.merchant || 'Toko';
        const items = data.items || data.products || [];
        const date = data.transaction_date || data.date || data.transactionDate || new Date().toLocaleDateString('id-ID');
        const subtotal = data.subtotal || data.subTotal || 0;

        console.log('Parsed data:', { total, merchant, items, date, subtotal });
        
        setScanResult({
          merchant,
          date,
          items,
          total,
          subtotal,
        });
        
        setLoading(false);
      } catch (apiErr) {
        // Check if error is due to abort or timeout
        if (apiErr.name === 'AbortError') {
          console.log('API call aborted');
          return;
        }
        throw apiErr;
      }
    } catch (err) {
      console.error('Error processing file:', err);
      if (isMountedRef.current) {
        setError(`Gagal memproses file: ${err.message || 'Silakan coba lagi'}`);
        setLoading(false);
      }
    }
  };

  const handleSaveResult = async () => {
    if (!scanResult || !selectedWallet) {
      setError('Silakan pilih kantong untuk menyimpan transaksi.');
      return;
    }

    if (!cameraFileRef.current) {
      setError('File foto tidak ditemukan. Silakan ulangi pengambilan foto.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      stopCamera();
      
      // Save transaction with receipt image
      await transactionService.create({
        wallet_id: selectedWallet,
        amount: scanResult.total,
        type: 'expense',
        description: scanResult.merchant,
        transaction_date: new Date().toISOString().split('T')[0],
        is_ocr: true,
        receiptImage: cameraFileRef.current
      });

      if (isMountedRef.current) {
        alert('✅ Transaksi berhasil disimpan!');
        handleCloseModal();
        // Reload page to refresh data
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      console.error('Error saving transaction:', err);
      if (isMountedRef.current) {
        setError(`Gagal menyimpan transaksi: ${err.message || 'Silakan coba lagi'}`);
        setLoading(false);
      }
    }
  };

  const handleRetake = () => {
    setScanResult(null);
    cameraFileRef.current = null;
    setError(null);
    startCamera();
  };

  return (
    <div className="mobile-scanner-overlay">
      <div className="scanner-modal-backdrop" onClick={handleCloseModal}></div>
      <div className="scanner-modal-content">
        <div className="scanner-top-bar">
          <h3>Pindai Struk Belanja</h3>
          <button className="btn-close" onClick={handleCloseModal}>
            <X size={24} />
          </button>
        </div>

        {/* Wallet Selector */}
        {!scanResult && (
          <div className="wallet-selector-mobile">
            <label>Pilih Kantong:</label>
            <select
              value={selectedWallet || ''}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="wallet-select"
            >
              <option value="">-- Pilih Kantong --</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

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
                <button className="btn-upload" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={24} />
                </button>
                <button className="btn-capture-ring" onClick={handleCapture}>
                  <div className="btn-capture-inner"></div>
                </button>
                <div className="spacer-btn"></div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
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
              <button className="btn-save" onClick={handleSaveResult} disabled={loading}>
                <CheckCircle size={20} />
                {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileScannerOverlay;
