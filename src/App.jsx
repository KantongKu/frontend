import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
  const isNoGlobalLayout = ['/', '/login', '/register', '/dashboard', '/onboarding'].includes(location.pathname) || location.pathname.startsWith('/news');

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
