'use client';
import { useState } from 'react';
import TopBar from '@/components/TopBar';

const REGIMES = ['New Regime (Default from FY 2023-24)', 'Old Regime'];

const TAX_SAVINGS = [
  { section: 'Section 80C', desc: 'PF, ELSS, LIC, PPF, NSC', limit: 150000, placeholder: 120000, tip: 'Invest ₹30,000 more in ELSS to max out deduction' },
  { section: 'Section 80D', desc: 'Health Insurance Premium', limit: 25000, placeholder: 12000, tip: 'Increase health cover to claim full ₹25,000' },
  { section: 'Section 24', desc: 'Home Loan Interest', limit: 200000, placeholder: 144000, tip: 'Well utilized — ₹56,000 remaining' },
  { section: 'NPS 80CCD(1B)', desc: 'NPS Additional Contribution', limit: 50000, placeholder: 0, tip: 'Invest in NPS to save additional tax of ₹15,600' },
  { section: '80TTA', desc: 'Savings Account Interest', limit: 10000, placeholder: 6000, tip: 'Claim remaining ₹4,000 if eligible' },
];

function calcTax(income, regime) {
  let tax = 0;
  if (regime === 'New Regime (Default from FY 2023-24)') {
    const slabs = [[300000, 0], [300000, 0.05], [300000, 0.1], [300000, 0.15], [300000, 0.2], [Infinity, 0.3]];
    let rem = Math.max(income - 300000, 0);
    for (const [limit, rate] of slabs) {
      const taxable = Math.min(rem, limit);
      tax += taxable * rate;
      rem -= taxable;
      if (rem <= 0) break;
    }
  } else {
    const slabs = [[250000, 0], [250000, 0.05], [500000, 0.2], [Infinity, 0.3]];
    let rem = income;
    for (const [limit, rate] of slabs) {
      const taxable = Math.min(rem, limit);
      tax += taxable * rate;
      rem -= taxable;
      if (rem <= 0) break;
    }
  }
  const cess = tax * 0.04;
  return { tax, cess, total: tax + cess };
}

export default function TaxPlannerPage() {
  const [income, setIncome] = useState(1000000);
  const [regime, setRegime] = useState(REGIMES[0]);
  const [used, setUsed] = useState({ 80: 120000, 80: 12000 });
  const [usedAmts, setUsedAmts] = useState({ '80C': 120000, '80D': 12000, '24': 144000, 'NPS': 0, '80TTA': 6000 });

  const { tax, cess, total } = calcTax(income, regime);
  const taxableIncome = income;
  const monthly = total / 12;
  const rate = income > 0 ? ((total / income) * 100).toFixed(1) : 0;
  const fmt = (n) => `₹${Number(Math.round(n)).toLocaleString('en-IN')}`;

  return (
    <>
      <TopBar title="Tax Planner" />
      <div className="page-area">
        <div className="two-col">
          <div className="card">
            <div className="card-title">Income Tax Calculator (FY 2024-25)</div>
            <div className="form-group">
              <label className="form-label">Annual Gross Income (₹)</label>
              <input className="form-input" type="number" value={income} onChange={e => setIncome(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Tax Regime</label>
              <select className="form-select" value={regime} onChange={e => setRegime(e.target.value)}>
                {REGIMES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Gross Income', value: fmt(income), color: 'var(--text-primary)' },
                { label: 'Taxable Income', value: fmt(taxableIncome), color: 'var(--text-primary)' },
                { label: 'Income Tax', value: fmt(tax), color: 'var(--danger)' },
                { label: 'Health & Education Cess 4%', value: fmt(cess), color: 'var(--danger)' },
              ].map(row => (
                <div key={row.label} className="flex-between" style={{ fontSize: 13 }}>
                  <span className="text-muted">{row.label}</span>
                  <span style={{ fontWeight: 600, color: row.color }}>{row.value}</span>
                </div>
              ))}
              <div className="divider" />
              <div className="flex-between">
                <span style={{ fontWeight: 700, fontSize: 14 }}>Total Tax Liability</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--danger)' }}>{fmt(total)}</span>
              </div>
              <div className="flex-between" style={{ fontSize: 12 }}>
                <span className="text-muted">Monthly TDS</span>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{fmt(monthly)}/mo</span>
              </div>
              <div className="flex-between" style={{ fontSize: 12 }}>
                <span className="text-muted">Effective Tax Rate</span>
                <span style={{ fontWeight: 600 }}>{rate}%</span>
              </div>
            </div>
            <div className="divider" />
            <div className="alert-box info">
              <span>💡</span>
              <span>Switch to Old Regime and maximize deductions to potentially save more tax.</span>
            </div>
          </div>

          <div>
            <div className="card">
              <div className="card-title">Tax Saving Opportunities</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {TAX_SAVINGS.map((ts, i) => {
                  const keys = ['80C', '80D', '24', 'NPS', '80TTA'];
                  const usedAmt = usedAmts[keys[i]] || 0;
                  const pct = Math.min((usedAmt / ts.limit) * 100, 100);
                  return (
                    <div key={ts.section} style={{ padding: '12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div className="flex-between" style={{ marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{ts.section}</span>
                        <span className="tag-badge">{fmt(ts.limit)}</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{ts.desc}</p>
                      <div className="progress-bar-wrap" style={{ marginBottom: 6 }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--primary)' }} />
                      </div>
                      <div className="flex-between" style={{ fontSize: 11 }}>
                        <span className="text-muted">Used: {fmt(usedAmt)}</span>
                        <span style={{ color: 'var(--warning)', fontSize: 11 }}>💡 {ts.tip}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
