import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Briefcase, DollarSign, Target, Wallet, ArrowRight, CheckCircle } from 'lucide-react';
import { walletService, transactionService } from '../services/api';
import './OnboardingPage.css';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    pocketName: 'Kantong Utama',
    initialBalance: ''
  });
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
              if (activeUser.name) {
                setFormData(prev => ({ ...prev, name: activeUser.name }));
              }
              setIsLoading(false);
            }
          })
          .catch(() => {
            if (activeUser.name) {
              setFormData(prev => ({ ...prev, name: activeUser.name }));
            }
            setIsLoading(false);
          });
      } else {
        if (activeUser.name) {
          setFormData(prev => ({ ...prev, name: activeUser.name }));
        }
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="dashboard-loading-overlay">
        <div className="loading-spinner-container">
          <div className="loading-spinner-circle"></div>
          <p className="loading-spinner-text">Memeriksa status onboarding...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = () => {
    // Sync any edits to the name back to activeUser and set user-specific onboarding flag
    const activeUserJson = localStorage.getItem('activeUser');
    let email = '';
    if (activeUserJson) {
      const activeUser = JSON.parse(activeUserJson);
      email = activeUser.email;
      activeUser.name = formData.name;
      localStorage.setItem('activeUser', JSON.stringify(activeUser));
      if (email) {
        localStorage.setItem(`onboarding_completed_${email}`, 'true');
      }
    }

    // Save onboarding pocket and balance configuration
    localStorage.setItem('onboarding_name', formData.name);
    localStorage.setItem('onboarding_pocket_name', formData.pocketName || 'Kantong Utama');
    localStorage.setItem('onboarding_initial_balance', formData.initialBalance || '0');
    localStorage.setItem('onboarding_completed', 'true');

    // Call Wallet Service to save pocket in backend
    walletService.create({
      name: formData.pocketName || 'Kantong Utama',
      balance: Number(formData.initialBalance || 0),
      budget_limit: Number(formData.initialBalance || 0),
      icon: 'Wallet',
      color: 'pocket-blue'
    })
    .then((createdWallet) => {
      // If they inputted an initial balance, let's create a transaction too!
      const initialBal = Number(formData.initialBalance || 0);
      if (initialBal > 0 && createdWallet && createdWallet.id) {
        return transactionService.create({
          wallet_id: createdWallet.id,
          amount: initialBal,
          type: 'income',
          description: 'Saldo Awal Onboarding',
          category: 'Pemasukan'
        });
      }
    })
    .then(() => {
      navigate('/dashboard');
    })
    .catch((err) => {
      console.error("Gagal membuat kantong utama di server:", err);
      // Fallback redirect so user is not stuck on error
      navigate('/dashboard');
    });
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
            {step === 2 && "Buat Kantong Pertama"}
          </h2>
          <p>
            {step === 1 && "Beri tahu kami nama lengkap Anda agar pengalaman KantongKu lebih personal."}
            {step === 2 && "Tentukan dompet atau kantong utama yang akan Anda pantau pengeluarannya."}
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
            </div>
          )}

          {step === 2 && (
            <div className="form-step slide-in">
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
