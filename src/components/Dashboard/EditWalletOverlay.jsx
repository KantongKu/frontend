import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { walletService } from '../../services/api';
import './EditWalletOverlay.css';

const EditWalletOverlay = ({ wallet, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (wallet) {
      setName(wallet.title || '');
      setBudget(wallet.budget_limit || wallet.balance || 0);
    }
  }, [wallet]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nama kantong tidak boleh kosong');
      return;
    }

    if (!budget || Number(budget) <= 0) {
      setError('Anggaran harus lebih dari 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await walletService.update(wallet.id, {
        title: name.trim(),
        budget_limit: Number(budget)
      });

      onSave();
      onClose();
    } catch (err) {
      console.error('Error updating wallet:', err);
      setError(err.message || 'Gagal memperbarui kantong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await walletService.delete(wallet.id);
      alert('✅ Kantong berhasil dihapus!');
      onSave();
      onClose();
    } catch (err) {
      console.error('Error deleting wallet:', err);
      setError(err.message || 'Gagal menghapus kantong');
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-wallet-overlay">
      <div className="edit-wallet-backdrop" onClick={onClose}></div>
      <div className="edit-wallet-modal">
        <div className="edit-wallet-header">
          <h2>Edit Kantong</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="edit-wallet-content">
          {error && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label>Nama Kantong</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama kantong"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Anggaran (Rp)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Masukkan anggaran"
              disabled={loading}
              min="0"
            />
          </div>

          <div className="edit-wallet-actions">
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </button>
          </div>

          {!showDeleteConfirm && (
            <button
              className="btn-delete-wallet"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
            >
              Hapus Kantong
            </button>
          )}

          {showDeleteConfirm && (
            <div className="delete-confirmation">
              <p>⚠️ Yakin ingin menghapus kantong ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="delete-confirm-actions">
                <button
                  className="btn-delete-confirm"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
                <button
                  className="btn-delete-cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Tidak, Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditWalletOverlay;
