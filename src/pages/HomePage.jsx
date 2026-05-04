import React, { useState, useEffect } from 'react';
import { Bell, Plus, Send, ShoppingBag, Plane, PiggyBank, Utensils, Banknote, ShoppingCart, Home, Wallet, BarChart2, User, Heart, LogOut, Edit, Upload, Keyboard, Receipt, RefreshCw, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import './HomePage.css';
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
  const [pockets, setPockets] = useState(dummyPockets);
  const [activities, setActivities] = useState(dummyActivities);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  const newsItems = [
    {
      id: 1,
      title: 'IHSG Cetak Rekor Baru!',
      desc: 'Pasar saham Indonesia kembali menghijau hari ini didorong oleh sentimen positif global.',
      image: '/news-stocks.png',
      badge: 'SAHAM'
    },
    {
      id: 2,
      title: 'Harga Emas Antam Naik',
      desc: 'Harga emas terus melonjak menyusul ketidakpastian ekonomi makro. Waktunya investasi?',
      image: '/news-gold.png',
      badge: 'INVESTASI'
    },
    {
      id: 3,
      title: 'Tren Dompet Digital 2024',
      desc: 'Penggunaan transaksi non-tunai semakin mendominasi. Simak keuntungan dan tips amannya.',
      image: '/news-wallet.png',
      badge: 'FINTECH'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [newsItems.length]);

  const totalBalance = pockets.reduce((acc, pocket) => {
    const val = parseInt(pocket.amount.replace(/\D/g, ''), 10);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

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
      navigate('/');
    } else {
      setToastMessage(action);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleAddDummyPocket = (newPocketData) => {
    // Map the selected iconName to the actual Lucide component
    const iconMap = {
      PiggyBank, Wallet, Plane, Heart, Home
    };
    
    const newPocket = {
      id: Date.now(),
      title: newPocketData.title,
      amount: `Rp ${newPocketData.amount.toLocaleString('id-ID')}`,
      progress: 0,
      colorClass: 'pocket-green', // default color
      Icon: iconMap[newPocketData.iconName] || PiggyBank
    };
    
    setPockets([...pockets, newPocket]);
  };

  const handleAddTransaction = (data) => {
    // data = { type, amount, description, pocketId }
    
    // Update pocket balance
    const updatedPockets = pockets.map(p => {
      if (p.id === data.pocketId) {
        const currentAmount = parseInt(p.amount.replace(/\D/g, ''), 10);
        const newAmount = data.type === 'income' ? currentAmount + data.amount : currentAmount - data.amount;
        return { ...p, amount: `Rp ${newAmount.toLocaleString('id-ID')}` };
      }
      return p;
    });
    setPockets(updatedPockets);

    // Add activity
    const newActivity = {
      id: Date.now(),
      title: data.description,
      date: 'Baru saja',
      amount: `${data.type === 'income' ? '+' : '-'} Rp ${data.amount.toLocaleString('id-ID')}`,
      category: data.type === 'income' ? 'Income' : 'Expense',
      type: data.type,
      Icon: data.type === 'income' ? Banknote : ShoppingCart,
      iconClass: data.type === 'income' ? 'icon-green' : 'icon-red'
    };
    setActivities([newActivity, ...activities]);
    
    setShowAddTransaction(null);
    setToastMessage(`Berhasil mencatat ${data.type === 'income' ? 'pemasukan' : 'pengeluaran'}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="mobile-dashboard landing-page">
      {/* Background from Landing Page */}
      <div className="fixed-background">
        <div className="ambient-glow glow-tl"></div>
        <div className="ambient-glow glow-tr"></div>
        <div className="ambient-glow glow-bl"></div>
        <div className="ambient-glow glow-br"></div>
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
                <h2>Balance</h2>
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
                    <p>You've saved 20% more this month!</p>
                  </div>
                  <div className="health-chart">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path className="circle"
                        strokeDasharray="75, 100"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="21.35" className="percentage">75%</text>
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
                      <button className="promo-btn">Baca Selengkapnya</button>
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
