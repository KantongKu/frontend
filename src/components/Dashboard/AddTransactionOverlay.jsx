import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Wallet, Calendar } from 'lucide-react';
import './AddTransactionOverlay.css';

const AddTransactionOverlay = ({ type = 'expense', pockets, onClose, onSubmit }) => {
  const [transactionType, setTransactionType] = useState(type);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPocketId, setSelectedPocketId] = useState(pockets.length > 0 ? pockets[0].id : '');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !description || !selectedPocketId) return;

    // Convert amount to number (remove non-digits)
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    
    onSubmit({
      type: transactionType,
      amount: numAmount,
      description,
      pocketId: selectedPocketId,
      transactionDate
    });
  };

  const handleAmountChange = (e) => {
    // Format to currency as user types
    let val = e.target.value.replace(/\D/g, '');
    if (val) {
      val = parseInt(val, 10).toLocaleString('id-ID');
    }
    setAmount(val);
  };

  const isIncome = transactionType === 'income';

  return (
    <div className="add-transaction-overlay">
      <div className="ato-header">
        <button className="ato-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>{isIncome ? 'Tambah Pemasukan' : 'Catat Pengeluaran'}</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="ato-content">
        <div className="ato-type-toggle">
          <button 
            type="button"
            className={`toggle-btn ${!isIncome ? 'active expense' : ''}`}
            onClick={() => setTransactionType('expense')}
          >
            Pengeluaran
          </button>
          <button 
            type="button"
            className={`toggle-btn ${isIncome ? 'active income' : ''}`}
            onClick={() => setTransactionType('income')}
          >
            Pemasukan
          </button>
        </div>

        <form className="ato-form" onSubmit={handleSubmit}>
          <div className="ato-form-group">
            <label>Nominal (Rp)</label>
            <input 
              type="text" 
              placeholder="0" 
              value={amount}
              onChange={handleAmountChange}
              className="ato-input amount-input"
            />
          </div>

          <div className="ato-form-group">
            <label>Pilih Kantong</label>
            <div className="ato-pocket-select">
              <Wallet size={20} className="ato-input-icon" />
              <select 
                value={selectedPocketId}
                onChange={(e) => setSelectedPocketId(parseInt(e.target.value, 10))}
                className="ato-input select-input"
              >
                {pockets.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ato-form-group">
            <label>Tanggal Transaksi</label>
            <div className="ato-pocket-select">
              <Calendar size={20} className="ato-input-icon" />
              <input 
                type="date" 
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="ato-input date-input"
              />
            </div>
          </div>

          <div className="ato-form-group">
            <label>Catatan / Keterangan</label>
            <input 
              type="text" 
              placeholder={isIncome ? 'Gaji bulan ini...' : 'Makan siang...'} 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="ato-input"
            />
          </div>

          <button type="submit" className={`ato-submit-btn ${isIncome ? 'btn-income' : 'btn-expense'}`}>
            Simpan Transaksi
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionOverlay;
