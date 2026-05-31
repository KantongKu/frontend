import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ExpenseProvider } from './context/ExpenseContext';
import Header from './components/Layout/Header';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import CategorizationPage from './pages/CategorizationPage';
import NewsDetailPage from './pages/NewsDetailPage';
import OnboardingPage from './pages/OnboardingPage';
import './styles/globals.css';
import './App.css';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isNoGlobalLayout = ['/', '/login', '/register', '/dashboard', '/onboarding'].includes(location.pathname) || location.pathname.startsWith('/news');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const TIMEOUT_IN_MS = 60 * 60 * 1000; // 1 hour (3600000 ms)
    let checkInterval;

    // Set initial last activity if not present
    if (!localStorage.getItem('last_activity')) {
      localStorage.setItem('last_activity', Date.now().toString());
    }

    const handleActivity = () => {
      const now = Date.now();
      const lastActivity = Number(localStorage.getItem('last_activity') || 0);
      
      // Throttle localStorage updates to at most once every 5 seconds for performance
      if (now - lastActivity > 5000) {
        localStorage.setItem('last_activity', now.toString());
      }
    };

    const logoutUser = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('activeUser');
      localStorage.removeItem('last_activity');
      clearInterval(checkInterval);
      alert('Sesi Anda telah berakhir karena tidak ada aktivitas selama 1 jam.');
      
      const isPublic = ['/', '/login', '/register'].includes(location.pathname) || location.pathname.startsWith('/news');
      if (!isPublic) {
        navigate('/login');
      } else {
        window.location.reload();
      }
    };

    const checkSession = () => {
      const now = Date.now();
      const lastActivity = Number(localStorage.getItem('last_activity') || now);
      if (now - lastActivity > TIMEOUT_IN_MS) {
        logoutUser();
        return true;
      }
      return false;
    };

    // Check immediately on mount/route change to prevent rendering dashboard if session expired
    const isLoggedOut = checkSession();
    if (isLoggedOut) return;

    // Attach event listeners to monitor global user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Periodically check if the user has been inactive for more than 1 hour
    checkInterval = setInterval(checkSession, 10000); // Check every 10 seconds

    return () => {
      // Cleanup listeners and intervals
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(checkInterval);
    };
  }, [navigate, location.pathname]);

  return (
    <div className={isNoGlobalLayout ? 'landing-wrapper' : 'app-layout'}>
      {!isNoGlobalLayout && <Header />}
      <main className={isNoGlobalLayout ? '' : 'app-content'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/categorization" element={<CategorizationPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
        </Routes>
      </main>
      {!isNoGlobalLayout && (
        <footer className="app-footer">
          <p>&copy; 2026 KantongKu - Smart Expense Tracker. Powered by DBS Foundation Coding Camp.</p>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </Router>
  );
}

export default App;
