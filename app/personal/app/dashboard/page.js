'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import { useAuthUser } from '@/lib/useAuthUser';
import { authFetch } from '@/lib/auth-fetch';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

export default function DashboardPage() {
  const { authUser, authReady } = useAuthUser();
  const [transactions, setTransactions] = useState(null);
  const [goals, setGoals] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (!authReady || !authUser?.authId) return;

    let cancelled = false;

    Promise.all([
      authFetch('/api/profile', authUser).then(r => r.json()),
      authFetch('/api/transactions', authUser).then(r => r.json()),
      authFetch('/api/goals', authUser).then(r => r.json()),
    ]).then(([profileRes, txns, gls]) => {
      if (cancelled) return;
      setIsNewUser(Boolean(profileRes?.isNewUser));
      setTransactions(Array.isArray(txns) ? txns : []);
      setGoals(Array.isArray(gls) ? gls : []);
    }).catch(() => {
      if (cancelled) return;
      setTransactions([]);
      setGoals([]);
    });

    return () => {
      cancelled = true;
    };
  }, [authReady, authUser]);

  const loading = Boolean(authReady && authUser?.authId && (transactions === null || goals === null));
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeGoals = Array.isArray(goals) ? goals : [];

  const totalIncome = safeTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = safeTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netWorth = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0;

  // Category spending for donut
  const categoryMap = {};
  safeTransactions.filter(t => t.type === 'expense').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });
  const catLabels = Object.keys(categoryMap);
  const catData = Object.values(categoryMap);
  const catColors = ['#004c8c','#16a34a','#dc2626','#d97706','#7c3aed','#0891b2','#be185d'];

  const barData = {
    labels: MONTHS,
    datasets: [
      { label: 'Income', data: [0, 0, 0, 0, 0, totalIncome], backgroundColor: 'rgba(22,163,74,0.7)', borderRadius: 4 },
      { label: 'Expenses', data: [0, 0, 0, 0, 0, totalExpenses], backgroundColor: 'rgba(220,38,38,0.7)', borderRadius: 4 },
    ]
  };

  const donutData = {
    labels: catLabels.length ? catLabels : ['No Data'],
    datasets: [{
      data: catData.length ? catData : [0],
      backgroundColor: catColors,
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 }, color: '#94a3b8' } }
    }
  };

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const recent = safeTransactions.slice(0, 6);

  const categoryBadge = (cat) => {
    const m = { Income: 'income', Food: 'food', Loan: 'loan', Investment: 'invest', Utilities: 'utility', Shopping: 'shopping', Entertainment: 'entertain', Transport: 'transport', Healthcare: 'health' };
    return m[cat] || 'other';
  };

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="page-area">
        {loading ? (
          <div className="flex-center" style={{ height: 300 }}>
            <p className="text-muted">Loading...</p>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Monthly Income</div>
                <div className="stat-value">{fmt(totalIncome)}</div>
                <div className="stat-sub up">↑ 5.2% from last month</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Expenses</div>
                <div className="stat-value">{fmt(totalExpenses)}</div>
                <div className="stat-sub down">↑ 8.1% over budget</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Savings Rate</div>
                <div className="stat-value">{savingsRate}%</div>
                <div className="stat-sub up">↑ 2.1% vs last month</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Net Worth</div>
                <div className="stat-value">{fmt(netWorth)}</div>
                <div className="stat-sub up">↑ ₹18,000 this month</div>
              </div>
            </div>

            {!authUser?.authId && (
              <div className="card mb-20">
                <p className="text-muted" style={{ fontSize: 13 }}>
                  We could not identify your login session. Please sign in again from the gateway app.
                </p>
              </div>
            )}

            {isNewUser && (
              <div className="card mb-20">
                <p className="text-muted" style={{ fontSize: 13 }}>
                  Welcome! Your account is new, so no financial data exists yet. Add budgets, goals, and transactions to get started.
                </p>
              </div>
            )}

            <div className="charts-grid">
              <div className="card">
                <div className="card-title">
                  Income vs Expenses
                  <span className="tag-badge">6 months</span>
                </div>
                <div style={{ height: 220 }}>
                  <Bar data={barData} options={chartOptions} />
                </div>
              </div>
              <div className="card">
                <div className="card-title">
                  Spending by Category
                  <span className="tag-badge">This month</span>
                </div>
                <div style={{ height: 200, position: 'relative' }}>
                  <Doughnut data={donutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { size: 11 }, color: '#64748b', boxWidth: 12 } } } }} />
                </div>
              </div>
            </div>

            <div className="charts-grid-equal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card">
                <div className="card-title">Goals Progress</div>
                {safeGoals.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: 13 }}>No goals yet. Add your first goal from the Goals page.</p>
                ) : (
                  safeGoals.slice(0, 4).map((g) => {
                    const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                    return (
                      <div key={g._id} style={{ marginBottom: 14 }}>
                        <div className="flex-between" style={{ marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{g.name}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmt(g.currentAmount)} / {fmt(g.targetAmount)}</span>
                        </div>
                        <div className="progress-bar-wrap">
                          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--primary)' }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="card">
                <div className="card-title">Recent Transactions</div>
                {recent.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: 13 }}>No transactions yet. Add some from the Transactions page.</p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map((t) => (
                          <tr key={t._id}>
                            <td style={{ fontWeight: 500 }}>{t.description}</td>
                            <td><span className={`badge badge-${categoryBadge(t.category)}`}>{t.category}</span></td>
                            <td style={{ color: t.type === 'income' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                              {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
