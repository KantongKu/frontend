import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, Download } from 'lucide-react';
import { transactionService } from '../../services/api';
import './TransactionGalleryView.css';

const TransactionGalleryView = ({ onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all transactions
        const allTransactions = await transactionService.getAll();
        // Filter only transactions with images
        const withImages = allTransactions.filter(tx => tx.image_url && tx.image_url.trim());
        setTransactions(withImages);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Gagal memuat transaksi dengan bukti');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleDownloadImage = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `bukti-transaksi-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="transaction-gallery-view">
      <div className="tgv-header">
        <button className="tgv-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2>Galeri Transaksi Dengan Bukti</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="tgv-content">
        {loading ? (
          <div className="tgv-loading">
            <div className="spinner"></div>
            <p>Memuat transaksi dengan bukti...</p>
          </div>
        ) : error ? (
          <div className="tgv-error">
            <p>{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="tgv-empty">
            <div className="tgv-empty-icon">📸</div>
            <h3>Belum Ada Bukti Transaksi</h3>
            <p>Mulai upload foto bukti transaksi Anda untuk melihatnya di sini</p>
          </div>
        ) : (
          <>
            <div className="tgv-stats">
              <div className="stat-card">
                <span className="stat-label">Total Bukti</span>
                <span className="stat-value">{transactions.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Pengeluaran</span>
                <span className="stat-value">
                  Rp {transactions
                    .filter(tx => tx.type === 'expense')
                    .reduce((sum, tx) => sum + (tx.amountVal || 0), 0)
                    .toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="tgv-gallery">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="tgv-card"
                  onClick={() => setSelectedImage(transaction)}
                >
                  <div className="tgv-card-image-wrapper">
                    <img 
                      src={transaction.image_url} 
                      alt={transaction.title}
                      className="tgv-card-image"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {transaction.type === 'expense' && (
                      <div className="tgv-badge expense">Pengeluaran</div>
                    )}
                    {transaction.type === 'income' && (
                      <div className="tgv-badge income">Pemasukan</div>
                    )}
                  </div>
                  <div className="tgv-card-info">
                    <h4>{transaction.title}</h4>
                    <p className="tgv-amount">
                      {transaction.type === 'expense' ? '- ' : '+ '}
                      {transaction.amount}
                    </p>
                    <p className="tgv-date">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="tgv-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="tgv-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="tgv-modal-header">
              <div className="tgv-modal-info">
                <h3>{selectedImage.title}</h3>
                <p className="tgv-modal-amount">
                  {selectedImage.type === 'expense' ? '- ' : '+ '}
                  {selectedImage.amount}
                </p>
              </div>
              <button 
                className="tgv-modal-close" 
                onClick={() => setSelectedImage(null)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="tgv-modal-image">
              <img 
                src={selectedImage.image_url} 
                alt={selectedImage.title}
              />
            </div>
            <div className="tgv-modal-details">
              <div className="detail-row">
                <span className="detail-label">Tanggal:</span>
                <span className="detail-value">{selectedImage.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Kategori:</span>
                <span className="detail-value">{selectedImage.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Deskripsi:</span>
                <span className="detail-value">{selectedImage.title}</span>
              </div>
              <button 
                className="tgv-download-btn"
                onClick={() => handleDownloadImage(selectedImage.image_url)}
              >
                <Download size={20} />
                Download Bukti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionGalleryView;
