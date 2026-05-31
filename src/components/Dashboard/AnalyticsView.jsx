import React from 'react';
import { ChevronLeft, PieChart, TrendingUp, TrendingDown, ArrowDownRight } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import './AnalyticsView.css';

const AnalyticsView = ({ pockets = [], activities = [], onBack }) => {
  const { getExpensesByCategory, getTotalExpenses, budgets } = useExpense();

  const isDynamic = Array.isArray(pockets) && pockets.length > 0 && Array.isArray(activities);

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

  const classToHexColor = {
    'pocket-blue': '#2196F3',
    'pocket-yellow': '#FFCA80', // Soft yellow
    'pocket-green': '#4CAF50',
    'pocket-orange': '#FF7B00', // Matches themed orange
    'pocket-purple': '#9C27B0'
  };

  // Group and summarize expenses
  let categoryExpenses = {};
  let totalSpent = 0;
  let weeklyData = [];
  let trendMessage = 'Sesuai dengan target pengeluaran Anda';
  let isTrendPositive = true;

  if (isDynamic) {
    const expenses = activities.filter(tx => tx.type === 'expense');
    totalSpent = expenses.reduce((sum, tx) => sum + (tx.amountVal || 0), 0);

    expenses.forEach(tx => {
      const category = tx.category || 'Lainnya';
      categoryExpenses[category] = (categoryExpenses[category] || 0) + (tx.amountVal || 0);
    });

    // Group expenses into weeks of the month (W1 to W4 based on day of month)
    const weeklyExpenses = { W1: 0, W2: 0, W3: 0, W4: 0 };
    expenses.forEach(tx => {
      const dateVal = tx.dateRaw || tx.createdAt || tx.date;
      const date = new Date(dateVal);
      if (!isNaN(date.getTime())) {
        const day = date.getDate();
        if (day <= 7) {
          weeklyExpenses.W1 += tx.amountVal;
        } else if (day <= 14) {
          weeklyExpenses.W2 += tx.amountVal;
        } else if (day <= 21) {
          weeklyExpenses.W3 += tx.amountVal;
        } else {
          weeklyExpenses.W4 += tx.amountVal;
        }
      }
    });

    weeklyData = [
      { week: 'W1', amount: weeklyExpenses.W1 },
      { week: 'W2', amount: weeklyExpenses.W2 },
      { week: 'W3', amount: weeklyExpenses.W3 },
      { week: 'W4', amount: weeklyExpenses.W4 },
    ];

    // Compute monthly trend comparison (this month vs last month)
    const monthlySpend = {};
    expenses.forEach(tx => {
      const dateVal = tx.dateRaw || tx.createdAt || tx.date;
      const date = new Date(dateVal);
      if (!isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlySpend[key] = (monthlySpend[key] || 0) + tx.amountVal;
      }
    });

    const sortedMonths = Object.keys(monthlySpend).sort();
    if (sortedMonths.length >= 2) {
      const thisMonthKey = sortedMonths[sortedMonths.length - 1];
      const lastMonthKey = sortedMonths[sortedMonths.length - 2];
      const thisMonthSpent = monthlySpend[thisMonthKey];
      const lastMonthSpent = monthlySpend[lastMonthKey];

      if (lastMonthSpent > 0) {
        const diffPercent = ((lastMonthSpent - thisMonthSpent) / lastMonthSpent) * 100;
        if (diffPercent >= 0) {
          trendMessage = `Lebih hemat ${Math.round(diffPercent)}% dari bulan lalu`;
          isTrendPositive = true;
        } else {
          trendMessage = `Lebih boros ${Math.round(Math.abs(diffPercent))}% dari bulan lalu`;
          isTrendPositive = false;
        }
      }
    } else if (sortedMonths.length === 1) {
      trendMessage = 'Pengeluaran bulan pertama Anda tercatat';
      isTrendPositive = true;
    }
  } else {
    // Fallback to static context data
    categoryExpenses = getExpensesByCategory();
    totalSpent = getTotalExpenses();
    weeklyData = [
      { week: 'W1', amount: 450000 },
      { week: 'W2', amount: 820000 },
      { week: 'W3', amount: 350000 },
      { week: 'W4', amount: totalSpent },
    ];
    trendMessage = 'Lebih hemat 15% dari bulan lalu';
    isTrendPositive = true;
  }

  const chartData = Object.keys(categoryExpenses).map(key => {
    let color = '#9E9E9E';
    if (isDynamic) {
      const pocket = pockets.find(p => p.title === key);
      if (pocket && pocket.colorClass) {
        color = classToHexColor[pocket.colorClass] || '#9E9E9E';
      } else {
        color = categoryColors[key] || '#9E9E9E';
      }
    } else {
      color = categoryColors[key] || '#9E9E9E';
    }

    return {
      name: key,
      amount: categoryExpenses[key],
      percentage: totalSpent > 0 ? (categoryExpenses[key] / totalSpent) * 100 : 0,
      color
    };
  }).sort((a, b) => b.amount - a.amount);

  // Resolved budgets limits for legend rendering
  const resolvedBudgets = {};
  if (isDynamic) {
    chartData.forEach(item => {
      const pocket = pockets.find(p => p.title === item.name);
      const limit = pocket ? (pocket.initialBudget || pocket.balance || 0) : 1000000;
      resolvedBudgets[item.name] = { limit };
    });
  } else {
    Object.keys(budgets).forEach(name => {
      resolvedBudgets[name] = { limit: budgets[name]?.limit || 1000000 };
    });
  }

  let cumulativePercent = 0;
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const maxWeekly = Math.max(...weeklyData.map(d => d.amount), 1);

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
          <div className={`av-trend ${isTrendPositive ? 'positive' : 'negative'}`}>
            <ArrowDownRight size={16} style={{ transform: isTrendPositive ? 'none' : 'rotate(180deg)' }} />
            <span>{trendMessage}</span>
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
                  <div className="av-bar-amount">{data.amount >= 1000 ? `${(data.amount/1000).toFixed(0)}k` : data.amount}</div>
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
              const budgetLimit = resolvedBudgets[item.name]?.limit || 1000000;
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
