import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { transactionService } from '../../services/api';
import './EditTransactionOverlay.css';

const EditTransactionOverlay = ({ transaction, walletId, onClose, onSave }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [transactionDate, setTransactionDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.title || '');
      setAmount(transaction.amountVal || 0);
      setType(transaction.type || 'expense');
      // Parse date from transaction.dateRaw
      if (transaction.dateRaw) {
        const dateObj = new Date(transaction.dateRaw);
        const isoDate = dateObj.toISOString().split('T')[0];
        setTransactionDate(isoDate);
      }
    }
  }, [transaction]);

  const handleSave = async () => {
    if (!description.trim()) {
      setError('Deskripsi tidak boleh kosong');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Jumlah harus lebih dari 0');
      return;
    }

    if (!transactionDate) {
      setError('Tanggal transaksi harus diisi');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await transactionService.update(transaction.id, {
        wallet_id: walletId,
        amount: Number(amount),
        type,
        description: description.trim(),
        transaction_date: transactionDate
      });

      onSave();
      onClose();
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err.message || 'Gagal memperbarui transaksi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await transactionService.delete(transaction.id);
      alert('✅ Transaksi berhasil dihapus!');
      onSave();
      onClose();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err.message || 'Gagal menghapus transaksi');
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-transaction-overlay">
      <div className="edit-transaction-backdrop" onClick={onClose}></div>
      <div className="edit-transaction-modal">
        <div className="edit-transaction-header">
          <h2>Edit Transaksi</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="edit-transaction-content">
          {error && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label>Tipe Transaksi</label>
            <div className="type-selector">
              <button
                className={`type-btn ${type === 'expense' ? 'active' : ''}`}
                onClick={() => setType('expense')}
                disabled={loading}
              >
                Pengeluaran
              </button>
              <button
                className={`type-btn ${type === 'income' ? 'active' : ''}`}
                onClick={() => setType('income')}
                disabled={loading}
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Deskripsi</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi transaksi"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Jumlah (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Masukkan jumlah"
              disabled={loading}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Tanggal Transaksi</label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="edit-transaction-actions">
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
              className="btn-delete-transaction"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
            >
              Hapus Transaksi
            </button>
          )}

          {showDeleteConfirm && (
            <div className="delete-confirmation">
              <p>⚠️ Yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.</p>
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

export default EditTransactionOverlay;
