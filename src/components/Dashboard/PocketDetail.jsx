import React, { useState, useEffect } from 'react';
import { ChevronLeft, MoreVertical, Plus, Utensils, ShoppingCart, ArrowDownCircle, ArrowUpCircle, Banknote, X, Image as ImageIcon } from 'lucide-react';
import AddTransactionOverlay from './AddTransactionOverlay';
import { transactionService } from '../../services/api';
import './PocketDetail.css';

const PocketDetail = ({ pocket, onBack, onRefresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState(null);

  useEffect(() => {
    if (pocket && pocket.id) {
      transactionService.getAll(pocket.id)
        .then(txs => {
          const hasStartingTx = txs.some(tx => tx.title.toLowerCase().includes('saldo awal'));
          const initialBal = Number(pocket.balance || 0);
          if (!hasStartingTx && initialBal > 0) {
            let dateStr = 'Baru saja';
            const dateVal = pocket.createdAt;
            if (dateVal) {
              const d = new Date(dateVal);
              if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              }
            }
            const virtualTx = {
              id: `virtual-${pocket.id}`,
              wallet_id: pocket.id,
              title: `Saldo Awal ${pocket.title}`,
              date: dateStr,
              amount: `+ Rp ${initialBal.toLocaleString('id-ID')}`,
              amountVal: initialBal,
              category: 'Pemasukan',
              type: 'income',
              Icon: Banknote,
              iconClass: 'icon-green'
            };
            setTransactions([virtualTx, ...txs]);
          } else {
            setTransactions(txs);
          }
        })
        .catch(err => {
          console.error("Gagal mengambil transaksi untuk dompet ini:", err);
        });
    }
  }, [pocket]);

  if (!pocket) return null;

  const handleAddTransaction = (newTx) => {
    transactionService.create({
      wallet_id: pocket.id,
      amount: Number(newTx.amount),
      type: newTx.type || 'expense',
      description: newTx.description,
      transaction_date: newTx.transactionDate,
      receiptImage: newTx.receiptImage || null
    })
    .then(() => {
      // Reload transactions
      transactionService.getAll(pocket.id)
        .then(txs => {
          setTransactions(txs);
        });
      if (onRefresh) onRefresh();
      setShowAddOverlay(false);
    })
    .catch(err => {
      console.error("Gagal menambah transaksi:", err);
      alert("Gagal menambahkan transaksi di server.");
    });
  };

  return (
    <div className="pocket-detail-view">
      <div className="pd-header">
        <button className="pd-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2>Detail Kantong</h2>
        <button className="pd-menu-btn">
          <MoreVertical size={24} />
        </button>
      </div>

      <div className="pd-content">
        <div className={`pd-main-card ${pocket.colorClass}`}>
          <div className="pd-card-header">
            <div className="pd-icon">
              <pocket.Icon size={24} />
            </div>
            <h3>{pocket.title}</h3>
          </div>
          <div className="pd-balance">
            <p>Sisa Anggaran</p>
            <h1>{pocket.amount}</h1>
          </div>
          <div className="pd-progress">
            <div className="pd-progress-labels">
              <span>Penggunaan</span>
              <span>{pocket.progress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${pocket.progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="pd-actions">
          <button className="pd-action-btn primary" onClick={() => setShowAddOverlay(true)}>
            <Plus size={20} />
            Tambah Transaksi
          </button>
        </div>

        <div className="pd-transactions">
          <h3>Riwayat Transaksi</h3>
          <div className="activity-list">
            {transactions.map(activity => (
              <div key={activity.id} className="activity-item-wrapper">
                <div className="activity-item">
                  <div className={`activity-icon ${activity.iconClass}`}>
                    <activity.Icon size={20} />
                  </div>
                  <div className="activity-details">
                    <h4>{activity.title}</h4>
                    <p>{activity.date}</p>
                  </div>
                  <div className="activity-amount-box">
                    <h4 className={activity.type === 'expense' ? 'text-red' : 'text-green'}>
                      {activity.amount}
                    </h4>
                  </div>
                </div>
                {/* Receipt Image Indicator */}
                {activity.image_url && (
                  <button 
                    className="receipt-indicator"
                    onClick={() => setSelectedReceiptUrl(activity.image_url)}
                    title="Lihat bukti transaksi"
                  >
                    <ImageIcon size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Receipt Image Modal */}
      {selectedReceiptUrl && (
        <div className="receipt-modal-overlay" onClick={() => setSelectedReceiptUrl(null)}>
          <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="receipt-modal-close" onClick={() => setSelectedReceiptUrl(null)}>
              <X size={24} />
            </button>
            <img src={selectedReceiptUrl} alt="Bukti transaksi" className="receipt-modal-image" />
          </div>
        </div>
      )}

      {showAddOverlay && (
        <AddTransactionOverlay
          type="expense"
          pockets={[pocket]}
          onClose={() => setShowAddOverlay(false)}
          onSubmit={handleAddTransaction}
        />
      )}
    </div>
  );
};

export default PocketDetail;
