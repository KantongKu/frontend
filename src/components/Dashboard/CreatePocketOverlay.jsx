import React, { useState } from 'react';
import { X, Sparkles, Check, Wallet } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import './CreatePocketOverlay.css';

const CreatePocketOverlay = ({ onClose, onAddDummyPocket }) => {
  const { monthlyIncome } = useExpense();
  const [pocketName, setPocketName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const handleAiRecommendation = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      // Rekomendasi alokasi tabungan ideal sebesar 20% dari total pendapatan bulanan
      const suggestion = Math.round(monthlyIncome * 0.20);
      setTargetAmount(suggestion.toString());
      setIsAiProcessing(false);
    }, 1200);
  };

  const handleCreate = () => {
    if (!pocketName || !targetAmount) {
      alert('Nama dan target jumlah harus diisi');
      return;
    }

    // Mengirimkan data baru yang hanya memuat nama dan batas anggaran (budget_limit)
    onAddDummyPocket({
      title: pocketName,
      amount: parseInt(targetAmount),
      iconName: 'Wallet',
      colorClass: 'pocket-blue'
    });
    
    onClose();
  };

  return (
    <div className="create-pocket-overlay">
      <div className="cp-header">
        <h3>Buat Kantong Baru</h3>
        <button className="cp-btn-close" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="cp-content">
        <div className="cp-card">
          <p className="cp-section-title">Informasi Kantong</p>
          
          <div className="cp-input-group">
            <label>Nama Kantong</label>
            <input 
              type="text" 
              placeholder="Contoh: Belanja Bulanan, Traveling, Tabungan" 
              value={pocketName}
              onChange={(e) => setPocketName(e.target.value)}
            />
          </div>
        </div>

        <div className="cp-card">
          <p className="cp-section-title">Alokasi Anggaran (AI Budgeting)</p>
          
          <div className="cp-ai-banner">
            <div className="cp-ai-info">
              <Sparkles size={20} className="text-yellow" />
              <div>
                <h4>Rekomendasi AI (20% Savings)</h4>
                <p>Pendapatan Anda: Rp {monthlyIncome.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <button 
              className="cp-btn-ai"
              onClick={handleAiRecommendation}
              disabled={isAiProcessing}
            >
              {isAiProcessing ? 'Menghitung...' : 'Minta Saran'}
            </button>
          </div>

          <div className="cp-input-group mt-16">
            <label>Target Anggaran / Batas Limit (Rp)</label>
            <input 
              type="number" 
              placeholder="Masukkan jumlah target limit" 
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="amount-input"
            />
          </div>
        </div>
      </div>

      <div className="cp-footer">
        <button className="cp-btn-submit" onClick={handleCreate}>
          Buat Kantong <Check size={18} />
        </button>
      </div>
    </div>
  );
};

export default CreatePocketOverlay;
