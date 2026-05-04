import React from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useExpense } from '../../context/ExpenseContext';
import './Dashboard.css';

const DashboardOverview = () => {
  const { expenses, budgets, monthlyIncome, getTotalExpenses, getExpensesByCategory } = useExpense();

  const totalExpenses = getTotalExpenses();
  const expensesByCategory = getExpensesByCategory();
  const remaining = monthlyIncome - totalExpenses;

  // Data untuk Pie Chart
  const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Data untuk Bar Chart
  const barData = Object.entries(budgets).map(([category, { limit, spent }]) => ({
    name: category,
    limit,
    spent,
    remaining: limit - spent,
  }));

  // Data untuk Line Chart (trend mingguan)
  const weeklyData = [
    { week: 'Min 1', amount: 200000 },
    { week: 'Min 2', amount: 350000 },
    { week: 'Min 3', amount: 280000 },
    { week: 'Min 4', amount: 150000 },
  ];

  const getStatusColor = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 80) return '#ef4444';
    if (percentage >= 50) return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h1>Dashboard Keuangan</h1>
        <p>Pantau pengeluaran Anda secara real-time</p>
      </div>

      {/* Cards Overview */}
      <div className="overview-cards">
        <div className="card income-card">
          <div className="card-header">
            <span>💰 Pemasukan Bulan Ini</span>
          </div>
          <div className="card-amount">
            Rp {monthlyIncome.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="card expense-card">
          <div className="card-header">
            <span>💸 Total Pengeluaran</span>
          </div>
          <div className="card-amount">
            Rp {totalExpenses.toLocaleString('id-ID')}
          </div>
          <div className="card-percentage">
            {((totalExpenses / monthlyIncome) * 100).toFixed(1)}% dari pemasukan
          </div>
        </div>

        <div className={`card remaining-card ${remaining < 0 ? 'negative' : ''}`}>
          <div className="card-header">
            <span>💎 Sisa Budget</span>
          </div>
          <div className="card-amount">
            Rp {remaining.toLocaleString('id-ID')}
          </div>
          <div className="card-status">
            {remaining < 0 ? '⚠️ Anggaran Terlampaui' : '✅ Terkontrol'}
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        <div className="chart-container full-width">
          <h3>📈 Tren Pengeluaran Mingguan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row">
        <div className="chart-container half-width">
          <h3>🥧 Komposisi Pengeluaran</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <circle key={`color-${index}`} fill={['#3b82f6', '#ef4444', '#eab308', '#22c55e', '#8b5cf6', '#06b6d4', '#f97316'][index % 7]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">Belum ada data pengeluaran</div>
          )}
        </div>

        <div className="chart-container half-width">
          <h3>📊 Status Budget per Kategori</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
              <Bar dataKey="spent" fill="#ef4444" />
              <Bar dataKey="remaining" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Status */}
      <div className="budget-status">
        <h3>🎯 Status Budget Detail</h3>
        <div className="budget-list">
          {Object.entries(budgets).map(([category, { limit, spent }]) => {
            const percentage = (spent / limit) * 100;
            const status = percentage >= 80 ? 'critical' : percentage >= 50 ? 'warning' : 'normal';

            return (
              <div key={category} className={`budget-item ${status}`}>
                <div className="budget-info">
                  <span className="budget-name">{category}</span>
                  <span className="budget-amount">
                    Rp {spent.toLocaleString('id-ID')} / Rp {limit.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="budget-bar">
                  <div
                    className="budget-progress"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: getStatusColor(spent, limit),
                    }}
                  />
                </div>
                <span className="budget-percentage">{percentage.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
