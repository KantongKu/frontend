import React, { useState } from 'react';
import { ChevronLeft, Search, Calendar, FileText, CheckCircle, Clock, ZoomIn } from 'lucide-react';
import './OcrArchiveView.css';

const dummyReceipts = [
  {
    id: 1,
    merchant: 'Starbucks Coffee',
    date: '24 Okt 2026',
    amount: 'Rp 55.000',
    status: 'verified',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 2,
    merchant: 'Indomaret Point',
    date: '23 Okt 2026',
    amount: 'Rp 124.500',
    status: 'verified',
    imageUrl: 'https://images.unsplash.com/photo-1588621453267-3ce94bc6bb93?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 3,
    merchant: 'Shell Gas Station',
    date: '21 Okt 2026',
    amount: 'Rp 250.000',
    status: 'processing',
    imageUrl: 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 4,
    merchant: 'Gramedia',
    date: '18 Okt 2026',
    amount: 'Rp 340.000',
    status: 'verified',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80'
  }
];

const OcrArchiveView = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredReceipts = dummyReceipts.filter(receipt => 
    receipt.merchant.toLowerCase().includes(searchTerm.toLowerCase()) || 
    receipt.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ocr-archive-view">
      {/* Header */}
      <div className="oa-header">
        <button className="oa-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2>Arsip Struk (OCR)</h2>
        <div style={{ width: 24 }}></div>
      </div>

      {/* Search Bar */}
      <div className="oa-search-container">
        <div className="oa-search-box glass-card">
          <Search size={18} className="oa-search-icon" />
          <input 
            type="text" 
            placeholder="Cari merchant atau tanggal..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="oa-search-input"
          />
        </div>
      </div>

      {/* Content List */}
      <div className="oa-content">
        <p className="oa-subtitle">Menampilkan {filteredReceipts.length} struk tersimpan</p>

        <div className="oa-grid">
          {filteredReceipts.map(receipt => (
            <div key={receipt.id} className="oa-card glass-card">
              <div 
                className="oa-image-container" 
                onClick={() => setSelectedImage(receipt.imageUrl)}
              >
                <img src={receipt.imageUrl} alt={receipt.merchant} className="oa-image" />
                <div className="oa-image-overlay">
                  <ZoomIn size={24} color="white" />
                </div>
              </div>
              
              <div className="oa-details">
                <div className="oa-details-top">
                  <h3>{receipt.merchant}</h3>
                  <span className={`oa-status-badge ${receipt.status}`}>
                    {receipt.status === 'verified' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {receipt.status === 'verified' ? 'Terverifikasi' : 'Diproses'}
                  </span>
                </div>
                
                <div className="oa-details-bottom">
                  <div className="oa-date">
                    <Calendar size={14} />
                    {receipt.date}
                  </div>
                  <div className="oa-amount">{receipt.amount}</div>
                </div>
              </div>
            </div>
          ))}

          {filteredReceipts.length === 0 && (
            <div className="oa-empty">
              <FileText size={48} color="rgba(255,255,255,0.2)" />
              <p>Tidak ada struk yang cocok dengan pencarian.</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="oa-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="oa-modal-content" onClick={e => e.stopPropagation()}>
            <img src={selectedImage} alt="Preview" className="oa-modal-image" />
            <button className="oa-modal-close" onClick={() => setSelectedImage(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OcrArchiveView;
