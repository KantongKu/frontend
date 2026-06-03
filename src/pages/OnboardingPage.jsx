import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Wallet, ArrowRight, CheckCircle, Sparkles, Cpu, Layers, Briefcase } from 'lucide-react';
import { walletService, transactionService, userService, formatRupiah } from '../services/api';
import { getAiPocketRecommendations } from '../services/ai';
import './OnboardingPage.css';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    monthlyIncome: '',
    profession: '',
    pocketName: 'Kantong Utama',
    initialBalance: ''
  });
  
  const [onboardingMode, setOnboardingMode] = useState('manual'); // 'manual' | 'ai'
  const [geminiKey, setGeminiKey] = useState('');
  const [aiPockets, setAiPockets] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load registered name on mount and protect route
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const activeUserJson = localStorage.getItem('activeUser');
    if (activeUserJson) {
      const activeUser = JSON.parse(activeUserJson);
      const email = activeUser.email;
      if (email) {
        const onboardingCompleted = localStorage.getItem(`onboarding_completed_${email}`) === 'true';
        if (onboardingCompleted) {
          navigate('/dashboard', { replace: true });
          return;
        }

        // Implicit check: if they already have wallets in database, they completed onboarding
        walletService.getAll()
          .then(fetchedPockets => {
            if (fetchedPockets.length > 0) {
              localStorage.setItem(`onboarding_completed_${email}`, 'true');
              navigate('/dashboard', { replace: true });
            } else {
              setFormData(prev => ({
                ...prev,
                name: activeUser.name || prev.name,
                monthlyIncome: activeUser.monthly_income !== undefined ? activeUser.monthly_income.toString() : (activeUser.monthlyIncome !== undefined ? activeUser.monthlyIncome.toString() : prev.monthlyIncome)
              }));
              setIsLoading(false);
            }
          })
          .catch(() => {
            setFormData(prev => ({
              ...prev,
              name: activeUser.name || prev.name,
              monthlyIncome: activeUser.monthly_income !== undefined ? activeUser.monthly_income.toString() : (activeUser.monthlyIncome !== undefined ? activeUser.monthlyIncome.toString() : prev.monthlyIncome)
            }));
            setIsLoading(false);
          });
      } else {
        setFormData(prev => ({
          ...prev,
          name: activeUser.name || prev.name,
          monthlyIncome: activeUser.monthly_income !== undefined ? activeUser.monthly_income.toString() : (activeUser.monthlyIncome !== undefined ? activeUser.monthlyIncome.toString() : prev.monthlyIncome)
        }));
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  if (isLoading || isActionLoading) {
    return (
      <div className="dashboard-loading-overlay">
        <div className="loading-spinner-container">
          <div className="loading-spinner-circle"></div>
          <p className="loading-spinner-text">
            {isActionLoading ? "Menyiapkan kantong pintar Anda..." : "Memeriksa status onboarding..."}
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < 2) {
      if (!formData.name.trim()) {
        alert('Nama lengkap wajib diisi');
        return;
      }
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSelectAiMode = () => {
    setOnboardingMode('ai');
    if (aiPockets.length === 0) {
      generateRecommendations('');
    }
  };

  const generateRecommendations = async (customKey) => {
    setIsAiLoading(true);
    try {
      const recs = await getAiPocketRecommendations(
        formData.monthlyIncome || '5000000',
        formData.profession,
        customKey
      );
      setAiPockets(recs);
    } catch (e) {
      console.error('Error generating AI pockets:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsActionLoading(true);
    
    // Sync any edits to the name back to activeUser and set user-specific onboarding flag
    const activeUserJson = localStorage.getItem('activeUser');
    let email = '';
    if (activeUserJson) {
      const activeUser = JSON.parse(activeUserJson);
      email = activeUser.email;
      activeUser.name = formData.name;
      activeUser.monthly_income = Number(formData.monthlyIncome || 0);
      localStorage.setItem('activeUser', JSON.stringify(activeUser));
      if (email) {
        localStorage.setItem(`onboarding_completed_${email}`, 'true');
      }
    }

    // Save onboarding details in local storage
    localStorage.setItem('onboarding_name', formData.name);
    localStorage.setItem('onboarding_completed', 'true');

    try {
      // Call User Service to update profile details in backend
      await userService.updateProfile({
        full_name: formData.name,
        monthly_income: Number(formData.monthlyIncome || 0)
      });

      if (onboardingMode === 'manual') {
        localStorage.setItem('onboarding_pocket_name', formData.pocketName || 'Kantong Utama');
        localStorage.setItem('onboarding_initial_balance', formData.initialBalance || '0');

        // Call Wallet Service to save pocket in backend
        const createdWallet = await walletService.create({
          name: formData.pocketName || 'Kantong Utama',
          budget_limit: Number(formData.initialBalance || 0),
          icon: 'Wallet',
          color: 'pocket-blue'
        });

        // If they inputted an initial balance, let's create a transaction too!
        const initialBal = Number(formData.initialBalance || 0);
        if (initialBal > 0 && createdWallet && createdWallet.id) {
          await transactionService.create({
            wallet_id: createdWallet.id,
            amount: initialBal,
            type: 'income',
            description: 'Saldo Awal Onboarding',
            category: 'Pemasukan'
          });
        }
      } else {
        // AI Mode: Create all recommended pockets in sequence
        const colors = ['pocket-blue', 'pocket-yellow', 'pocket-green', 'pocket-orange', 'pocket-purple'];
        const targetPockets = aiPockets.length > 0 ? aiPockets : [
          { name: 'Tabungan & Investasi', allocated_amount: Math.round(Number(formData.monthlyIncome || 0) * 0.2) },
          { name: 'Kebutuhan (Makan & Tagihan)', allocated_amount: Math.round(Number(formData.monthlyIncome || 0) * 0.5) },
          { name: 'Jajan & Hiburan', allocated_amount: Math.round(Number(formData.monthlyIncome || 0) * 0.2) },
          { name: 'Dana Cadangan', allocated_amount: Math.round(Number(formData.monthlyIncome || 0) * 0.1) }
        ];

        for (let i = 0; i < targetPockets.length; i++) {
          const pocket = targetPockets[i];
          const color = colors[i % colors.length];
          
          const createdWallet = await walletService.create({
            name: pocket.name,
            budget_limit: pocket.allocated_amount,
            icon: 'Wallet',
            color: color
          });
          
          if (createdWallet && createdWallet.id && pocket.allocated_amount > 0) {
            await transactionService.create({
              wallet_id: createdWallet.id,
              amount: pocket.allocated_amount,
              type: 'income',
              description: 'Saldo Awal (AI Onboarding)',
              category: 'Pemasukan'
            });
          }
        }
      }

      navigate('/dashboard');
    } catch (err) {
      console.error("Gagal memproses pembuatan kantong onboarding:", err);
      // Fallback redirect so user is not stuck on error
      navigate('/dashboard');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      {/* Background Ambience */}
      <div className="fixed-background">
        <div className="bg-glow bg-glow-tl"></div>
        <div className="bg-glow bg-glow-tr"></div>
        <div className="bg-glow bg-glow-bl"></div>
      </div>

      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>
          <h2>
            {step === 1 && "Halo! Mari Kenalan"}
            {step === 2 && "Setup Kantong Keuangan"}
          </h2>
          <p>
            {step === 1 && "Beri tahu kami nama lengkap Anda agar pengalaman KantongKu lebih personal."}
            {step === 2 && "Pilih metode pembagian kantong untuk memantau pengeluaran Anda."}
          </p>
        </div>

        <div className="onboarding-form-glass">
          {step === 1 && (
            <div className="form-step slide-in">
              <div className="input-group">
                <label>Nama Lengkap</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Contoh: Budi Santoso" 
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Pemasukan Bulanan / Gaji</label>
                <div className="input-wrapper">
                  <span className="currency-prefix">Rp</span>
                  <input 
                    type="number" 
                    name="monthlyIncome"
                    placeholder="0" 
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                    className="with-prefix"
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Status / Pekerjaan Saat Ini</label>
                <div className="input-wrapper">
                  <Briefcase size={20} className="input-icon" />
                  <input 
                    type="text" 
                    name="profession"
                    placeholder="Contoh: Software Engineer, Mahasiswa, Driver Ojek Online" 
                    value={formData.profession}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step slide-in">
              {/* Method Selector */}
              <div className="onboarding-mode-selector">
                <button 
                  type="button"
                  className={`mode-card ${onboardingMode === 'manual' ? 'active' : ''}`}
                  onClick={() => setOnboardingMode('manual')}
                >
                  <Wallet size={24} className="mode-icon" />
                  <div className="mode-text">
                    <h4>Setup Manual</h4>
                    <p>Buat satu kantong utama & atur saldo sendiri</p>
                  </div>
                </button>
                
                <button 
                  type="button"
                  className={`mode-card ${onboardingMode === 'ai' ? 'active' : ''}`}
                  onClick={handleSelectAiMode}
                >
                  <Sparkles size={24} className="mode-icon ai-sparkle-icon" />
                  <div className="mode-text">
                    <h4>Rekomendasi Pintar (AI)</h4>
                    <p>Bagi alokasi gaji bulanan otomatis</p>
                  </div>
                </button>
              </div>

              {/* Manual Mode Layout */}
              {onboardingMode === 'manual' && (
                <div className="manual-config-section fade-in">
                  <div className="pocket-preview">
                    <div className="pocket-preview-icon">
                      <Wallet size={32} color="white" />
                    </div>
                    <h3>{formData.pocketName || "Kantong Utama"}</h3>
                  </div>
                  
                  <div className="input-group">
                    <label>Nama Kantong</label>
                    <div className="input-wrapper">
                      <Wallet size={20} className="input-icon" />
                      <input 
                        type="text" 
                        name="pocketName"
                        value={formData.pocketName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Saldo Saat Ini</label>
                    <div className="input-wrapper">
                      <span className="currency-prefix">Rp</span>
                      <input 
                        type="number" 
                        name="initialBalance"
                        placeholder="0" 
                        value={formData.initialBalance}
                        onChange={handleChange}
                        className="with-prefix"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AI Mode Layout */}
              {onboardingMode === 'ai' && (
                <div className="ai-config-section fade-in">
                  {isAiLoading ? (
                    <div className="ai-loading-container">
                      <div className="loading-spinner-circle"></div>
                      <p>Menganalisis pendapatan & merancang anggaran terbaik...</p>
                    </div>
                  ) : (
                    aiPockets.length > 0 && (
                      <div className="ai-table-container slide-in">
                        <h4>Saran Pembagian Kantong</h4>
                        <div className="ai-table-responsive">
                          <table className="ai-pockets-table">
                            <thead>
                              <tr>
                                <th>Nama Kantong</th>
                                <th>Persentase</th>
                                <th>Alokasi Dana</th>
                              </tr>
                            </thead>
                            <tbody>
                              {aiPockets.map((pocket, index) => (
                                <tr key={index}>
                                  <td className="pocket-name-cell">
                                    <div className="table-pocket-tag"></div>
                                    {pocket.name}
                                  </td>
                                  <td className="pocket-pct-cell">{pocket.percentage}%</td>
                                  <td>{formatRupiah(pocket.allocated_amount)}</td>
                                </tr>
                              ))}
                              <tr className="table-total-row">
                                <td>TOTAL</td>
                                <td>100%</td>
                                <td>{formatRupiah(Number(formData.monthlyIncome || 0))}</td>
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          <div className="onboarding-actions">
            {step > 1 && (
              <button className="btn-back" onClick={() => setStep(step - 1)}>
                Kembali
              </button>
            )}
            <button className="btn-next" onClick={handleNext}>
              {step === 2 ? (
                <>Selesai & Mulai <CheckCircle size={18} /></>
              ) : (
                <>Lanjut <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

