import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';
import './AuthPage.css';
import './LandingPage.css'; // Reuse background animations from landing page

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect starting state from URL path
  const isRegisterPath = location.pathname === '/register';
  const [isRegister, setIsRegister] = useState(isRegisterPath);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(() => !!localStorage.getItem('token'));

  // If already logged in, redirect user directly to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="dashboard-loading-overlay">
        <div className="loading-spinner-container">
          <div className="loading-spinner-circle"></div>
          <p className="loading-spinner-text">Menghubungkan ke akun Anda...</p>
        </div>
      </div>
    );
  }

  // Sync state if URL changes
  useEffect(() => {
    setIsRegister(location.pathname === '/register');
    setError('');
    setSuccess('');
  }, [location.pathname]);

  // Prefill email if there's a last registered user
  useEffect(() => {
    if (!isRegister) {
      const lastEmail = localStorage.getItem('lastRegisteredEmail');
      if (lastEmail) {
        setEmail(lastEmail);
      }
    }
  }, [isRegister]);

  const handleBack = () => {
    navigate('/');
  };

  const handleToggleMode = (registerMode) => {
    setIsRegister(registerMode);
    setError('');
    setSuccess('');
    // Update path silently or just update internal state for smooth transition
    navigate(registerMode ? '/register' : '/login', { replace: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic Validations
    if (!email || !password) {
      setError('Harap isi semua kolom wajib.');
      return;
    }

    if (isRegister) {
      if (!name) {
        setError('Harap masukkan nama lengkap Anda.');
        return;
      }
      if (password.length < 6) {
        setError('Password minimal harus 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak cocok.');
        return;
      }

      setLoading(true);
      authService.register(name, email, password)
        .then((res) => {
          setSuccess('Pendaftaran berhasil! Menyiapkan onboarding Anda...');
          return authService.login(email, password);
        })
        .then((loginRes) => {
          const data = loginRes.data || loginRes;
          const userObj = data.user || {};
          const user = {
            ...userObj,
            name: name,
            full_name: name,
            email: email,
            monthly_income: userObj.monthly_income !== undefined ? userObj.monthly_income : '0'
          };
          localStorage.setItem('activeUser', JSON.stringify(user));
          localStorage.setItem(`onboarding_completed_${email}`, 'false');
          localStorage.setItem('last_activity', Date.now().toString());
          setLoading(false);
          navigate('/onboarding', { replace: true });
        })
        .catch((err) => {
          setLoading(false);
          const message = err.response?.data?.message || err.response?.data?.error || 'Pendaftaran gagal. Silakan coba lagi.';
          setError(message);
        });

    } else {
      // Login flow
      setLoading(true);
      authService.login(email, password)
        .then((res) => {
          const data = res.data || res;
          const userObj = data.user || {};
          const fullName = userObj.full_name || userObj.name;

          const emailPrefix = email.split('@')[0];
          const nameFromEmail = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          const finalName = fullName || nameFromEmail;

          const user = {
            ...userObj,
            name: finalName,
            full_name: fullName || finalName,
            email: userObj.email || email,
            monthly_income: userObj.monthly_income !== undefined ? userObj.monthly_income : '0'
          };
          localStorage.setItem('activeUser', JSON.stringify(user));
          localStorage.setItem('last_activity', Date.now().toString());
          setLoading(false);
          proceedToNextScreen(email);
        })
        .catch((err) => {
          setLoading(false);
          const message = err.response?.data?.message || err.response?.data?.error || 'Email atau password salah.';
          setError(message);
        });
    }
  };

  const proceedToNextScreen = (userEmail) => {
    const onboardingCompleted = localStorage.getItem(`onboarding_completed_${userEmail}`) === 'true';
    if (onboardingCompleted) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="auth-page landing-page">
      <button onClick={handleBack} className="auth-back-btn">
        <ArrowLeft size={20} />
        <span>Kembali ke Beranda</span>
      </button>

      {/* Fixed Ambient Background reused from Landing Page */}
      <div className="fixed-background">
        <div className="bg-glow bg-glow-tl"></div>
        <div className="bg-glow bg-glow-tr"></div>
        <div className="bg-glow bg-glow-bl"></div>
        <div className="bg-glow bg-glow-br"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      <div className="auth-card-container">
        <div className="auth-card glass-panel">
          <div className="auth-header">
            <h1 className="auth-brand">KantongKu</h1>
            <p className="auth-tagline">SMART & SECURE DIGITAL WEALTH</p>
          </div>

          {/* Tab Selection */}
          <div className="auth-tabs">
            <button 
              className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
              onClick={() => handleToggleMode(false)}
            >
              Masuk
            </button>
            <button 
              className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
              onClick={() => handleToggleMode(true)}
            >
              Daftar
            </button>
          </div>

          <form key={isRegister ? 'register' : 'login'} onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-alert auth-alert-error slide-up">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-alert auth-alert-success slide-up">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            {isRegister && (
              <div className="auth-form-group slide-up">
                <label>Nama Lengkap</label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-input-icon" />
                  <input 
                    type="text" 
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            <div className="auth-form-group slide-up">
              <label>Email</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group slide-up">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  className="auth-input-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="auth-form-group slide-up">
                <label>Konfirmasi Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={isRegister}
                  />
                  <button 
                    type="button"
                    className="auth-input-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className={`auth-submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                isRegister ? "Daftar Akun Baru" : "Masuk ke Akun"
              )}
            </button>
          </form>

          <div className="auth-footer">
            {!isRegister ? (
              <p>
                Belum memiliki akun?{' '}
                <button 
                  type="button" 
                  className="auth-link-btn"
                  onClick={() => handleToggleMode(true)}
                >
                  Daftar di sini
                </button>
              </p>
            ) : (
              <p>
                Sudah memiliki akun?{' '}
                <button 
                  type="button" 
                  className="auth-link-btn"
                  onClick={() => handleToggleMode(false)}
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
