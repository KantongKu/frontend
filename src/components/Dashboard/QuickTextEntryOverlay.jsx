import React, { useState } from 'react';
import { ArrowLeft, Trash2, Sparkles, Check, Info, ChevronDown } from 'lucide-react';
import { parseAiTransactions } from '../../services/ai';
import './QuickTextEntryOverlay.css';

const QuickTextEntryOverlay = ({ pockets, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [textInput, setTextInput] = useState('');
  const [isMultiple, setIsMultiple] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState([]);

  const handleParse = async () => {
    if (!textInput.trim()) return;
    setIsParsing(true);
    try {
      const parsed = await parseAiTransactions(textInput, pockets, isMultiple);
      setParsedTransactions(parsed);
      setStep(2);
    } catch (err) {
      console.error('Error parsing transactions:', err);
      alert('Gagal mengurai transaksi dengan AI.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = () => {
    // Filter out invalid transactions
    const validTxs = parsedTransactions.filter(tx => tx.amount > 0 && tx.description.trim());
    if (validTxs.length === 0) {
      alert('Tidak ada transaksi valid untuk disimpan.');
      return;
    }
    onSubmit(validTxs);
  };

  const handleUpdateTransaction = (index, field, value) => {
    setParsedTransactions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteTransaction = (index) => {
    setParsedTransactions(prev => prev.filter((_, idx) => idx !== index));
  };

  // Helper to format currency for display
  const formatValue = (val) => {
    if (!val) return '';
    return Number(val).toLocaleString('id-ID');
  };

  return (
    <div className="quick-text-overlay">
      {/* Header */}
      <div className="qto-header">
        <button 
          className="qto-back-btn" 
          onClick={step === 2 ? () => setStep(1) : onClose}
          aria-label="Kembali"
        >
          <ArrowLeft size={24} />
        </button>
        <h2>{step === 1 ? 'Quick text entry' : 'Review transactions'}</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="qto-content">
        {step === 1 ? (
          /* STEP 1: Text Input Form */
          <div className="qto-step-input">
            <div className="qto-toggle-container">
              <div className="qto-toggle-text">
                <span className="qto-toggle-title">Multiple entries</span>
                <span className="qto-toggle-desc">Parse each line as a separate transaction.</span>
              </div>
              <label className="qto-switch">
                <input 
                  type="checkbox" 
                  checked={isMultiple} 
                  onChange={(e) => setIsMultiple(e.target.checked)} 
                />
                <span className="qto-slider"></span>
              </label>
            </div>

            <div className="qto-textarea-wrapper">
              <textarea
                className="qto-textarea"
                placeholder={isMultiple ? "Type your transactions, one per line e.g.\nkopi kenangan 50rb\ngaji bulanan 3jt" : "Type your transaction, e.g. \"kopi kenangan 50rb\" or \"gaji 3jt\""}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isParsing}
              />
            </div>

            <button 
              className={`qto-action-btn ${textInput.trim() ? 'active' : ''}`}
              onClick={handleParse}
              disabled={isParsing || !textInput.trim()}
            >
              {isParsing ? (
                <>
                  <span className="qto-spinner"></span>
                  Parsing with AI...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Add transaction
                </>
              )}
            </button>
          </div>
        ) : (
          /* STEP 2: Review Screen */
          <div className="qto-step-review">
            <div className="qto-review-info">
              <Info size={16} />
              <span>Tinjau dan sesuaikan transaksi pilihan AI di bawah ini.</span>
            </div>

            <div className="qto-cards-list">
              {parsedTransactions.map((tx, index) => (
                <div key={index} className={`qto-card ${tx.type}`}>
                  <div className="qto-card-header">
                    <button 
                      type="button" 
                      className={`qto-type-badge ${tx.type}`}
                      onClick={() => handleUpdateTransaction(index, 'type', tx.type === 'expense' ? 'income' : 'expense')}
                      title="Klik untuk ubah jenis"
                    >
                      <span className="qto-badge-dot"></span>
                      {tx.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                    </button>
                    
                    <button 
                      type="button" 
                      className="qto-card-delete"
                      onClick={() => handleDeleteTransaction(index)}
                      aria-label="Hapus transaksi"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="qto-card-body">
                    <div className="qto-input-group full-width">
                      <label className="qto-input-label">Deskripsi</label>
                      <input 
                        type="text" 
                        className="qto-description-input"
                        value={tx.description}
                        onChange={(e) => handleUpdateTransaction(index, 'description', e.target.value)}
                        placeholder="Contoh: Kopi Susu"
                      />
                    </div>

                    <div className="qto-card-row-split">
                      <div className="qto-input-group amount-group">
                        <label className="qto-input-label">Nominal</label>
                        <div className="qto-amount-input-wrapper">
                          <span className="qto-currency-prefix">Rp</span>
                          <input 
                            type="text" 
                            className="qto-amount-input"
                            value={formatValue(tx.amount)}
                            onChange={(e) => {
                              const cleanVal = e.target.value.replace(/\D/g, '');
                              handleUpdateTransaction(index, 'amount', cleanVal ? parseInt(cleanVal, 10) : 0);
                            }}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="qto-input-group pocket-group">
                        <label className="qto-input-label">Kantong</label>
                        <div className="qto-select-wrapper">
                          <select 
                            className="qto-pocket-select-input"
                            value={tx.wallet_id || ''}
                            onChange={(e) => handleUpdateTransaction(index, 'wallet_id', e.target.value ? parseInt(e.target.value, 10) : null)}
                          >
                            <option value="">Pilih Kantong</option>
                            {pockets.map(p => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="qto-select-chevron" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="qto-save-btn active"
              onClick={handleSave}
            >
              <Check size={18} />
              Simpan Transaksi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickTextEntryOverlay;
