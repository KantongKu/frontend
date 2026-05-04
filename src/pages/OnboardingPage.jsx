import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Briefcase, DollarSign, Target, Wallet, ArrowRight, CheckCircle } from 'lucide-react';
import './OnboardingPage.css';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    occupation: '',
    income: '',
    targetSavings: '',
    pocketName: 'Kantong Utama',
    initialBalance: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = () => {
    // In a real app, save to backend here
    navigate('/dashboard');
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
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
          <h2>
            {step === 1 && "Halo! Mari Kenalan"}
            {step === 2 && "Profil Keuangan Anda"}
            {step === 3 && "Buat Kantong Pertama"}
          </h2>
          <p>
            {step === 1 && "Beri tahu kami sedikit tentang diri Anda agar pengalaman KantongKu lebih personal."}
            {step === 2 && "Bantu AI kami memberikan rekomendasi anggaran yang tepat untuk Anda."}
            {step === 3 && "Tentukan dompet atau kantong utama yang akan Anda pantau pengeluarannya."}
          </p>
        </div>

        <div className="onboarding-form-glass">
          {step === 1 && (
            <div className="form-step slide-in">
              <div className="input-group">
                <label>Nama Panggilan</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Contoh: Budi" 
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Umur</label>
                  <div className="input-wrapper">
                    <Calendar size={20} className="input-icon" />
                    <input 
                      type="number" 
                      name="age"
                      placeholder="Umur Anda" 
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Pekerjaan</label>
                  <div className="input-wrapper">
                    <Briefcase size={20} className="input-icon" />
                    <input 
                      type="text" 
                      name="occupation"
                      placeholder="Mahasiswa/Karyawan" 
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step slide-in">
              <div className="input-group">
                <label>Estimasi Pendapatan Bulanan</label>
                <div className="input-wrapper">
                  <DollarSign size={20} className="input-icon" />
                  <input 
                    type="number" 
                    name="income"
                    placeholder="Rp 0" 
                    value={formData.income}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Target Tabungan Bulanan</label>
                <div className="input-wrapper">
                  <Target size={20} className="input-icon" />
                  <input 
                    type="number" 
                    name="targetSavings"
                    placeholder="Rp 0" 
                    value={formData.targetSavings}
                    onChange={handleChange}
                  />
                </div>
                <small className="input-hint">Idealnya 20% dari pendapatan Anda.</small>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step slide-in">
              <div className="pocket-preview">
                <div className="pocket-preview-icon">
                  <Wallet size={32} color="white" />
                </div>
                <h3>Kantong Utama</h3>
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
              {step === 3 ? (
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
