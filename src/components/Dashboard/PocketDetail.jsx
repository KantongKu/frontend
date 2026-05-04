import React from 'react';
import { ChevronLeft, MoreVertical, Plus, Utensils, ShoppingCart } from 'lucide-react';
import './PocketDetail.css';

const dummyPocketActivities = [
  { id: 1, title: 'Starbucks', date: 'Today, 08:30 AM', amount: '- Rp 55.000', type: 'expense', Icon: Utensils, iconClass: 'icon-blue' },
  { id: 2, title: 'Indomaret', date: 'Yesterday, 19:20 PM', amount: '- Rp 120.000', type: 'expense', Icon: ShoppingCart, iconClass: 'icon-white' },
];

const PocketDetail = ({ pocket, onBack }) => {
  if (!pocket) return null;

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
          <button className="pd-action-btn primary">
            <Plus size={20} />
            Tambah Transaksi
          </button>
        </div>

        <div className="pd-transactions">
          <h3>Riwayat Transaksi</h3>
          <div className="activity-list">
            {dummyPocketActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon ${activity.iconClass}`}>
                  <activity.Icon size={20} />
                </div>
                <div className="activity-details">
                  <h4>{activity.title}</h4>
                  <p>{activity.date}</p>
                </div>
                <div className="activity-amount-box">
                  <h4 className="text-red">{activity.amount}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PocketDetail;
