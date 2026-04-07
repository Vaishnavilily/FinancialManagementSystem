'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import { useAuthUser } from '@/lib/useAuthUser';
import { authFetch } from '@/lib/auth-fetch';

const CATEGORIES = ['Housing & Rent', 'Food & Dining', 'Transport', 'Entertainment', 'Shopping', 'Healthcare', 'Investments', 'Utilities', 'Education', 'Other'];
const COLORS = ['#004c8c','#16a34a','#dc2626','#7c3aed','#d97706','#0891b2','#be185d','#0f172a','#ea580c','#64748b'];
const THRESHOLDS = [60, 70, 75, 80, 85, 90];

export default function BudgetPage() {
  const { authUser, authReady } = useAuthUser();
  const [budgets, setBudgets] = useState(null);
  const [form, setForm] = useState({ category: CATEGORIES[0], limit: '', alertThreshold: 80 });
  const [saving, setSaving] = useState(false);

  const fetchBudgets = async () => {
    if (!authUser?.authId) {
      setBudgets([]);
      return;
    }

    try {
      const res = await authFetch('/api/budgets', authUser);
      const data = await res.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!authReady || !authUser?.authId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch('/api/budgets', authUser);
        const data = await res.json();
        if (!cancelled) setBudgets(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setBudgets([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, authUser]);

  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  const loading = Boolean(authReady && authUser?.authId && budgets === null);
  const totalBudget = safeBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = safeBudgets.reduce((s, b) => s + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.limit) return;
    if (!authUser?.authId) return;
    setSaving(true);
    await authFetch('/api/budgets', authUser, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        limit: Number(form.limit),
        alertThreshold: Number(form.alertThreshold),
      }),
    });
    setForm({ category: CATEGORIES[0], limit: '', alertThreshold: 80 });
    await fetchBudgets();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!authUser?.authId) return;
    await authFetch(`/api/budgets/${id}`, authUser, { method: 'DELETE' });
    await fetchBudgets();
  };

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  const overspent = safeBudgets.filter(b => b.spent > b.limit);

  return (
    <>
      <TopBar title="Budget Manager" />
      <div className="page-area">
        <div className="stats-grid-3">
          <div className="stat-card">
            <div className="stat-label">Total Budget</div>
            <div className="stat-value">{fmt(totalBudget)}</div>
            <div className="stat-sub neutral">Monthly limit</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Spent So Far</div>
            <div className="stat-value">{fmt(totalSpent)}</div>
            <div className="stat-sub" style={{ color: totalBudget > 0 ? (totalSpent / totalBudget > 0.9 ? 'var(--danger)' : 'var(--warning)') : 'var(--text-muted)' }}>
              {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% used` : '0% used'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Remaining</div>
            <div className="stat-value" style={{ color: remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>{fmt(Math.abs(remaining))}</div>
            <div className="stat-sub" style={{ color: remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>{remaining >= 0 ? 'Safe to spend' : 'Over budget!'}</div>
          </div>
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-title">Category Budgets</div>
            {loading ? <p className="text-muted">Loading...</p> : safeBudgets.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 13 }}>No budgets yet. Add your first budget category →</p>
            ) : (
              safeBudgets.map((b, i) => {
                const pct = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
                const over = b.spent > b.limit;
                const color = over ? '#dc2626' : COLORS[i % COLORS.length];
                return (
                  <div key={b._id} style={{ marginBottom: 18 }}>
                    <div className="flex-between" style={{ marginBottom: 5 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{b.category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12.5, color: over ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: over ? 700 : 400 }}>
                          {fmt(b.spent)} / {fmt(b.limit)} {over && <span>⚠ Over</span>}
                        </span>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)} style={{ padding: '3px 8px', fontSize: 11 }}>✕</button>
                      </div>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title">Add Budget Category</div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Limit (₹)</label>
                  <input className="form-input" type="number" placeholder="e.g. 5000" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Alert Threshold</label>
                  <select className="form-select" value={form.alertThreshold} onChange={e => setForm({ ...form, alertThreshold: e.target.value })}>
                    {THRESHOLDS.map(t => <option key={t} value={t}>{t}% used</option>)}
                  </select>
                </div>
                <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
                  {saving ? 'Adding...' : '+ Add Budget'}
                </button>
              </form>
            </div>

            {overspent.length > 0 && (
              <div className="card">
                <div className="card-title">⚠ Overspending Summary</div>
                {overspent.map(b => (
                  <div key={b._id} className="alert-box danger" style={{ marginBottom: 8 }}>
                    <span>⚠</span>
                    <span><strong>{b.category}</strong> exceeded by {fmt(b.spent - b.limit)} this month.</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
