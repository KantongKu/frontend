import React, { useState } from 'react';
import { ChevronLeft, MoreVertical, Plus, Utensils, ShoppingCart, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import AddTransactionOverlay from './AddTransactionOverlay';
import './PocketDetail.css';

const dummyPocketActivities = [
  { id: 1, title: 'Starbucks', date: 'Today, 08:30 AM', amount: '- Rp 55.000', type: 'expense', Icon: Utensils, iconClass: 'icon-blue' },
  { id: 2, title: 'Indomaret', date: 'Yesterday, 19:20 PM', amount: '- Rp 120.000', type: 'expense', Icon: ShoppingCart, iconClass: 'icon-white' },
];

const PocketDetail = ({ pocket, onBack }) => {
  const [transactions, setTransactions] = useState(dummyPocketActivities);
  const [showAddOverlay, setShowAddOverlay] = useState(false);

  if (!pocket) return null;

  const handleAddTransaction = (newTx) => {
    const now = new Date();
    const formattedDate = `Today, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    
    const newActivity = {
      id: Date.now(),
      title: newTx.description || 'New Transaction',
      date: formattedDate,
      amount: `${newTx.type === 'expense' ? '-' : '+'} Rp ${newTx.amount.toLocaleString('id-ID')}`,
      type: newTx.type,
      Icon: newTx.type === 'expense' ? ArrowUpCircle : ArrowDownCircle,
      iconClass: newTx.type === 'expense' ? 'icon-white' : 'icon-blue'
    };

    setTransactions([newActivity, ...transactions]);
    setShowAddOverlay(false);
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
              <div key={activity.id} className="activity-item">
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
            ))}
          </div>
        </div>
      </div>

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
