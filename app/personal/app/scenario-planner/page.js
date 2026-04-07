'use client';
import { useState } from 'react';
import TopBar from '@/components/TopBar';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SLIDERS = [
  { key: 'income', label: 'Monthly Income (₹)', min: 20000, max: 300000, step: 1000, default: 85000 },
  { key: 'rent', label: 'Rent / EMI (₹)', min: 0, max: 80000, step: 500, default: 18000 },
  { key: 'food', label: 'Food & Dining (₹)', min: 0, max: 30000, step: 200, default: 8000 },
  { key: 'transport', label: 'Transport (₹)', min: 0, max: 20000, step: 200, default: 3500 },
  { key: 'shopping', label: 'Shopping (₹)', min: 0, max: 30000, step: 200, default: 8000 },
  { key: 'investments', label: 'Investments (₹)', min: 0, max: 50000, step: 500, default: 12000 },
];

export default function ScenarioPlannerPage() {
  const [vals, setVals] = useState(Object.fromEntries(SLIDERS.map(s => [s.key, s.default])));

  const totalExpenses = vals.rent + vals.food + vals.transport + vals.shopping + vals.investments;
  const monthlySavings = vals.income - totalExpenses;
  const annualSavings = monthlySavings * 12;
  const savingsRate = vals.income > 0 ? ((monthlySavings / vals.income) * 100).toFixed(0) : 0;
  const emergencyFund = totalExpenses * 6;

  const projection = (years, cagr = 0.1) => {
    let amt = 0;
    for (let m = 0; m < years * 12; m++) amt = (amt + monthlySavings) * (1 + cagr / 12);
    return Math.round(amt);
  };

  const barData = {
    labels: ['Income', 'Rent/EMI', 'Food', 'Transport', 'Shopping', 'Investments', 'Savings'],
    datasets: [{
      data: [vals.income, -vals.rent, -vals.food, -vals.transport, -vals.shopping, -vals.investments, monthlySavings],
      backgroundColor: ['#16a34a', '#dc2626', '#d97706', '#0891b2', '#be185d', '#7c3aed', monthlySavings >= 0 ? '#16a34a' : '#dc2626'],
      borderRadius: 4,
    }]
  };

  const fmt = (n) => `₹${Number(Math.round(n)).toLocaleString('en-IN')}`;

  return (
    <>
      <TopBar title="Scenario Planner" />
      <div className="page-area">
        <div className="two-col">
          <div className="card">
            <div className="card-title">What-If Scenario Planner</div>
            {SLIDERS.map(s => (
              <div key={s.key} className="slider-row">
                <span className="slider-label">{s.label}</span>
                <input className="slider-input" type="range" min={s.min} max={s.max} step={s.step}
                  value={vals[s.key]} onChange={e => setVals({ ...vals, [s.key]: Number(e.target.value) })} />
                <span className="slider-value">{fmt(vals[s.key])}</span>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[
                { label: 'Monthly Savings', val: fmt(monthlySavings), up: monthlySavings >= 0 },
                { label: 'Annual Savings', val: fmt(annualSavings), up: annualSavings >= 0 },
                { label: 'Savings Rate', val: `${savingsRate}%`, up: savingsRate >= 20 },
                { label: 'Emergency Fund Needed', val: fmt(emergencyFund), neutral: true },
              ].map(r => (
                <div key={r.label} style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{r.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: r.neutral ? 'var(--primary)' : (r.up ? 'var(--success)' : 'var(--danger)') }}>
                    {r.val}
                  </div>
                </div>
              ))}
            </div>
            <div className={`alert-box ${monthlySavings >= vals.income * 0.2 ? 'success' : monthlySavings >= 0 ? 'info' : 'danger'}`}>
              <span>{monthlySavings >= vals.income * 0.2 ? '✅' : monthlySavings >= 0 ? '💡' : '⚠'}</span>
              <span>
                {monthlySavings >= vals.income * 0.2
                  ? 'Excellent savings rate! You are on track for financial independence.'
                  : monthlySavings >= 0
                    ? `You're saving ${savingsRate}% of income. Aim for 20%+ for financial health.`
                    : 'You are spending more than you earn. Reduce expenses immediately.'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title">Scenario Comparison Chart</div>
              <div style={{ height: 240 }}>
                <Bar data={barData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8', maxRotation: 45 } },
                    y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 }, color: '#94a3b8', callback: v => '₹' + (v / 1000).toFixed(0) + 'K' } }
                  }
                }} />
              </div>
            </div>

            <div className="card">
              <div className="card-title">5-Year Wealth Projection (10% CAGR)</div>
              {monthlySavings > 0 ? (
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    At this rate, you will save {fmt(annualSavings)} per year. In 5 years: {fmt(projection(5))}.
                  </p>
                  {[[1, '1 Year'], [3, '3 Years'], [5, '5 Years'], [10, '10 Years']].map(([yr, label]) => (
                    <div key={yr} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                      <span style={{ fontWeight: 500 }}>{label}</span>
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>{fmt(projection(yr))}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert-box danger">
                  <span>⚠</span>
                  <span>Increase income or reduce expenses to generate wealth.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
