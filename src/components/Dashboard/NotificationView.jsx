import React from 'react';
import { ChevronLeft, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import './NotificationView.css';

const dummyNotifications = [
  { id: 1, type: 'alert', title: 'Anggaran Hampir Habis', message: 'Sisa anggaran kantong "Daily Needs" Anda tersisa 10%.', time: '10 menit yang lalu', read: false, Icon: AlertTriangle, color: '#f59e0b' },
  { id: 2, type: 'success', title: 'Transaksi Berhasil', message: 'Pemasukan Rp 12.000.000 telah tercatat di kantong "Emergency".', time: '2 jam yang lalu', read: true, Icon: CheckCircle, color: '#10b981' },
  { id: 3, type: 'info', title: 'Insight Keuangan', message: 'Pengeluaran Anda bulan ini 20% lebih hemat dari bulan lalu! Pertahankan kinerjanya.', time: 'Kemarin', read: true, Icon: TrendingUp, color: '#3b82f6' },
];

const NotificationView = ({ onBack }) => {
  return (
    <div className="notification-view">
      <div className="nv-header">
        <button className="nv-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2>Notifikasi</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="nv-content">
        <div className="nv-list">
          {dummyNotifications.map(notif => (
            <div key={notif.id} className={`nv-card glass-card ${notif.read ? 'read' : 'unread'}`}>
              <div className="nv-icon" style={{ backgroundColor: `${notif.color}20`, color: notif.color }}>
                <notif.Icon size={20} />
              </div>
              <div className="nv-details">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                <span className="nv-time">{notif.time}</span>
              </div>
              {!notif.read && <div className="nv-unread-dot"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationView;
