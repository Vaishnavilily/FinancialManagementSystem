'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import { useAuthUser } from '@/lib/useAuthUser';
import { authFetch } from '@/lib/auth-fetch';

const GOAL_CATS = ['Savings', 'Travel', 'Education', 'Emergency Fund', 'Retirement', 'Electronics', 'Vehicle', 'Home', 'Investment', 'Other'];
const COLORS = ['#004c8c','#16a34a','#7c3aed','#d97706','#0891b2','#dc2626','#be185d','#ea580c'];

export default function GoalsPage() {
  const { authUser, authReady } = useAuthUser();
  const [goals, setGoals] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', category: GOAL_CATS[0], deadline: '' });
  const [saving, setSaving] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [depositId, setDepositId] = useState(null);
  const [depositAmt, setDepositAmt] = useState('');

  const fetchGoals = async () => {
    if (!authUser?.authId) {
      setGoals([]);
      return;
    }
    const res = await authFetch('/api/goals', authUser);
    const data = await res.json();
    setGoals(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!authReady || !authUser?.authId) return;
    let cancelled = false;
    (async () => {
      const res = await authFetch('/api/goals', authUser);
      const data = await res.json();
      if (!cancelled) setGoals(Array.isArray(data) ? data : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.targetAmount) return;
    if (!authUser?.authId) return;
    setSaving(true);
    await authFetch('/api/goals', authUser, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
      }),
    });
    setForm({ name: '', targetAmount: '', currentAmount: '', category: GOAL_CATS[0], deadline: '' });
    setAddModal(false);
    await fetchGoals();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!authUser?.authId) return;
    await authFetch(`/api/goals/${id}`, authUser, { method: 'DELETE' });
    await fetchGoals();
  };

  const handleDeposit = async (id) => {
    if (!depositAmt) return;
    if (!authUser?.authId) return;
    const goal = goals.find(g => g._id === id);
    await authFetch(`/api/goals/${id}`, authUser, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentAmount: goal.currentAmount + Number(depositAmt) }),
    });
    setDepositId(null);
    setDepositAmt('');
    await fetchGoals();
  };

  const safeGoals = Array.isArray(goals) ? goals : [];
  const loading = Boolean(authReady && authUser?.authId && goals === null);
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const totalGoals = safeGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = safeGoals.reduce((s, g) => s + g.currentAmount, 0);
  const completed = safeGoals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <>
      <TopBar title="Goal Tracker" />
      <div className="page-area">
        <div className="stats-grid-3">
          <div className="stat-card">
            <div className="stat-label">Total Goal Target</div>
            <div className="stat-value">{fmt(totalGoals)}</div>
            <div className="stat-sub neutral">{safeGoals.length} active goals</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Saved</div>
            <div className="stat-value">{fmt(totalSaved)}</div>
            <div className="stat-sub up">{totalGoals > 0 ? ((totalSaved / totalGoals) * 100).toFixed(1) : 0}% of all goals</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Goals Completed</div>
            <div className="stat-value">{completed}</div>
            <div className="stat-sub" style={{ color: 'var(--success)' }}>of {safeGoals.length} total</div>
          </div>
        </div>

        <div className="flex-between mb-20">
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>My Goals</h2>
          <button className="btn btn-primary" onClick={() => setAddModal(true)}>+ Add Goal</button>
        </div>

        {loading ? <p className="text-muted">Loading...</p> : safeGoals.length === 0 ? (
          <div className="card flex-center" style={{ flexDirection: 'column', gap: 12, padding: 40 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            <p className="text-muted">No goals yet. Add your first financial goal!</p>
            <button className="btn btn-primary" onClick={() => setAddModal(true)}>+ Add Goal</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {safeGoals.map((g, i) => {
              const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
              const color = COLORS[i % COLORS.length];
              const done = g.currentAmount >= g.targetAmount;
              return (
                <div className="card" key={g._id}>
                  <div className="flex-between" style={{ marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{g.name}</div>
                      <span className="badge" style={{ background: color + '18', color, marginTop: 4 }}>{g.category}</span>
                    </div>
                    {done && <span className="badge badge-income">✓ Completed</span>}
                  </div>
                  <div className="flex-between" style={{ marginBottom: 6, fontSize: 13 }}>
                    <span className="text-muted">Saved</span>
                    <span style={{ fontWeight: 700, color }}>{fmt(g.currentAmount)} <span className="text-muted fw-normal">/ {fmt(g.targetAmount)}</span></span>
                  </div>
                  <div className="progress-bar-wrap" style={{ marginBottom: 10 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div className="flex-between" style={{ marginBottom: 12, fontSize: 12 }}>
                    <span className="text-muted">{pct.toFixed(1)}% complete</span>
                    {g.deadline && <span className="text-muted">Due: {new Date(g.deadline).toLocaleDateString('en-IN')}</span>}
                  </div>
                  {depositId === g._id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input className="form-input" type="number" placeholder="Amount" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} style={{ flex: 1 }} />
                      <button className="btn btn-primary btn-sm" onClick={() => handleDeposit(g._id)}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDepositId(null)}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => { setDepositId(g._id); setDepositAmt(''); }}>+ Add Funds</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g._id)}>Delete</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {addModal && (
          <div className="modal-overlay" onClick={() => setAddModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Add New Goal</div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Goal Name</label>
                  <input className="form-input" placeholder="e.g. Emergency Fund" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {GOAL_CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Target Amount (₹)</label>
                    <input className="form-input" type="number" placeholder="100000" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Already Saved (₹)</label>
                    <input className="form-input" type="number" placeholder="0" value={form.currentAmount} onChange={e => setForm({ ...form, currentAmount: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Date (optional)</label>
                  <input className="form-input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Goal'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
