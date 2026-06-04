import React, { useState } from 'react';
import { X, Sparkles, Check, Wallet } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { getAiPocketSuggestion } from '../../services/ai';
import './CreatePocketOverlay.css';

const CreatePocketOverlay = ({ onClose, onAddDummyPocket }) => {
  const { monthlyIncome } = useExpense();
  const [pocketName, setPocketName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [aiReason, setAiReason] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const handleNameChange = (e) => {
    setPocketName(e.target.value);
    if (aiReason) setAiReason('');
  };

  const handleAiRecommendation = async () => {
    if (!pocketName.trim()) {
      alert('Masukkan nama kantong terlebih dahulu agar AI dapat memberikan saran yang relevan.');
      return;
    }
    setIsAiProcessing(true);
    try {
      const activeUserJson = localStorage.getItem('activeUser');
      const activeUser = activeUserJson ? JSON.parse(activeUserJson) : {};
      const profession = activeUser.profession || ''; // optional

      const res = await getAiPocketSuggestion(pocketName, monthlyIncome, profession);
      setTargetAmount(res.suggested_limit.toString());
      setAiReason(res.reason);
    } catch (e) {
      console.error('Error getting AI recommendation:', e);
      alert('Gagal mendapatkan rekomendasi AI.');
    } finally {
      setIsAiProcessing(false);
    }
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
              onChange={handleNameChange}
            />
          </div>
        </div>

        <div className="cp-card">
          <p className="cp-section-title">Alokasi Anggaran (AI Budgeting)</p>
          
          <div className="cp-ai-banner">
            <div className="cp-ai-info">
              <Sparkles size={20} className="text-yellow" />
              <div>
                <h4>Rekomendasi AI Pintar</h4>
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

          {aiReason && (
            <p className="cp-ai-reason-text">
              ✨ <strong>Saran AI:</strong> {aiReason}
            </p>
          )}

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
