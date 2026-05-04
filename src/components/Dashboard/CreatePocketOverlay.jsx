import React, { useState } from 'react';
import { X, Sparkles, Check, ChevronDown, Wallet, PiggyBank, Plane, Heart, Home } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import './CreatePocketOverlay.css';

const CreatePocketOverlay = ({ onClose, onAddDummyPocket }) => {
  const { monthlyIncome } = useExpense();
  const [pocketName, setPocketName] = useState('');
  const [pocketType, setPocketType] = useState('Savings');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('PiggyBank');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const pocketTypes = [
    { value: 'Needs', label: 'Kebutuhan Pokok (Needs)' },
    { value: 'Wants', label: 'Hiburan/Keinginan (Wants)' },
    { value: 'Savings', label: 'Tabungan/Investasi (Savings)' }
  ];

  const icons = [
    { name: 'PiggyBank', component: PiggyBank },
    { name: 'Wallet', component: Wallet },
    { name: 'Plane', component: Plane },
    { name: 'Heart', component: Heart },
    { name: 'Home', component: Home }
  ];

  const handleAiRecommendation = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      let recommendedRatio = 0;
      if (pocketType === 'Needs') recommendedRatio = 0.50;
      else if (pocketType === 'Wants') recommendedRatio = 0.30;
      else if (pocketType === 'Savings') recommendedRatio = 0.20;

      // Suggest based on ratio and remaining income (simplified logic)
      const suggestion = monthlyIncome * recommendedRatio;
      setTargetAmount(suggestion.toString());
      setIsAiProcessing(false);
    }, 1500);
  };

  const handleCreate = () => {
    if (!pocketName || !targetAmount) {
      alert('Nama dan target jumlah harus diisi');
      return;
    }

    // Pass data back to Dashboard to add to dummy list for now
    onAddDummyPocket({
      title: pocketName,
      amount: parseInt(targetAmount),
      iconName: selectedIcon,
      type: pocketType
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
              placeholder="Contoh: Dana Darurat" 
              value={pocketName}
              onChange={(e) => setPocketName(e.target.value)}
            />
          </div>

          <div className="cp-input-group">
            <label>Pilih Ikon</label>
            <div className="cp-icon-selector">
              {icons.map(icon => (
                <button 
                  key={icon.name}
                  className={`cp-icon-btn ${selectedIcon === icon.name ? 'active' : ''}`}
                  onClick={() => setSelectedIcon(icon.name)}
                >
                  <icon.component size={24} />
                </button>
              ))}
            </div>
          </div>

          <div className="cp-input-group">
            <label>Prioritas / Jenis</label>
            <div className="cp-select-wrapper">
              <select value={pocketType} onChange={(e) => setPocketType(e.target.value)}>
                {pocketTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="cp-select-icon" size={16} />
            </div>
          </div>
        </div>

        <div className="cp-card">
          <p className="cp-section-title">Alokasi Anggaran (AI Budgeting)</p>
          
          <div className="cp-ai-banner">
            <div className="cp-ai-info">
              <Sparkles size={20} className="text-yellow" />
              <div>
                <h4>Rekomendasi AI</h4>
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
            <label>Target Anggaran (Rp)</label>
            <input 
              type="number" 
              placeholder="Masukkan jumlah" 
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
