import React, { useState, useEffect } from 'react';
import { ChevronLeft, LogOut, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { userService } from '../../services/api';
import './ProfileView.css';

const ProfileView = ({ onBack, onAction, refreshTrigger }) => {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await userService.getProfile();
        setProfile({
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          avatar_url: profileData.avatar_url || 'https://i.pravatar.cc/150?img=11'
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Fallback ke localStorage jika API gagal
        const activeUserJson = localStorage.getItem('activeUser');
        if (activeUserJson) {
          try {
            const activeUser = JSON.parse(activeUserJson);
            setProfile({
              full_name: activeUser.full_name || activeUser.name || '',
              email: activeUser.email || '',
              avatar_url: activeUser.avatar_url || 'https://i.pravatar.cc/150?img=11'
            });
          } catch (parseError) {
            console.error('Error parsing localStorage:', parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [refreshTrigger]);

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
            <img src={profile.avatar_url} alt="Profile" className="pv-avatar" />
          </div>
          <h2 className="pv-name">{profile.full_name}</h2>
          <p className="pv-email">{profile.email}</p>
          <button className="pv-edit-btn" onClick={() => onAction('edit-profile')}>Edit Profil</button>
        </div>

        {/* KantongKu Pintar (AI & Features) */}
        <div className="pv-menu-section">
          <h3>KantongKu Pintar (AI)</h3>
          <div className="glass-card pv-menu-list">
            <button className="pv-menu-item" onClick={() => onAction('transaction-gallery')}>
              <div className="pv-menu-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
                <ImageIcon size={20} />
              </div>
              <span>Galeri Transaksi Dengan Bukti</span>
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
