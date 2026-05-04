import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wallet, LineChart, Cpu, Sparkles } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Set initial indicator position
    setTimeout(() => {
      if (navRefs.current[0]) {
        setIndicatorStyle({
          width: navRefs.current[0].offsetWidth,
          left: navRefs.current[0].offsetLeft
        });
      }
    }, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (e) => {
    setIndicatorStyle({
      width: e.target.offsetWidth,
      left: e.target.offsetLeft
    });
  };

  const handleMouseLeave = () => {
    if (navRefs.current[0]) {
      setIndicatorStyle({
        width: navRefs.current[0].offsetWidth,
        left: navRefs.current[0].offsetLeft
      });
    }
  };

  return (
    <div className="landing-page">
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
            <a href="#home" className="active" ref={el => navRefs.current[0] = el} onMouseEnter={handleMouseEnter}>Home</a>
            <a href="#features" ref={el => navRefs.current[1] = el} onMouseEnter={handleMouseEnter}>Features</a>
            <a href="#about" ref={el => navRefs.current[2] = el} onMouseEnter={handleMouseEnter}>About</a>
            <div className="nav-indicator" style={indicatorStyle}></div>
          </div>

          <Link to="/register" className="nav-button">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-badge-container">
            <div className="hero-badge">
              <span>DIGITAL TRACK</span>
              <Sparkles size={14} />
            </div>
          </div>
          
          <div className="hero-main">
            <div className="hero-content">
              <h1 className="hero-title">
                Track money. Split bills.<br />
                <span className="gradient-text">Stress less.</span>
              </h1>
              
              <p className="hero-description">
                WalletYa helps you track expenses, split bills with friends,<br />
                and stay on budget — without boring spreadsheets.
              </p>
              
              <div className="hero-actions">
                <Link to="/register" className="btn-glass">
                  GET STARTED
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
            <h2>MAIN FEATURES</h2>
            <p>Apple-inspired precision for your financial future.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Cpu size={24} strokeWidth={1.5} />
              </div>
              <h3>AI Receipt Scanner</h3>
              <p>Our advanced OCR technology can automatically read even the blurriest shopping receipts with 99% precision.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <LineChart size={24} strokeWidth={1.5} />
              </div>
              <h3>Real-time Dashboard</h3>
              <p>Watch your discipline score rise as you adhere to your planned budget.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Wallet size={24} strokeWidth={1.5} />
              </div>
              <h3>Budget Pockets</h3>
              <p>Allocate your income into separate digital pockets. We "stitch" your spending limits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="section-header about-header">
            <h2>ABOUT</h2>
          </div>
          <div className="about-content">
            <div className="about-text">
              <h2>The "Digital Tailor"<br/>Concept</h2>
              <p>
                Don't let your money just evaporate. Our app is designed with a philosophy of elegance and high discipline, giving you full control over every financial decision.
              </p>
              <p>
                Think of Kantongku as your personal financial advisor, tailored to your unique spending patterns and goals.
              </p>
            </div>

            <div className="about-visual">
              <img src="/jeans_pocket.png" alt="Jeans Pocket" className="pocket-image" />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team-section">
        <div className="section-container">
          <div className="section-header">
            <h2>OUR TEAM</h2>
          </div>

          <div className="team-gallery">
             <div className="team-member-card size-small">
               <img src="/team_member.png" alt="Team member" />
             </div>
             <div className="team-member-card size-medium">
               <img src="/team_member.png" alt="Team member" />
             </div>
             <div className="team-member-card size-large">
               <img src="/team_member.png" alt="Team member" />
             </div>
             <div className="team-member-card size-medium">
               <img src="/team_member.png" alt="Team member" />
             </div>
             <div className="team-member-card size-small">
               <img src="/team_member.png" alt="Team member" />
             </div>
          </div>
        </div>
      </section>

      {/* CTA / Footer Section */}
      <section className="cta-section">
        {/* Light ambient background */}
        <div className="light-glow glow-tl"></div>
        <div className="light-glow glow-tr"></div>
        <div className="light-glow glow-bl"></div>
        <div className="light-glow glow-br"></div>
        <div className="light-orb orb-1"></div>
        <div className="light-orb orb-2"></div>
        <div className="light-orb orb-3"></div>

        <div className="cta-card">
          <div className="cta-line"></div>
          <h2>Ready to be Disciplined?</h2>
          <p>
            Join thousands of others who have found<br />
            financial freedom through our digital<br />
            precision.
          </p>
          <div className="cta-card-decor">
             <div className="decor-pill"></div>
             <div className="decor-card"></div>
          </div>
        </div>

        <div className="cta-footer-brand">
          Kantongku
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
