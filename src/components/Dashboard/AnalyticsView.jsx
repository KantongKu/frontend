import React from 'react';
import { ChevronLeft, PieChart, TrendingUp, TrendingDown, ArrowDownRight } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import './AnalyticsView.css';

const AnalyticsView = ({ onBack }) => {
  const { getExpensesByCategory, getTotalExpenses, budgets } = useExpense();
  
  const categoryExpenses = getExpensesByCategory();
  const totalSpent = getTotalExpenses();
  
  // Define colors for specific categories
  const categoryColors = {
    'Makanan & Minuman': '#FF9800',
    'Transportasi': '#2196F3',
    'Kesehatan': '#F44336',
    'Hiburan': '#9C27B0',
    'Utilitas': '#00BCD4',
    'Pendidikan': '#4CAF50',
    'Lainnya': '#9E9E9E'
  };

  const chartData = Object.keys(categoryExpenses).map(key => ({
    name: key,
    amount: categoryExpenses[key],
    percentage: totalSpent > 0 ? (categoryExpenses[key] / totalSpent) * 100 : 0,
    color: categoryColors[key] || '#9E9E9E'
  })).sort((a, b) => b.amount - a.amount);

  let cumulativePercent = 0;
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Dummy weekly data to demonstrate trend details
  const weeklyData = [
    { week: 'W1', amount: 450000 },
    { week: 'W2', amount: 820000 },
    { week: 'W3', amount: 350000 },
    { week: 'W4', amount: totalSpent },
  ];
  const maxWeekly = Math.max(...weeklyData.map(d => d.amount));

  return (
    <div className="analytics-view">
      <div className="av-header">
        <button className="av-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2>Detail Analisis</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="av-content">
        {/* Total Spent Card */}
        <div className="av-card glass-card text-center">
          <p className="av-label">TOTAL PENGELUARAN BULAN INI</p>
          <h1 className="av-total">Rp {totalSpent.toLocaleString('id-ID')}</h1>
          <div className="av-trend positive">
            <ArrowDownRight size={16} />
            <span>Lebih hemat 15% dari bulan lalu</span>
          </div>
        </div>

        {/* Weekly Trend Card */}
        <div className="av-card glass-card">
          <h3 className="av-card-title">Tren Mingguan</h3>
          <div className="av-bar-chart">
            {weeklyData.map((data, index) => {
              const heightPercent = maxWeekly > 0 ? (data.amount / maxWeekly) * 100 : 0;
              return (
                <div className="av-bar-col" key={index}>
                  <div className="av-bar-amount">{data.amount > 1000 ? `${(data.amount/1000).toFixed(0)}k` : data.amount}</div>
                  <div className="av-bar-bg">
                    <div className="av-bar-fill" style={{ height: `${heightPercent}%` }}></div>
                  </div>
                  <div className="av-bar-label">{data.week}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Details Card */}
        <div className="av-card glass-card">
          <h3 className="av-card-title">Pengeluaran Berdasarkan Kategori</h3>
          
          <div className="av-chart-container">
            {totalSpent > 0 ? (
              <svg viewBox="-1 -1 2 2" className="av-donut">
                {chartData.map(slice => {
                  const startPercent = cumulativePercent;
                  cumulativePercent += slice.percentage / 100;
                  const endPercent = cumulativePercent;

                  const [startX, startY] = getCoordinatesForPercent(startPercent);
                  const [endX, endY] = getCoordinatesForPercent(endPercent);

                  const largeArcFlag = slice.percentage > 50 ? 1 : 0;
                  
                  if (slice.percentage === 100) {
                    return <circle cx="0" cy="0" r="1" fill="none" stroke={slice.color} strokeWidth="0.4" key={slice.name} />;
                  }

                  const pathData = [
                    `M ${startX} ${startY}`,
                    `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`
                  ].join(' ');

                  return (
                    <path 
                      key={slice.name}
                      d={pathData} 
                      fill="none" 
                      stroke={slice.color} 
                      strokeWidth="0.4"
                    />
                  );
                })}
              </svg>
            ) : (
              <div className="av-empty-chart">
                <PieChart size={48} color="rgba(255,255,255,0.2)" />
                <p>Belum ada data</p>
              </div>
            )}
            
            {totalSpent > 0 && (
              <div className="av-donut-center">
                <span>{chartData.length}</span>
                <p>Kategori</p>
              </div>
            )}
          </div>

          <div className="av-legend">
            {chartData.map(item => {
              const budgetLimit = budgets[item.name]?.limit || 1000000;
              const budgetPercent = Math.min((item.amount / budgetLimit) * 100, 100);

              return (
                <div className="av-legend-item-detailed" key={item.name}>
                  <div className="av-legend-header">
                    <div className="av-legend-left">
                      <div className="av-legend-dot" style={{ backgroundColor: item.color }}></div>
                      <h4>{item.name}</h4>
                    </div>
                    <div className="av-legend-amount">
                      Rp {item.amount.toLocaleString('id-ID')}
                    </div>
                  </div>
                  
                  <div className="av-budget-info">
                    <div className="av-budget-labels">
                      <span>{item.percentage.toFixed(1)}% dari total</span>
                      <span>Sisa: Rp {(budgetLimit - item.amount).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="av-budget-bar-bg">
                      <div 
                        className="av-budget-bar-fill" 
                        style={{ width: `${budgetPercent}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
