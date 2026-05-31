import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Settings, Bell, Shield, Download, HelpCircle, LogOut, ChevronRight, BrainCircuit, Medal, Camera } from 'lucide-react';
import './ProfileView.css';

const ProfileView = ({ onBack, onAction }) => {
  const [profile, setProfile] = useState({
    name: 'Budi Santoso',
    email: 'budi.santoso@example.com'
  });

  useEffect(() => {
    const activeUserJson = localStorage.getItem('activeUser');
    if (activeUserJson) {
      const activeUser = JSON.parse(activeUserJson);
      setProfile({
        name: activeUser.name || 'Budi Santoso',
        email: activeUser.email || 'budi.santoso@example.com'
      });
    }
  }, []);

  return (
    <div className="profile-view">
      <div className="pv-header">
        <button className="pv-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2>Profil Akun</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="pv-content">
        {/* User Info Card */}
        <div className="pv-user-card glass-card">
          <div className="pv-avatar-wrapper">
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="pv-avatar" />
            <div className="pv-badge">LEVEL 5 SAVER</div>
          </div>
          <h2 className="pv-name">{profile.name}</h2>
          <p className="pv-email">{profile.email}</p>
          <button className="pv-edit-btn" onClick={() => onAction('edit-profile')}>Edit Profil</button>
        </div>

        {/* KantongKu Pintar (AI & Features) */}
        <div className="pv-menu-section">
          <h3>KantongKu Pintar (AI)</h3>
          <div className="glass-card pv-menu-list">
            <button className="pv-menu-item" onClick={() => onAction('ai-budgeting')}>
              <div className="pv-menu-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                <BrainCircuit size={20} />
              </div>
              <span>Pengaturan AI Budgeting</span>
              <ChevronRight size={20} className="pv-chevron" />
            </button>
            <button className="pv-menu-item" onClick={() => onAction('nlp-categorization')}>
              <div className="pv-menu-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                <Settings size={20} />
              </div>
              <span>Aturan Kategorisasi (NLP)</span>
              <ChevronRight size={20} className="pv-chevron" />
            </button>
            <button className="pv-menu-item" onClick={() => onAction('ocr-archive')}>
              <div className="pv-menu-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                <Camera size={20} />
              </div>
              <span>Arsip Pemindaian Struk (OCR)</span>
              <ChevronRight size={20} className="pv-chevron" />
            </button>
          </div>
        </div>

        {/* Gamifikasi & Akun */}
        <div className="pv-menu-section">
          <h3>Pencapaian & Akun</h3>
          <div className="glass-card pv-menu-list">
            <button className="pv-menu-item" onClick={() => onAction('Menu Gamifikasi dalam pengembangan')}>
              <div className="pv-menu-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
                <Medal size={20} />
              </div>
              <span>Gamifikasi & Lencana</span>
              <div className="pv-menu-value">12 Badge</div>
              <ChevronRight size={20} className="pv-chevron" />
            </button>
            <button className="pv-menu-item" onClick={() => onAction('Menu Informasi Pribadi segera hadir')}>
              <div className="pv-menu-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>
                <User size={20} />
              </div>
              <span>Informasi Pribadi</span>
              <ChevronRight size={20} className="pv-chevron" />
            </button>
            <button className="pv-menu-item" onClick={() => onAction('Pengaturan Keamanan segera hadir')}>
              <div className="pv-menu-icon" style={{ background: 'rgba(244, 67, 54, 0.2)', color: '#f44336' }}>
                <Shield size={20} />
              </div>
              <span>Keamanan & PIN</span>
              <ChevronRight size={20} className="pv-chevron" />
            </button>
          </div>
        </div>

        {/* Preferensi */}
        <div className="pv-menu-section">
          <h3>Preferensi Aplikasi</h3>
          <div className="glass-card pv-menu-list">
            <button className="pv-menu-item" onClick={() => onAction('Pengaturan Notifikasi segera hadir')}>
              <div className="pv-menu-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>
                <Bell size={20} />
              </div>
              <span>Notifikasi Pintar</span>
              <div className="pv-menu-value">Aktif</div>
              <ChevronRight size={20} className="pv-chevron" />
            </button>
            <button className="pv-menu-item" onClick={() => onAction('Laporan sedang diekspor ke PDF/CSV...')}>
              <div className="pv-menu-icon" style={{ background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' }}>
                <Download size={20} />
              </div>
              <span>Ekspor Laporan Bulanan</span>
              <ChevronRight size={20} className="pv-chevron" />
            </button>
            <button className="pv-menu-item" onClick={() => onAction('Pusat Bantuan sedang dialihkan...')}>
              <div className="pv-menu-icon" style={{ background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' }}>
                <HelpCircle size={20} />
              </div>
              <span>Pusat Bantuan</span>
              <ChevronRight size={20} className="pv-chevron" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button className="pv-logout-btn glass-card" onClick={() => onAction('logout')}>
          <LogOut size={20} />
          Keluar dari Akun
        </button>

        <p className="pv-version">KantongKu App v1.0.0</p>
      </div>
    </div>
  );
};

export default ProfileView;
