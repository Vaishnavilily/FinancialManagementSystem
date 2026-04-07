'use client';
import { useState } from 'react';
import TopBar from '@/components/TopBar';

const ALERTS = [
  { id: 1, type: 'danger', icon: '⚠', title: 'Budget Exceeded — Food & Dining', desc: 'You have spent ₹9,200 against a ₹8,000 budget this month.', time: '2 hours ago' },
  { id: 2, type: 'danger', icon: '⚠', title: 'Budget Exceeded — Shopping', desc: 'Shopping budget exceeded by ₹2,500. Consider pausing online purchases.', time: '5 hours ago' },
  { id: 3, type: 'warning', icon: '🔔', title: 'Budget Warning — Entertainment', desc: 'You have used 93% of your Entertainment budget (₹2,800 / ₹3,000).', time: '1 day ago' },
  { id: 4, type: 'warning', icon: '📅', title: 'Bill Due — Electricity', desc: 'Your electricity bill is estimated to be due in 3 days (approx ₹1,800).', time: '1 day ago' },
  { id: 5, type: 'warning', icon: '📅', title: 'Bill Due — Credit Card', desc: 'Credit card due date is 5 days away. Minimum payment: ₹2,500.', time: '2 days ago' },
  { id: 6, type: 'info', icon: '💡', title: 'Goal Milestone — Emergency Fund', desc: 'You are 45% of the way to your Emergency Fund goal! Keep it up.', time: '3 days ago' },
  { id: 7, type: 'success', icon: '✅', title: 'SIP Processed', desc: 'Your monthly SIP of ₹5,000 in Axis Bluechip has been processed.', time: '4 days ago' },
  { id: 8, type: 'info', icon: '📊', title: 'Monthly Report Ready', desc: 'Your April 2026 financial summary is ready to review.', time: '5 days ago' },
];

const TYPE_COLORS = {
  danger: { bg: 'var(--danger-light)', border: 'var(--danger)', text: '#991b1b' },
  warning: { bg: 'var(--warning-light)', border: 'var(--warning)', text: '#92400e' },
  success: { bg: 'var(--success-light)', border: 'var(--success)', text: '#166534' },
  info: { bg: 'var(--primary-light)', border: 'var(--primary)', text: 'var(--primary)' },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(ALERTS);
  const [filter, setFilter] = useState('all');

  const dismiss = (id) => setAlerts(a => a.filter(x => x.id !== id));
  const clearAll = () => setAlerts([]);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);
  const counts = { danger: alerts.filter(a => a.type === 'danger').length, warning: alerts.filter(a => a.type === 'warning').length };

  return (
    <>
      <TopBar title="Alerts & Notifications" />
      <div className="page-area">
        <div className="stats-grid-3">
          <div className="stat-card">
            <div className="stat-label">Total Alerts</div>
            <div className="stat-value">{alerts.length}</div>
            <div className="stat-sub neutral">Active notifications</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Critical Alerts</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{counts.danger}</div>
            <div className="stat-sub down">Budget exceeded</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Warnings</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{counts.warning}</div>
            <div className="stat-sub" style={{ color: 'var(--warning)' }}>Bills & thresholds</div>
          </div>
        </div>

        <div className="card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>All Alerts</span>
              <div className="chip-group">
                {['all', 'danger', 'warning', 'info', 'success'].map(f => (
                  <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {alerts.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear All</button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex-center" style={{ flexDirection: 'column', gap: 8, padding: 40 }}>
              <span style={{ fontSize: 40 }}>🎉</span>
              <p className="text-muted">All clear! No alerts right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(alert => {
                const c = TYPE_COLORS[alert.type];
                return (
                  <div key={alert.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', background: c.bg, border: `1px solid ${c.border}22`, borderLeft: `4px solid ${c.border}`, borderRadius: 8 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{alert.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: c.text, marginBottom: 3 }}>{alert.title}</div>
                      <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>{alert.desc}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{alert.time}</div>
                    </div>
                    <button onClick={() => dismiss(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, padding: '0 4px', flexShrink: 0 }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
