'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import { useAuthUser } from '@/lib/useAuthUser';
import { authFetch } from '@/lib/auth-fetch';

const CATEGORIES = ['Income', 'Food', 'Housing', 'Transport', 'Shopping', 'Investment', 'Utilities', 'Healthcare', 'Entertainment', 'Loan', 'Education', 'Other'];

const categoryBadge = (cat) => {
  const m = { Income: 'income', Food: 'food', Loan: 'loan', Investment: 'invest', Utilities: 'utility', Shopping: 'shopping', Entertainment: 'entertain', Transport: 'transport', Healthcare: 'health' };
  return m[cat] || 'other';
};

export default function TransactionsPage() {
  const { authUser, authReady } = useAuthUser();
  const [transactions, setTransactions] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ description: '', category: 'Food', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0] });

  const fetchTxns = async () => {
    if (!authUser?.authId) {
      setTransactions([]);
      return;
    }
    const res = await authFetch('/api/transactions', authUser);
    const data = await res.json();
    setTransactions(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!authReady || !authUser?.authId) return;
    let cancelled = false;
    (async () => {
      const res = await authFetch('/api/transactions', authUser);
      const data = await res.json();
      if (!cancelled) setTransactions(Array.isArray(data) ? data : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, authUser]);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const loading = Boolean(authReady && authUser?.authId && transactions === null);
  const filtered = filter === 'all' ? safeTransactions : safeTransactions.filter(t => t.type === filter);

  const totalCredits = safeTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalDebits = safeTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netFlow = totalCredits - totalDebits;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    if (!authUser?.authId) return;
    setSaving(true);
    await authFetch('/api/transactions', authUser, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    setForm({ description: '', category: 'Food', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0] });
    setShowModal(false);
    await fetchTxns();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!authUser?.authId) return;
    await authFetch(`/api/transactions/${id}`, authUser, { method: 'DELETE' });
    await fetchTxns();
  };

  const exportCSV = () => {
    const rows = [['Date', 'Description', 'Category', 'Type', 'Amount']];
    filtered.forEach(t => rows.push([new Date(t.date).toLocaleDateString('en-IN'), t.description, t.category, t.type, t.amount]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'transactions.csv';
    a.click();
  };

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <>
      <TopBar title="Transactions" />
      <div className="page-area">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Credits</div>
            <div className="stat-value">{fmt(totalCredits)}</div>
            <div className="stat-sub up">This month</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Debits</div>
            <div className="stat-value">{fmt(totalDebits)}</div>
            <div className="stat-sub down">This month</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{safeTransactions.length}</div>
            <div className="stat-sub neutral">This month</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Net Flow</div>
            <div className="stat-value" style={{ color: netFlow >= 0 ? 'var(--success)' : 'var(--danger)' }}>{fmt(Math.abs(netFlow))}</div>
            <div className="stat-sub" style={{ color: netFlow >= 0 ? 'var(--success)' : 'var(--danger)' }}>Cash flow</div>
          </div>
        </div>

        <div className="card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>All Transactions</span>
              <div className="chip-group">
                {['all', 'income', 'expense'].map(f => (
                  <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={exportCSV}>Export CSV</button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Transaction</button>
            </div>
          </div>

          {loading ? <p className="text-muted">Loading...</p> : filtered.length === 0 ? (
            <div className="flex-center" style={{ flexDirection: 'column', gap: 8, padding: 40 }}>
              <p className="text-muted">No transactions found. Add one to get started!</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Transaction</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t._id}>
                      <td className="text-muted">{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                      <td style={{ fontWeight: 500 }}>{t.description}</td>
                      <td><span className={`badge badge-${categoryBadge(t.category)}`}>{t.category}</span></td>
                      <td style={{ fontWeight: 700, color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Add Transaction</div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" placeholder="e.g. Salary Credit" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input className="form-input" type="number" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
