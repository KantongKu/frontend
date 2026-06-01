import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet, LineChart, Cpu, Sparkles, Menu, X } from 'lucide-react';
import { newsItems } from '../data/newsData';
import './LandingPage.css';

const baseUrl = import.meta.env.BASE_URL || '/';

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [lang, setLang] = useState('id'); // Default to Indonesian
  const [tiles, setTiles] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRefs = useRef([]);
  const timelineRefs = useRef([]);
  const teamGalleryRef = useRef(null);
  const teamIsInteracting = useRef(false);
  const ctaCardRef = useRef(null);
  const isScrollingToSection = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const t = {
    en: {
      home: "Home", features: "Features", about: "About", team: "Our Team", news: "News",
      register: "Register", login: "Login",
      digitalTrack: "DIGITAL TRACK", heroTitle1: "Track money. Split bills.", heroTitle2: "Stress less.",
      heroDesc: "Kantongku helps you track expenses, split bills with friends, and stay on budget — without boring spreadsheets.",
      getStarted: "GET STARTED",
      mainFeatures: "MAIN FEATURES", featuresSub: "Apple-inspired precision for your financial future.",
      f1Title: "AI Receipt Scanner", f1Desc: "Our advanced OCR technology can automatically read even the blurriest shopping receipts with 99% precision.",
      f2Title: "Real-time Dashboard", f2Desc: "Watch your discipline score rise as you adhere to your planned budget.",
      f3Title: "Budget Pockets", f3Desc: "Allocate your income into separate digital pockets. We 'stitch' your spending limits.",
      aboutTitle: "ABOUT", aboutH2: "The 'Digital Tailor' Concept",
      aboutP1: "Don't let your money just evaporate. Our app is designed with a philosophy of elegance and high discipline, giving you full control over every financial decision.",
      aboutP2: "Think of Kantongku as your personal financial advisor, tailored to your unique spending patterns and goals.",
      teamTitle: "OUR TEAM",
      stepTitle: "STEP BY STEP", stepTitleColor: "USAGE", step1: "STEP 1", step2: "STEP 2", step3: "STEP 3", step4: "STEP 4",
      step1Title: "Scan Receipt", step1Desc: "Snap or upload your shopping receipt. Our smart system will instantly extract all transaction details without manual typing.",
      step2Title: "AI Categorization", step2Desc: "KantongKu's AI algorithm will automatically group your expenses (e.g. Food, Transport) with high accuracy.",
      step3Title: "Monitor Budget Pockets", step3Desc: "Check remaining balances in each 'Budget Pocket' via our aesthetic dashboard. Ensure your expenses don't exceed the monthly budget.",
      step4Title: "Achieve Financial Freedom", step4Desc: "Enjoy smart analysis from your financial reports. Make better financial decisions and reach your future savings goals!",
      newsTitle: "LATEST FINANCIAL NEWS", readMore: "Read More",
      ready: "Ready to be Disciplined?", readyDesc: "Join thousands of others who have found financial freedom through our digital precision."
    },
    id: {
      home: "Beranda", features: "Fitur", about: "Tentang", team: "Tim Kami", news: "Berita",
      register: "Daftar", login: "Masuk",
      digitalTrack: "PELACAK DIGITAL", heroTitle1: "Lacak uang. Bagi tagihan.", heroTitle2: "Bebas stres.",
      heroDesc: "KantongKu membantu Anda melacak pengeluaran, membagi tagihan dengan teman, dan menjaga anggaran — tanpa spreadsheet yang membosankan.",
      getStarted: "MULAI SEKARANG",
      mainFeatures: "FITUR UTAMA", featuresSub: "Presisi tingkat tinggi untuk masa depan finansial Anda.",
      f1Title: "Pemindai Struk AI", f1Desc: "Teknologi OCR canggih kami dapat membaca otomatis struk belanja yang buram sekalipun dengan presisi 99%.",
      f2Title: "Dashboard Real-time", f2Desc: "Saksikan skor kedisiplinan Anda meningkat saat Anda mematuhi anggaran yang direncanakan.",
      f3Title: "Kantong Anggaran", f3Desc: "Alokasikan pendapatan ke dalam kantong digital terpisah. Kami membatasi pengeluaran Anda dengan cerdas.",
      aboutTitle: "TENTANG", aboutH2: "Konsep 'Penjahit Digital'",
      aboutP1: "Jangan biarkan uang Anda menguap begitu saja. Aplikasi kami didesain dengan filosofi keanggunan dan disiplin tinggi, memberi Anda kendali penuh atas setiap keputusan finansial.",
      aboutP2: "Anggap KantongKu sebagai penasihat keuangan pribadi Anda, dirancang khusus untuk pola pengeluaran dan tujuan unik Anda.",
      teamTitle: "TIM KAMI",
      stepTitle: "STEP BY STEP", stepTitleColor: "PENGGUNAAN", step1: "LANGKAH 1", step2: "LANGKAH 2", step3: "LANGKAH 3", step4: "LANGKAH 4",
      step1Title: "Pindai Struk Belanja", step1Desc: "Foto atau unggah struk belanja Anda. Sistem cerdas kami akan otomatis mengekstrak seluruh detail transaksi secara instan tanpa perlu ketik manual.",
      step2Title: "Kategorisasi Oleh AI", step2Desc: "Algoritma AI KantongKu akan secara otomatis mengelompokkan setiap pengeluaran Anda (seperti Makanan, Transport, dll) dengan tingkat akurasi tinggi.",
      step3Title: "Pantau Kantong Anggaran", step3Desc: "Lihat sisa saldo pada masing-masing 'Budget Pockets' melalui dashboard yang estetik. Pastikan pengeluaran Anda tidak melewati batas anggaran bulan ini.",
      step4Title: "Capai Kebebasan Finansial", step4Desc: "Nikmati analisis cerdas dari laporan keuangan Anda. Ambil keputusan finansial yang lebih baik dan raih tujuan tabungan masa depan Anda!",
      newsTitle: "BERITA KEUANGAN TERKINI", readMore: "Baca Selengkapnya",
      ready: "Siap Untuk Disiplin?", readyDesc: "Bergabunglah dengan ribuan orang lainnya yang telah menemukan kebebasan finansial melalui presisi digital kami."
    }
  };

  const currentT = t[lang];

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth > 768) return; // Only auto-scroll on mobile viewports
      if (teamIsInteracting.current) return;

      const container = teamGalleryRef.current;
      if (container) {
        const cardWidth = 270; // 250px card width + 20px gap
        const maxScroll = container.scrollWidth - container.clientWidth;
        let nextScroll;
        
        // If we are already near the end (last card), jump back to start instantly
        if (container.scrollLeft >= maxScroll - 15) {
          container.scrollTo({
            left: 0,
            behavior: 'auto'
          });
        } else {
          let nextScroll = container.scrollLeft + cardWidth;
          // Clamp to maxScroll to snap exactly onto the last card
          if (nextScroll > maxScroll) {
            nextScroll = maxScroll;
          }
          container.scrollTo({
            left: nextScroll,
            behavior: 'smooth'
          });
        }
      }
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    // Generate 144 tiles (12x12 grid) with random animation delays
    const newTiles = Array.from({ length: 144 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 0.8 // Random delay between 0s and 0.8s
    }));
    setTiles(newTiles);

    // Trigger reveal shortly after mount
    const curtainTimer = setTimeout(() => setPageLoaded(true), 150);
    
    // Hide container completely after animations finish
    const removeTimer = setTimeout(() => {
      const container = document.getElementById('tile-curtain');
      if(container) container.style.display = 'none';
    }, 2000);

    return () => {
      clearTimeout(curtainTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      if (isScrollingToSection.current) return;

      // Check if we are at the bottom of the page
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isBottom) {
        setActiveSection('news');
        return;
      }

      // Scroll Spy
      const sections = ['home', 'features', 'about', 'team', 'news'];
      const scrollPosition = window.scrollY + 160; // offset for sticky header

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    // Setup Intersection Observer for timeline animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    );

    // Setup a more lenient observer for CTA card at the bottom of the page
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px' }
    );

    timelineRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    if (ctaCardRef.current) {
      ctaObserver.observe(ctaCardRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      ctaObserver.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Update navbar indicator style when active section, lang, or window resizing changes
  useEffect(() => {
    const updateIndicatorStyle = () => {
      const sectionIndexMap = {
        home: 0,
        features: 1,
        about: 2,
        team: 3,
        news: 4
      };
      const index = sectionIndexMap[activeSection];
      const activeRef = navRefs.current[index];
      if (activeRef) {
        setIndicatorStyle({
          width: activeRef.offsetWidth,
          left: activeRef.offsetLeft
        });
      }
    };

    updateIndicatorStyle();
    
    window.addEventListener('resize', updateIndicatorStyle);
    return () => window.removeEventListener('resize', updateIndicatorStyle);
  }, [activeSection, lang]);

  const handleMouseEnter = (e) => {
    setIndicatorStyle({
      width: e.target.offsetWidth,
      left: e.target.offsetLeft
    });
  };

  const handleMouseLeave = () => {
    const sectionIndexMap = {
      home: 0,
      features: 1,
      about: 2,
      team: 3,
      news: 4
    };
    const index = sectionIndexMap[activeSection];
    const activeRef = navRefs.current[index];
    if (activeRef) {
      setIndicatorStyle({
        width: activeRef.offsetWidth,
        left: activeRef.offsetLeft
      });
    }
  };

  const handleScrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Height of floating navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      // Lock scroll spy updating and set the active section immediately
      isScrollingToSection.current = true;
      setActiveSection(id);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Clear any existing scroll timeout to avoid collision
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reset scroll spy lockout after 1000ms (smooth scroll duration)
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingToSection.current = false;
      }, 1000);
    }
  };

  return (
    <div className="landing-page">
      {/* Tile Reveal Animation */}
      <div id="tile-curtain" className="tile-curtain-container">
        {tiles.map(tile => (
          <div 
            key={tile.id} 
            className={`reveal-tile ${pageLoaded ? 'opened' : ''}`}
            style={{ transitionDelay: `${tile.delay}s` }}
          ></div>
        ))}
      </div>

      {/* Fixed Ambient Background */}
      <div className="fixed-background">
        <div className="bg-glow bg-glow-tl"></div>
        <div className="bg-glow bg-glow-tr"></div>
        <div className="bg-glow bg-glow-bl"></div>
        <div className="bg-glow bg-glow-br"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
        <div className="bg-orb bg-orb-4"></div>
        <div className="bg-orb bg-orb-5"></div>
      </div>

      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <span>Kantongku</span>
          </Link>
          
          <div className="nav-links" onMouseLeave={handleMouseLeave}>
            <a 
              href="#home" 
              className={activeSection === 'home' ? 'active' : ''} 
              ref={el => navRefs.current[0] = el} 
              onMouseEnter={handleMouseEnter}
              onClick={(e) => handleScrollToSection(e, 'home')}
            >
              {currentT.home}
            </a>
            <a 
              href="#features" 
              className={activeSection === 'features' ? 'active' : ''} 
              ref={el => navRefs.current[1] = el} 
              onMouseEnter={handleMouseEnter}
              onClick={(e) => handleScrollToSection(e, 'features')}
            >
              {currentT.features}
            </a>
            <a 
              href="#about" 
              className={activeSection === 'about' ? 'active' : ''} 
              ref={el => navRefs.current[2] = el} 
              onMouseEnter={handleMouseEnter}
              onClick={(e) => handleScrollToSection(e, 'about')}
            >
              {currentT.about}
            </a>
            <a 
              href="#team" 
              className={activeSection === 'team' ? 'active' : ''} 
              ref={el => navRefs.current[3] = el} 
              onMouseEnter={handleMouseEnter}
              onClick={(e) => handleScrollToSection(e, 'team')}
            >
              {currentT.team}
            </a>
            <a 
              href="#news" 
              className={activeSection === 'news' ? 'active' : ''} 
              ref={el => navRefs.current[4] = el} 
              onMouseEnter={handleMouseEnter}
              onClick={(e) => handleScrollToSection(e, 'news')}
            >
              {currentT.news}
            </a>
            <div className="nav-indicator" style={indicatorStyle}></div>
          </div>

          <div className="nav-actions">
            <button 
              onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
              className="lang-toggle-btn"
            >
              {lang === 'en' ? 'ID' : 'EN'}
            </button>
            {isLoggedIn ? (
              <Link to="/dashboard" className="nav-button">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-login-link">
                  {currentT.login}
                </Link>
                <Link to="/register" className="nav-button">
                  {currentT.register}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Fullscreen Glass Menu */}
        <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-links">
            <a 
              href="#home" 
              className={activeSection === 'home' ? 'active' : ''} 
              onClick={(e) => {
                handleScrollToSection(e, 'home');
                setMobileMenuOpen(false);
              }}
            >
              {currentT.home}
            </a>
            <a 
              href="#features" 
              className={activeSection === 'features' ? 'active' : ''} 
              onClick={(e) => {
                handleScrollToSection(e, 'features');
                setMobileMenuOpen(false);
              }}
            >
              {currentT.features}
            </a>
            <a 
              href="#about" 
              className={activeSection === 'about' ? 'active' : ''} 
              onClick={(e) => {
                handleScrollToSection(e, 'about');
                setMobileMenuOpen(false);
              }}
            >
              {currentT.about}
            </a>
            <a 
              href="#team" 
              className={activeSection === 'team' ? 'active' : ''} 
              onClick={(e) => {
                handleScrollToSection(e, 'team');
                setMobileMenuOpen(false);
              }}
            >
              {currentT.team}
            </a>
            <a 
              href="#news" 
              className={activeSection === 'news' ? 'active' : ''} 
              onClick={(e) => {
                handleScrollToSection(e, 'news');
                setMobileMenuOpen(false);
              }}
            >
              {currentT.news}
            </a>
          </div>

          <div className="mobile-menu-actions">
            <button 
              onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
              className="lang-toggle-btn"
            >
              {lang === 'en' ? 'ID' : 'EN'}
            </button>
            {isLoggedIn ? (
              <Link to="/dashboard" className="nav-button" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-login-link" onClick={() => setMobileMenuOpen(false)}>
                  {currentT.login}
                </Link>
                <Link to="/register" className="nav-button" onClick={() => setMobileMenuOpen(false)}>
                  {currentT.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-badge-container">
            <div className="hero-badge">
              <span>{currentT.digitalTrack}</span>
              <Sparkles size={14} />
            </div>
          </div>
          
          <div className="hero-main">
            <div className="hero-content">
              <h1 className="hero-title">
                {currentT.heroTitle1.split('. ')[0]}.<br />
                {currentT.heroTitle1.split('. ')[1] ? <>{currentT.heroTitle1.split('. ')[1]}<br /></> : null}
                <span className="gradient-text">{currentT.heroTitle2}</span>
              </h1>
              
              <p className="hero-description">
                {currentT.heroDesc}
              </p>
              
              <div className="hero-actions">
                <Link to={isLoggedIn ? "/dashboard" : "/register"} className="btn-glass">
                  {currentT.getStarted}
                </Link>
              </div>
            </div>

            <div className="hero-visual">
               <h2>K</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>{currentT.mainFeatures}</h2>
            <p>{currentT.featuresSub}</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Cpu size={24} strokeWidth={1.5} />
              </div>
              <h3>{currentT.f1Title}</h3>
              <p>{currentT.f1Desc}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <LineChart size={24} strokeWidth={1.5} />
              </div>
              <h3>{currentT.f2Title}</h3>
              <p>{currentT.f2Desc}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Wallet size={24} strokeWidth={1.5} />
              </div>
              <h3>{currentT.f3Title}</h3>
              <p>{currentT.f3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="section-header about-header">
            <h2>{currentT.aboutTitle}</h2>
          </div>
          <div className="about-content">
            <div className="about-text">
              <h2>{currentT.aboutH2}</h2>
              <p>{currentT.aboutP1}</p>
              <p>{currentT.aboutP2}</p>
            </div>

            <div className="about-visual">
              <img src={`${baseUrl}jeans_pocket.png`} alt="Jeans Pocket" className="pocket-image" />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team-section">
        <div className="section-container">
          <div className="section-header">
            <h2>{currentT.teamTitle}</h2>
          </div>

          <div 
            className="team-gallery" 
            ref={teamGalleryRef}
            onMouseEnter={() => { teamIsInteracting.current = true; }}
            onMouseLeave={() => { teamIsInteracting.current = false; }}
            onTouchStart={() => { teamIsInteracting.current = true; }}
            onTouchEnd={() => { teamIsInteracting.current = false; }}
          >
             <div className="team-member-card size-small">
               <img src={`${baseUrl}team_1.png`} alt="Team member 1" />
             </div>
             <div className="team-member-card size-medium">
               <img src={`${baseUrl}team_2.png`} alt="Team member 2" />
             </div>
             <div className="team-member-card size-large">
               <img src={`${baseUrl}team_3.png`} alt="Team member 3" />
             </div>
             <div className="team-member-card size-medium">
               <img src={`${baseUrl}team_4.png`} alt="Team member 4" />
             </div>
             <div className="team-member-card size-small">
               <img src={`${baseUrl}team_5.png`} alt="Team member 5" />
             </div>
          </div>
        </div>
      </section>

      {/* How it Works / Timeline Section */}
      <section id="how-it-works" className="timeline-section">
        <div className="section-container">
          <div className="section-header">
            <h2>{currentT.stepTitle} <span style={{color: '#ff7b00'}}>{currentT.stepTitleColor}</span></h2>
          </div>

          <div className="timeline-container">
            {/* Step 1 */}
            <div className="timeline-item left" ref={el => timelineRefs.current[0] = el}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-step">{currentT.step1}</div>
                <h3>{currentT.step1Title}</h3>
                <p>{currentT.step1Desc}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="timeline-item right" ref={el => timelineRefs.current[1] = el}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-step">{currentT.step2}</div>
                <h3>{currentT.step2Title}</h3>
                <p>{currentT.step2Desc}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="timeline-item left" ref={el => timelineRefs.current[2] = el}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-step">{currentT.step3}</div>
                <h3>{currentT.step3Title}</h3>
                <p>{currentT.step3Desc}</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="timeline-item right" ref={el => timelineRefs.current[3] = el}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-step">{currentT.step4}</div>
                <h3>{currentT.step4Title}</h3>
                <p>{currentT.step4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="news-section-landing">
        <div className="section-container">
          <div className="section-header">
            <h2>{currentT.newsTitle}</h2>
          </div>
          
          <div className="landing-carousel-wrapper">
            <div className="landing-promo-card">
              <div className="landing-promo-image-container">
                <img 
                  src={newsItems[currentNewsIndex].image} 
                  alt={newsItems[currentNewsIndex].title} 
                  className="landing-promo-image fade-transition" 
                  key={`img-${currentNewsIndex}`} 
                />
                <div className="landing-promo-badge">{newsItems[currentNewsIndex].badge}</div>
              </div>
              <div className="landing-promo-content fade-transition" key={`content-${currentNewsIndex}`}>
                <h3>{newsItems[currentNewsIndex].title}</h3>
                <p>{newsItems[currentNewsIndex].desc}</p>
                <button className="landing-promo-btn" onClick={() => navigate(`/news/${newsItems[currentNewsIndex].id}`)}>{currentT.readMore}</button>
              </div>
            </div>
            
            <div className="landing-carousel-indicators">
              {newsItems.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`landing-indicator-dot ${idx === currentNewsIndex ? 'active' : ''}`}
                  onClick={() => setCurrentNewsIndex(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Theme Transition Spacer */}
      <div className="theme-transition-spacer"></div>

      <section className="cta-section">
        {/* Light ambient background */}
        <div className="light-glow glow-tl"></div>
        <div className="light-glow glow-tr"></div>
        <div className="light-glow glow-bl"></div>
        <div className="light-glow glow-br"></div>
        <div className="light-orb orb-1"></div>
        <div className="light-orb orb-2"></div>
        <div className="light-orb orb-3"></div>

        <div className="cta-card" ref={ctaCardRef}>
          <div className="cta-line"></div>
          <h2>{currentT.ready}</h2>
          <p>{currentT.readyDesc}</p>
          <Link to={isLoggedIn ? "/dashboard" : "/register"} className="cta-btn">
            {currentT.getStarted}
          </Link>
          <div className="cta-card-decor">
             <div className="decor-pill"></div>
             <div className="decor-card"></div>
          </div>
        </div>

        <div className="landing-footer">
          <div className="footer-content">
            <div className="footer-col brand-col">
              <span className="footer-logo">Kantongku</span>
              <p className="footer-desc">
                {lang === 'en' 
                  ? 'Take the first step toward financial freedom. Join thousands of users who have mastered budgeting and tracking with Kantongku.' 
                  : 'Ambil langkah pertama menuju kebebasan finansial. Bergabunglah dengan ribuan pengguna yang telah menguasai penganggaran dan pelacakan bersama Kantongku.'}
              </p>
              <div className="footer-cta-wrapper">
                <Link to={isLoggedIn ? "/dashboard" : "/register"} className="footer-join-btn">
                  {lang === 'en' ? 'Join Now (Free)' : 'Gabung Sekarang (Gratis)'}
                </Link>
              </div>
            </div>
            
            <div className="footer-col links-col">
              <h4>{lang === 'en' ? 'Navigation' : 'Navigasi'}</h4>
              <ul>
                <li><a href="#home" onClick={(e) => handleScrollToSection(e, 'home')}>{currentT.home}</a></li>
                <li><a href="#features" onClick={(e) => handleScrollToSection(e, 'features')}>{currentT.features}</a></li>
                <li><a href="#about" onClick={(e) => handleScrollToSection(e, 'about')}>{currentT.about}</a></li>
                <li><a href="#team" onClick={(e) => handleScrollToSection(e, 'team')}>{currentT.team}</a></li>
                <li><a href="#news" onClick={(e) => handleScrollToSection(e, 'news')}>{currentT.news}</a></li>
              </ul>
            </div>
            
            <div className="footer-col contact-col">
              <h4>{lang === 'en' ? 'Connect' : 'Hubungi Kami'}</h4>
              <p>Email: support@kantongku.com</p>
              <p>Bandung, Indonesia</p>
              <div className="footer-socials">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer">Discord</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>
              <span>&copy; {new Date().getFullYear()} Kantongku. {lang === 'en' ? 'All rights reserved.' : 'Hak cipta dilindungi undang-undang.'}</span>
              <span className="footer-dbs">Powered by DBS Foundation Coding Camp.</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
