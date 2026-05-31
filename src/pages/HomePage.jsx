import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Send, ShoppingBag, Plane, PiggyBank, Utensils, Banknote, ShoppingCart, Home, Wallet, BarChart2, User, Heart, LogOut, Edit, Upload, Keyboard, Receipt, RefreshCw, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import './HomePage.css';
import './LandingPage.css'; // For background styles
import MobileScannerOverlay from '../components/Scanner/MobileScannerOverlay';
import CreatePocketOverlay from '../components/Dashboard/CreatePocketOverlay';
import PocketsList from '../components/Dashboard/PocketsList';
import PocketDetail from '../components/Dashboard/PocketDetail';
import AnalyticsView from '../components/Dashboard/AnalyticsView';
import ProfileView from '../components/Dashboard/ProfileView';
import EditProfileView from '../components/Dashboard/EditProfileView';
import OcrArchiveView from '../components/Dashboard/OcrArchiveView';
import NotificationView from '../components/Dashboard/NotificationView';
import AddTransactionOverlay from '../components/Dashboard/AddTransactionOverlay';
import ExpenseCategorization from '../components/Categorization/ExpenseCategorization';
import { useNavigate } from 'react-router-dom';
import { newsItems } from '../data/newsData';
import { walletService, transactionService } from '../services/api';

const dummyPockets = [
  { id: 1, title: 'Daily Needs', amount: 'Rp 8.200.000', progress: 70, colorClass: 'pocket-blue', Icon: ShoppingBag },
  { id: 2, title: 'Vacation', amount: 'Rp 8.200.000', progress: 40, colorClass: 'pocket-yellow', Icon: Plane },
  { id: 3, title: 'Emergency', amount: 'Rp 8.200.000', progress: 60, colorClass: 'pocket-green', Icon: PiggyBank },
];

