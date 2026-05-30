import React, { useState, useEffect } from 'react';
import { ChevronLeft, Camera, User, Mail, Phone, Lock, Save } from 'lucide-react';
import './EditProfileView.css';

const EditProfileView = ({ onBack, onSave }) => {
  const [name, setName] = useState('Budi Santoso');
  const [email, setEmail] = useState('budi.santoso@example.com');
  const [phone, setPhone] = useState('+62 812 3456 7890');

  useEffect(() => {
    const activeUserJson = localStorage.getItem('activeUser');
    if (activeUserJson) {
      const activeUser = JSON.parse(activeUserJson);
      if (activeUser.name) setName(activeUser.name);
      if (activeUser.email) setEmail(activeUser.email);
    }
  }, []);

  const handleSave = () => {
    const activeUserJson = localStorage.getItem('activeUser');
    if (activeUserJson) {
      const activeUser = JSON.parse(activeUserJson);
      const oldEmail = activeUser.email;
      activeUser.name = name;
      activeUser.email = email;
      
      localStorage.setItem('activeUser', JSON.stringify(activeUser));
      localStorage.setItem(`user_${email}`, JSON.stringify(activeUser));
      if (oldEmail !== email) {
        localStorage.removeItem(`user_${oldEmail}`);
      }
    }
    onSave('Profil berhasil diperbarui!');
    onBack();
  };

  return (
    <div className="edit-profile-view">
      <div className="ep-header">
        <button className="ep-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2>Edit Profil</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="ep-content">
        <div className="ep-avatar-section">
          <div className="ep-avatar-wrapper">
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="ep-avatar" />
            <button className="ep-camera-btn">
              <Camera size={18} />
            </button>
          </div>
        </div>

        <div className="ep-form-group">
          <label>Nama Lengkap</label>
          <div className="ep-input-wrapper">
            <User size={20} className="ep-input-icon" />
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="ep-input"
            />
          </div>
        </div>

        <div className="ep-form-group">
          <label>Email</label>
          <div className="ep-input-wrapper">
            <Mail size={20} className="ep-input-icon" />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="ep-input"
            />
          </div>
        </div>

        <div className="ep-form-group">
          <label>Nomor Telepon</label>
          <div className="ep-input-wrapper">
            <Phone size={20} className="ep-input-icon" />
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              className="ep-input"
            />
          </div>
        </div>

        <button className="ep-change-pin-btn">
          <Lock size={18} />
          Ubah PIN / Password
        </button>

      </div>
      
      <div className="ep-footer">
        <button className="ep-save-btn" onClick={handleSave}>
          <Save size={20} />
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
};

export default EditProfileView;
