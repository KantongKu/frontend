import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Camera, User, Mail, Save } from 'lucide-react';
import { userService } from '../../services/api';
import './EditProfileView.css';

const EditProfileView = ({ onBack, onSave }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const activeUserJson = localStorage.getItem('activeUser');
    if (activeUserJson) {
      const activeUser = JSON.parse(activeUserJson);
      if (activeUser.full_name) setFullName(activeUser.full_name);
      if (activeUser.email) setEmail(activeUser.email);
      if (activeUser.avatar_url) setAvatarUrl(activeUser.avatar_url);
    }
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Prepare data - use FormData if avatar file exists
      const updateData = {
        full_name: fullName,
        email: email,
        avatar: avatarFile
      };

      // Update profile via API
      await userService.updateProfile(updateData);

      onSave('Profil berhasil diperbarui!');
      onBack();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar = avatarPreview || avatarUrl || 'https://i.pravatar.cc/150?img=11';

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
            <img src={displayAvatar} alt="Profile" className="ep-avatar" />
            <button 
              className="ep-camera-btn" 
              onClick={handleAvatarClick}
              type="button"
            >
              <Camera size={18} />
            </button>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          {avatarPreview && (
            <p className="ep-avatar-hint">Foto preview dipilih</p>
          )}
        </div>

        {error && <p className="ep-error-message">{error}</p>}

        <div className="ep-form-group">
          <label>Nama Lengkap</label>
          <div className="ep-input-wrapper">
            <User size={20} className="ep-input-icon" />
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              className="ep-input"
              disabled={loading}
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
              disabled={loading}
            />
          </div>
        </div>
      </div>
      
      <div className="ep-footer">
        <button className="ep-save-btn" onClick={handleSave} disabled={loading}>
          <Save size={20} />
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
};

export default EditProfileView;