const dummyActivities = [
  { id: 1, title: 'Union Deli', date: 'Today, 12:45 PM', amount: '- RP 450.000', category: 'Dining', type: 'expense', Icon: Utensils, iconClass: 'icon-blue' },
  { id: 2, title: 'Salary Deposit', date: 'Yesterday, 09:45 PM', amount: '+ Rp 12.000.000', category: 'income', type: 'income', Icon: Banknote, iconClass: 'icon-yellow' },
  { id: 3, title: 'Apple Store', date: 'Oct 24, 04:45 PM', amount: '- RP 450.000', category: 'Electronic', type: 'expense', Icon: ShoppingCart, iconClass: 'icon-white' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'pockets', 'pocket-detail'
  const [selectedPocket, setSelectedPocket] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showCreatePocket, setShowCreatePocket] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(null);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [pockets, setPockets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [userName, setUserName] = useState('Budi Santoso');

  const fetchDashboardData = useCallback(() => {
    walletService.getAll()
    .then((fetchedPockets) => {
      // Fetch transactions for each individual wallet
      const txPromises = fetchedPockets.map(pocket =>
        transactionService.getAll(pocket.id)
          .catch(err => {
            console.error(`Gagal mengambil transaksi untuk dompet ${pocket.id}:`, err);
            return [];
          })
      );

      return Promise.all(txPromises)
      .then((txResults) => {
        // Flatten transactions from all pockets
        let fetchedTx = txResults.flat();

        // Synthesize virtual "Saldo Awal" transactions for pockets that have a balance but no starting transaction
        fetchedPockets.forEach(pocket => {
          const initialBal = Number(pocket.balance || 0);
          const hasStartingTx = fetchedTx.some(tx => 
            Number(tx.wallet_id || tx.walletId) === Number(pocket.id) && 
            tx.title.toLowerCase().includes('saldo awal')
          );
          if (initialBal > 0 && !hasStartingTx) {
            let dateStr = 'Baru saja';
            const dateVal = pocket.createdAt;
            if (dateVal) {
              const d = new Date(dateVal);
              if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              }
            }
            fetchedTx.push({
              id: `virtual-${pocket.id}`,
              wallet_id: pocket.id,
              title: `Saldo Awal ${pocket.title}`,
              date: dateStr,
              amount: `+ Rp ${initialBal.toLocaleString('id-ID')}`,
              amountVal: initialBal,
              category: 'Pemasukan',
              type: 'income',
              Icon: Banknote,
              iconClass: 'icon-green',
              dateRaw: dateVal || new Date().toISOString()
            });
          }
        });

        // Sort transactions globally by dateRaw in descending order (newest first)
        fetchedTx.sort((a, b) => new Date(b.dateRaw) - new Date(a.dateRaw));

        // Calculate sisa saldo and usage progress in real-time from transactions
        const updatedPockets = fetchedPockets.map(pocket => {
          const pocketTx = fetchedTx.filter(tx => Number(tx.wallet_id || tx.walletId) === Number(pocket.id));
          
          // Sum incomes (excluding initial onboarding/virtual starting transactions to avoid double counting starting balance)
          const totalIncome = pocketTx
            .filter(tx => tx.type === 'income' && !tx.title.toLowerCase().includes('saldo awal'))
            .reduce((sum, tx) => sum + (tx.amountVal || 0), 0);
            
          // Sum expenses
          const totalExpense = pocketTx
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + (tx.amountVal || 0), 0);
            
          const initialBudget = Number(pocket.balance || 0);
          const currentBalance = initialBudget + totalIncome - totalExpense;
          
          // Progress based on expenses vs initial budget limit
          const progress = initialBudget > 0 
            ? Math.min(Math.round((totalExpense / initialBudget) * 100), 100) 
            : 0;
            
          return {
            ...pocket,
            balance: currentBalance,
            amount: `Rp ${currentBalance.toLocaleString('id-ID')}`,
            progress
          };
        });

        setPockets(updatedPockets);
        setActivities(fetchedTx);

        // Update selectedPocket state if active to trigger real-time updates inside PocketDetail
        setSelectedPocket(prev => {
          if (!prev) return null;
          const freshSelected = updatedPockets.find(p => p.id === prev.id);
          return freshSelected || prev;
        });
      });
    })
    .catch(err => {
      console.error("Gagal mengambil data dashboard:", err);
    });
  }, []);

  // Load dynamic session and onboarding pocket on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const activeUserJson = localStorage.getItem('activeUser');
    let email = '';
    if (activeUserJson) {
      const activeUser = JSON.parse(activeUserJson);
      email = activeUser.email;
      if (activeUser.name) {
        setUserName(activeUser.name);
      }
    }

    // Check if onboarding completed for this user.
    // If not completed, check if they already have wallets in database.
    const onboardingCompleted = localStorage.getItem(`onboarding_completed_${email}`) === 'true';
    if (!onboardingCompleted) {
      walletService.getAll()
        .then(fetchedPockets => {
          if (fetchedPockets.length > 0) {
            // Implicitly completed!
            localStorage.setItem(`onboarding_completed_${email}`, 'true');
            setPockets(fetchedPockets);
            fetchDashboardData();
          } else {
            // Truly not completed. Redirect to onboarding!
            navigate('/onboarding', { replace: true });
          }
        })
        .catch(err => {
          console.error("Gagal memeriksa status onboarding:", err);
          // If API fails, fallback to onboarding page to be safe
          navigate('/onboarding', { replace: true });
        });
    } else {
      fetchDashboardData();
    }
  }, [fetchDashboardData, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [newsItems.length]);

  const totalBalance = pockets.reduce((acc, pocket) => {
    return acc + (pocket.balance || 0);
  }, 0);

  // Calculate dynamic financial health based on income and expenses
  const totalIncome = activities
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + (tx.amountVal || 0), 0);

  const totalExpense = activities
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + (tx.amountVal || 0), 0);

  const healthScore = totalIncome > 0
    ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)))
    : 75; // Fallback to 75% if no income yet

  let healthMessage = "Keuangan Anda seimbang. Mulai mencatat pengeluaran Anda!";
  if (totalIncome > 0) {
    if (healthScore >= 90) {
      healthMessage = "Luar biasa! Pengeluaran Anda sangat minim dibanding pemasukan.";
    } else if (healthScore >= 75) {
      healthMessage = "Keuangan Anda sehat! Tabungan bulanan berjalan optimal.";
    } else if (healthScore >= 50) {
      healthMessage = "Kondisi stabil. Harap perhatikan pos pengeluaran sekunder Anda.";
    } else if (healthScore >= 30) {
      healthMessage = "Kondisi agak ketat. Kurangi pengeluaran non-esensial!";
    } else {
      healthMessage = "Waspada! Pengeluaran bulanan hampir melebihi pemasukan Anda.";
    }
  }

  const handleProfileAction = (action) => {
    if (action === 'ai-budgeting') {
      setShowCreatePocket(true);
    } else if (action === 'nlp-categorization') {
      setCurrentView('nlp-categorization');
    } else if (action === 'ocr-archive') {
      setCurrentView('ocr-archive');
    } else if (action === 'edit-profile') {
      setCurrentView('edit-profile');
    } else if (action === 'logout' || action === 'back-to-landing') {
      localStorage.removeItem('token');
      localStorage.removeItem('activeUser');
      localStorage.removeItem('last_activity');
      navigate('/');
    } else {
      setToastMessage(action);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleAddDummyPocket = (newPocketData) => {
    walletService.create({
      name: newPocketData.title,
      balance: Number(newPocketData.amount || 0),
      icon: newPocketData.iconName || 'PiggyBank',
      color: newPocketData.colorClass || 'pocket-green'
    })
    .then((createdWallet) => {
      const initialBal = Number(newPocketData.amount || 0);
      if (initialBal > 0 && createdWallet && createdWallet.id) {
        return transactionService.create({
          wallet_id: createdWallet.id,
          amount: initialBal,
          type: 'income',
          description: `Saldo Awal ${createdWallet.title}`,
          category: 'Pemasukan'
        });
      }
    })
    .then(() => {
      fetchDashboardData();
      setToastMessage('Berhasil membuat Kantong Anggaran Baru!');
      setTimeout(() => setToastMessage(null), 3000);
    })
    .catch(err => {
      console.error("Gagal membuat kantong anggaran:", err);
      alert("Gagal membuat kantong anggaran di server.");
    });
  };

  const handleAddTransaction = (data) => {
    // data = { type, amount, description, pocketId, transactionDate }
    transactionService.create({
      wallet_id: data.pocketId,
      amount: Number(data.amount),
      type: data.type || 'expense',
      description: data.description,
      category: data.type === 'income' ? 'Income' : 'Lainnya',
      transaction_date: data.transactionDate
    })
    .then(() => {
      fetchDashboardData();
      setShowAddTransaction(null);
      setToastMessage(`Berhasil mencatat ${data.type === 'income' ? 'pemasukan' : 'pengeluaran'}`);
      setTimeout(() => setToastMessage(null), 3000);
    })
    .catch(err => {
      console.error("Gagal menambahkan transaksi:", err);
      alert("Gagal menambahkan transaksi di server.");
    });
  };

  return (
    <div className="mobile-dashboard landing-page">
      {/* Background from Landing Page */}
      <div className="fixed-background">
        <div className="bg-glow bg-glow-tl"></div>
        <div className="bg-glow bg-glow-tr"></div>
        <div className="bg-glow bg-glow-bl"></div>
        <div className="bg-glow bg-glow-br"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div 
          className="sidebar-brand" 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer' }}
          title="Kembali ke Landing Page"
        >
          <span>Kantongku</span>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            <Home size={22} />
            <span>Dashboard</span>
          </button>
          <button className={`sidebar-item ${currentView === 'pockets' || currentView === 'pocket-detail' ? 'active' : ''}`} onClick={() => setCurrentView('pockets')}>
            <Wallet size={22} />
            <span>Budget Pockets</span>
          </button>
          <button className={`sidebar-item ${currentView === 'chart' ? 'active' : ''}`} onClick={() => setCurrentView('chart')}>
            <BarChart2 size={22} />
            <span>Analytics</span>
          </button>
          <button className={`sidebar-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => setCurrentView('profile')}>
            <User size={22} />
            <span>Profile</span>
          </button>
        </nav>
      </aside>

      <div className="mobile-container desktop-content-area">
        {currentView === 'dashboard' && (
          <div className="dashboard-layout">
            {/* Header */}
            <header className="dash-header">
              <div className="dash-user">
                <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="profile-pic" />
                <div>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Halo, {userName.split(' ')[0]}</span>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Balance</h2>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="dash-btn-icon" onClick={() => navigate('/')} title="Kembali ke Landing Page">
                  <ChevronLeft size={24} color="white" />
                </button>
                <button className="dash-btn-icon" onClick={() => setCurrentView('notifications')}>
                  <Bell size={24} fill="white" />
                </button>
              </div>
            </header>

            <div className="dashboard-grid-layout">
              {/* Left Column */}
              <div className="dashboard-col-left">
                {/* Balance Card */}
                <div className="balance-card">
                  <p className="balance-label">TOTAL SALDO (SEMUA KANTONG)</p>
                  <h1 className="balance-amount">Rp {totalBalance.toLocaleString('id-ID')}</h1>
                  <div className="balance-actions">
                    <button className="action-btn topup-btn" onClick={() => setShowAddTransaction('income')}>
                      <Banknote size={18} />
                      Pemasukan
                    </button>
                    <button className="action-btn transfer-btn" onClick={() => setShowAddTransaction('expense')}>
                      <ShoppingCart size={18} />
                      Pengeluaran
                    </button>
                  </div>
                </div>

                {/* Budget Pockets */}
                <div className="section-header-dash">
                  <h3>Budget Pockets</h3>
                  <button className="view-all-btn" onClick={() => setCurrentView('pockets')}>View All</button>
                </div>
                <div className="pockets-grid">
                  {pockets.map(pocket => (
                    <div 
                      key={pocket.id} 
                      className={`pocket-card ${pocket.colorClass}`} 
                      onClick={() => {
                        setSelectedPocket(pocket);
                        setCurrentView('pocket-detail');
                      }}
                    >
                      <div className="pocket-icon-wrapper">
                        <pocket.Icon size={20} />
                      </div>
                      <h4>{pocket.title}</h4>
                      <p>{pocket.amount}</p>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${pocket.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                  <button className="pocket-card pocket-new" onClick={() => setShowCreatePocket(true)}>
                    <div className="pocket-new-icon">
                      <Plus size={24} color="black" />
                    </div>
                    <p>New Pocket</p>
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="dashboard-col-right">
                {/* Financial Health Card */}
                <div className="health-card">
                  <div className="health-info">
                    <h3>Financial Health</h3>
                    <p>{healthMessage}</p>
                  </div>
                  <div className="health-chart">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path className="circle"
                        strokeDasharray={`${healthScore}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="21.35" className="percentage">{healthScore}%</text>
                    </svg>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="section-header-dash">
                  <h3>Recent Activity</h3>
                </div>
                <div className="activity-list">
                  {activities.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon ${activity.iconClass}`}>
                        <activity.Icon size={20} />
                      </div>
                      <div className="activity-details">
                        <h4>{activity.title}</h4>
                        <p>{activity.date}</p>
                      </div>
                      <div className="activity-amount-box">
                        <h4 className={activity.type === 'expense' ? 'text-red' : 'text-blue'}>
                          {activity.amount}
                        </h4>
                        <p>{activity.category}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* News Carousel */}
                <div className="news-carousel-wrapper">
                  <div className="section-header-dash mb-2">
                    <h3>Berita Keuangan</h3>
                  </div>
                  
                  <div className="promo-card glass-card">
                    <div className="promo-image-container">
                      <img 
                        src={newsItems[currentNewsIndex].image} 
                        alt={newsItems[currentNewsIndex].title} 
                        className="promo-image fade-transition" 
                        key={`img-${currentNewsIndex}`} 
                      />
                      <div className="promo-badge-overlay">{newsItems[currentNewsIndex].badge}</div>
                    </div>
                    <div className="promo-content fade-transition" key={`content-${currentNewsIndex}`}>
                      <h3>{newsItems[currentNewsIndex].title}</h3>
                      <p>{newsItems[currentNewsIndex].desc}</p>
                      <button className="promo-btn" onClick={() => navigate(`/news/${newsItems[currentNewsIndex].id}`)}>Baca Selengkapnya</button>
                    </div>
                  </div>
                  
                  <div className="carousel-indicators">
                    {newsItems.map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`indicator-dot ${idx === currentNewsIndex ? 'active' : ''}`}
                        onClick={() => setCurrentNewsIndex(idx)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'pockets' && (
          <PocketsList 
            pockets={pockets}
            onBack={() => setCurrentView('dashboard')}
            onPocketClick={(pocket) => {
              setSelectedPocket(pocket);
              setCurrentView('pocket-detail');
            }}
            onCreatePocket={() => setShowCreatePocket(true)}
          />
        )}

        {currentView === 'pocket-detail' && (
          <PocketDetail 
            pocket={selectedPocket}
            onBack={() => setCurrentView('pockets')}
            onRefresh={fetchDashboardData}
          />
        )}

        {currentView === 'chart' && (
          <AnalyticsView 
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationView 
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView 
            onBack={() => setCurrentView('dashboard')}
            onAction={handleProfileAction}
          />
        )}

        {currentView === 'nlp-categorization' && (
          <div style={{ height: '100%', overflowY: 'auto', background: '#0a0514' }}>
            <div style={{ padding: '24px 24px 0 24px' }}>
              <button onClick={() => setCurrentView('profile')} style={{ background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}>
                <ChevronLeft size={24} />
                <span style={{ fontSize: '16px', fontWeight: '600', marginLeft: '4px' }}>Kembali</span>
              </button>
            </div>
            <ExpenseCategorization />
          </div>
        )}

        {currentView === 'edit-profile' && (
          <EditProfileView 
            onBack={() => setCurrentView('profile')}
            onSave={(msg) => {
              setCurrentView('profile');
              setToastMessage(msg);
              setTimeout(() => setToastMessage(null), 3000);
            }}
          />
        )}

        {currentView === 'ocr-archive' && (
          <OcrArchiveView 
            onBack={() => setCurrentView('profile')}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      {currentView !== 'notifications' && (
        <div className="bottom-nav-container">
          <nav className="bottom-nav">
            <button className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
              <div className="nav-icon-wrapper">
                <Home size={22} />
              </div>
              <span>Home</span>
            </button>
            <button className={`nav-item ${currentView === 'pockets' || currentView === 'pocket-detail' ? 'active' : ''}`} onClick={() => setCurrentView('pockets')}>
              <div className="nav-icon-wrapper">
                <Wallet size={22} />
              </div>
              <span>Pocket</span>
            </button>
            
            <div className="nav-item-center">
              <button className={`center-fab ${showFabMenu ? 'active' : ''}`} onClick={() => setShowFabMenu(!showFabMenu)}>
                <Plus size={28} style={{ transform: showFabMenu ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              
              {showFabMenu && (
                <>
                  <div className="fab-menu-overlay" onClick={() => setShowFabMenu(false)}></div>
                  <div className="fab-menu">
                    <button className="fab-menu-item" onClick={() => { setShowFabMenu(false); setShowAddTransaction('expense'); }}>
                      <Edit size={18} />
                      <span>Manual</span>
                    </button>
                    <button className="fab-menu-item" onClick={() => { setShowFabMenu(false); setShowScanner(true); }}>
                      <Upload size={18} />
                      <span>Unggah</span>
                    </button>
                    <button className="fab-menu-item" onClick={() => { setShowFabMenu(false); alert('Fitur Input teks segera hadir!'); }}>
                      <Keyboard size={18} />
                      <span>Input teks</span>
                    </button>
                    <button className="fab-menu-item" onClick={() => { setShowFabMenu(false); alert('Fitur Bagi Tagihan segera hadir!'); }}>
                      <Receipt size={18} />
                      <span>Bagi Tagihan</span>
                    </button>
                    <button className="fab-menu-item" onClick={() => { setShowFabMenu(false); setShowAddTransaction('expense'); }}>
                      <RefreshCw size={18} />
                      <span>Transfer</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <button className={`nav-item ${currentView === 'chart' ? 'active' : ''}`} onClick={() => setCurrentView('chart')}>
              <div className="nav-icon-wrapper">
                <BarChart2 size={22} />
              </div>
              <span>Chart</span>
            </button>
            <button className={`nav-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => setCurrentView('profile')}>
              <div className="nav-icon-wrapper">
                <User size={22} />
              </div>
              <span>Profile</span>
            </button>
          </nav>
        </div>
      )}

      {showScanner && <MobileScannerOverlay onClose={() => setShowScanner(false)} />}
      {showCreatePocket && (
        <CreatePocketOverlay 
          onClose={() => setShowCreatePocket(false)} 
          onAddDummyPocket={handleAddDummyPocket}
        />
      )}
      {showAddTransaction && (
        <AddTransactionOverlay 
          type={showAddTransaction}
          pockets={pockets}
          onClose={() => setShowAddTransaction(null)}
          onSubmit={handleAddTransaction}
        />
      )}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default HomePage;
