import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { newsItems } from '../data/newsData';
import './NewsDetailPage.css';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const newsItem = newsItems.find(item => item.id === parseInt(id));

  // Scroll to top when loading the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!newsItem) {
    return (
      <div className="news-detail-page not-found">
        <h2>Berita tidak ditemukan</h2>
        <button onClick={() => navigate(-1)} className="back-btn">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="news-detail-page">
      {/* Navigation Bar */}
      <nav className="news-detail-nav">
        <button className="back-btn-icon" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
          <span>Kembali</span>
        </button>
      </nav>

      {/* Hero Image */}
      <div className="news-hero-section">
        <img src={newsItem.image} alt={newsItem.title} className="news-hero-image" />
        <div className="news-hero-overlay"></div>
        <div className="news-badge">{newsItem.badge}</div>
      </div>

      {/* Content Section */}
      <div className="news-content-section">
        <h1 className="news-title">{newsItem.title}</h1>
        
        <div className="news-meta">
          <span>KantongKu Finance</span>
          <span className="dot-separator">•</span>
          <span>Dipublikasikan Hari Ini</span>
        </div>

        <div className="news-body">
          {newsItem.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
