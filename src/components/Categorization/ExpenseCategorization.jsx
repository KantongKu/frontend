import React, { useState } from 'react';
import { Trash2, Edit2, Check, X, Sparkles, Loader } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import './Categorization.css';

const ExpenseCategorization = () => {
  const { expenses, budgets, categorizeExpense, deleteExpense, updateExpense } = useExpense();
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState({});
  const [filterCategory, setFilterCategory] = useState('all');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const categories = Object.keys(budgets);
  const uncategorized = expenses.filter(exp => exp.status === 'pending' || exp.category === 'Uncategorized');
  const categorized = expenses.filter(exp => exp.status === 'categorized');

  const handleCategorize = (id) => {
    const category = selectedCategory[id];
    if (category) {
      categorizeExpense(id, category);
      setEditingId(null);
    }
  };

  const simulateNLPAutoCategorization = () => {
    setIsProcessingAI(true);
    const rules = {
      'Makanan & Minuman': ['sate', 'nasi', 'kopi', 'makan', 'minum', 'ayam', 'roti', 'kue', 'indomie', 'susu', 'cafe', 'resto'],
      'Transportasi': ['bensin', 'parkir', 'tol', 'gojek', 'grab', 'kereta', 'tiket pesawat', 'ojek', 'bus'],
      'Hiburan': ['tiket', 'nonton', 'bioskop', 'netflix', 'spotify', 'game', 'main', 'liburan'],
      'Utilitas': ['listrik', 'air', 'internet', 'pulsa', 'pln', 'wifi', 'kuota', 'tagihan'],
      'Kesehatan': ['obat', 'dokter', 'apotek', 'klinik', 'vitamin', 'rumah sakit'],
      'Pendidikan': ['buku', 'kursus', 'sekolah', 'spp', 'kuliah', 'les', 'alat tulis'],
    };

    // Simulate batch processing delay
    setTimeout(() => {
      uncategorized.forEach(expense => {
        const desc = expense.description.toLowerCase();
        let foundCategory = 'Lainnya'; // Default

        for (const [category, keywords] of Object.entries(rules)) {
          if (keywords.some(kw => desc.includes(kw))) {
            foundCategory = category;
            break;
          }
        }
        categorizeExpense(expense.id, foundCategory);
      });
      setIsProcessingAI(false);
    }, 1500); // 1.5s AI processing delay simulation
  };

  const getIcon = (category) => {
    const icons = {
      'Makanan & Minuman': '🍽️',
      'Transportasi': '🚗',
      'Hiburan': '🎬',
      'Utilitas': '💡',
      'Kesehatan': '🏥',
      'Pendidikan': '📚',
      'Lainnya': '📦',
    };
    return icons[category] || '📦';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Makanan & Minuman': '#f97316',
      'Transportasi': '#3b82f6',
      'Hiburan': '#8b5cf6',
      'Utilitas': '#06b6d4',
      'Kesehatan': '#ec4899',
      'Pendidikan': '#14b8a6',
      'Lainnya': '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="categorization-container">
      <div className="categorization-header">
        <h1>🏷️ Kategorisasi Pengeluaran</h1>
        <p>Atur kategori untuk pengeluaran Anda</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${filterCategory === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          Semua ({expenses.length})
        </button>
        <button
          className={`tab ${filterCategory === 'uncategorized' ? 'active' : ''}`}
          onClick={() => setFilterCategory('uncategorized')}
        >
          Belum Dikategorisasi ({uncategorized.length})
        </button>
        <button
          className={`tab ${filterCategory === 'categorized' ? 'active' : ''}`}
          onClick={() => setFilterCategory('categorized')}
        >
          Sudah Dikategorisasi ({categorized.length})
        </button>
      </div>

      {/* Uncategorized Section */}
      {(filterCategory === 'all' || filterCategory === 'uncategorized') && uncategorized.length > 0 && (
        <div className="section">
          <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>⚠️ Belum Dikategorisasi</h2>
            <button 
              className="btn-ai-categorize"
              onClick={simulateNLPAutoCategorization}
              disabled={isProcessingAI}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', 
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', 
                color: 'white', border: 'none', padding: '8px 16px', 
                borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              {isProcessingAI ? <Loader className="spin" size={16} /> : <Sparkles size={16} />}
              {isProcessingAI ? 'AI Memproses...' : 'Auto Kategorisasi AI'}
            </button>
          </div>
          <div className="expense-list">
            {uncategorized.map(expense => (
              <div key={expense.id} className="expense-item pending">
                <div className="expense-info">
                  <div className="expense-main">
                    <span className="expense-description">{expense.description}</span>
                    <span className="expense-date">
                      {new Date(expense.date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="expense-amount">
                    Rp {expense.amount.toLocaleString('id-ID')}
                  </div>
                </div>

                {editingId === expense.id ? (
                  <div className="category-selector">
                    <select
                      value={selectedCategory[expense.id] || ''}
                      onChange={(e) =>
                        setSelectedCategory({
                          ...selectedCategory,
                          [expense.id]: e.target.value,
                        })
                      }
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {getIcon(cat)} {cat}
                        </option>
                      ))}
                    </select>

                    <button
                      className="btn-icon success"
                      onClick={() => handleCategorize(expense.id)}
                      title="Konfirmasi"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      className="btn-icon cancel"
                      onClick={() => setEditingId(null)}
                      title="Batal"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="expense-actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => {
                        setEditingId(expense.id);
                        setSelectedCategory({ ...selectedCategory, [expense.id]: '' });
                      }}
                      title="Kategorisasi"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => deleteExpense(expense.id)}
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categorized Section */}
      {(filterCategory === 'all' || filterCategory === 'categorized') && (
        <div className="section">
          <h2>✅ Sudah Dikategorisasi</h2>

          {categorized.length > 0 ? (
            <div>
              {categories.map(category => {
                const categoryExpenses = categorized.filter(exp => exp.category === category);
                if (categoryExpenses.length === 0) return null;

                return (
                  <div key={category} className="category-section">
                    <h3 style={{ color: getCategoryColor(category) }}>
                      {getIcon(category)} {category}
                    </h3>
                    <div className="expense-list">
                      {categoryExpenses.map(expense => (
                        <div key={expense.id} className="expense-item">
                          <div className="expense-info">
                            <div className="expense-main">
                              <span className="expense-description">
                                {expense.description}
                              </span>
                              <span className="expense-date">
                                {new Date(expense.date).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          </div>
                          <div className="expense-amount">
                            Rp {expense.amount.toLocaleString('id-ID')}
                          </div>
                          <div className="expense-actions">
                            <button
                              className="btn-icon delete"
                              onClick={() => deleteExpense(expense.id)}
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>Belum ada pengeluaran yang dikategorisasi</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {expenses.length === 0 && (
        <div className="empty-state full">
          <h3>📭 Belum Ada Pengeluaran</h3>
          <p>Mulai dengan menambahkan pengeluaran baru melalui pemindai struk atau input manual</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategorization;
