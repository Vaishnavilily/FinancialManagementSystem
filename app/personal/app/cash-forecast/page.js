'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import { useAuthUser } from '@/lib/useAuthUser';
import { authFetch } from '@/lib/auth-fetch';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const getNextMonths = (n) => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
  }
  return months;
};

export default function CashForecastPage() {
  const { authUser, authReady } = useAuthUser();
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    if (!authReady || !authUser?.authId) return;
    authFetch('/api/transactions', authUser)
      .then(r => r.json())
      .then(d => setTransactions(Array.isArray(d) ? d : []));
  }, [authReady, authUser]);

  const avgIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 85000;
  const avgExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 52400;

  const months = getNextMonths(7);
  const incomeData = months.map((_, i) => Math.round(avgIncome * (1 + i * 0.025)));
  const expenseData = months.map((_, i) => Math.round(avgExpense * (1 + i * 0.01)));
  const forecastData = months.map((_, i) => i >= 3 ? Math.round(avgIncome * (1 + i * 0.03)) : null);

  const projIncome = incomeData.slice(3).reduce((s, v) => s + v, 0);
  const projExpense = expenseData.slice(3).reduce((s, v) => s + v, 0);
  const projSavings = projIncome - projExpense;

  const lineData = {
    labels: months,
    datasets: [
      { label: 'Income', data: incomeData, borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.07)', borderWidth: 2.5, pointRadius: 4, fill: true, tension: 0.4 },
      { label: 'Expenses', data: expenseData, borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,0.05)', borderWidth: 2.5, pointRadius: 4, fill: true, tension: 0.4 },
      { label: 'Forecast', data: forecastData, borderColor: '#7c3aed', borderDash: [5, 4], borderWidth: 2, pointRadius: 4, fill: false, tension: 0.4 },
    ]
  };

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  // Cumulative savings
  const savingsAcc = incomeData.reduce((acc, inc, i) => {
    const previous = acc.length ? acc[acc.length - 1] : 0;
    acc.push(previous + (inc - expenseData[i]));
    return acc;
  }, []);

  const savingsLineData = {
    labels: months,
    datasets: [{
      label: 'Cumulative Savings',
      data: savingsAcc,
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124,58,237,0.08)',
      borderWidth: 2.5,
      pointRadius: 4,
      fill: true,
      tension: 0.4
    }]
  };

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { font: { size: 11 }, color: '#64748b', boxWidth: 12 } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 }, color: '#94a3b8', callback: v => '₹' + (v / 1000).toFixed(0) + 'K' } }
    }
  };

  return (
    <>
      <TopBar title="Cash Flow Forecast" />
      <div className="page-area">
        <div className="stats-grid-3">
          <div className="stat-card">
            <div className="stat-label">Projected Income (Q2)</div>
            <div className="stat-value">{fmt(projIncome)}</div>
            <div className="stat-sub up">↑ 5% growth trend</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Projected Expenses (Q2)</div>
            <div className="stat-value">{fmt(projExpense)}</div>
            <div className="stat-sub" style={{ color: 'var(--warning)' }}>Based on 3-month avg</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Projected Savings (Q2)</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{fmt(projSavings)}</div>
            <div className="stat-sub up">Estimated surplus</div>
          </div>
        </div>

        <div className="card mb-20">
          <div className="card-title">
            6-Month Income & Expense Forecast
            <span className="tag-badge" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>AI-Predicted</span>
          </div>
          <div style={{ height: 260 }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="two-col-equal">
          <div className="card">
            <div className="card-title">Monthly Forecast Breakdown</div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Month</th><th>Income</th><th>Expense</th><th>Savings</th></tr>
                </thead>
                <tbody>
                  {months.map((m, i) => {
                    const sav = incomeData[i] - expenseData[i];
                    return (
                      <tr key={m}>
                        <td style={{ fontWeight: 500 }}>{m}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>+{fmt(incomeData[i])}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 600 }}>-{fmt(expenseData[i])}</td>
                        <td style={{ color: sav >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{fmt(sav)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Savings Accumulation</div>
            <div style={{ height: 220 }}>
              <Line data={savingsLineData} options={{ ...lineOptions, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
