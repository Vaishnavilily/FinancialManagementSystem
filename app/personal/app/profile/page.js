'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import Link from 'next/link';
import { useAuthUser } from '@/lib/useAuthUser';
import { authFetch } from '@/lib/auth-fetch';

const PROFILE = {
  name: '',
  email: '',
  phone: '',
  dob: '',
  city: '',
  occupation: '',
  annualIncome: 0,
};

const STATS = [
  { label: 'Total Transactions', value: '—', icon: '↕' },
  { label: 'Active Goals', value: '—', icon: '🎯' },
  { label: 'Budget Categories', value: '—', icon: '📊' },
  { label: 'Member Since', value: 'Apr 2026', icon: '📅' },
];

const MENU_ITEMS = [
  { icon: '👤', label: 'Personal Information', desc: 'Update your name, email, phone, and address' },
  { icon: '🔒', label: 'Security & Password', desc: 'Change password and manage 2FA settings' },
  { icon: '🔔', label: 'Notification Preferences', desc: 'Control which alerts you receive and how', href: '/alerts' },
  { icon: '💳', label: 'Linked Accounts', desc: 'Connect bank accounts and payment methods' },
  { icon: '📤', label: 'Export Data', desc: 'Download all your financial data as CSV or PDF' },
  { icon: '🎨', label: 'Appearance', desc: 'Theme and display preferences' },
];

export default function ProfilePage() {
  const { authUser, authReady } = useAuthUser();
  const [editing, setEditing] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(PROFILE);
  const [form, setForm] = useState(PROFILE);

  useEffect(() => {
    const loadProfile = async () => {
      if (!authReady) return;
      if (!authUser?.authId) {
        return;
      }

      const res = await authFetch('/api/profile', authUser);
      const data = await res.json();
      const nextProfile = data?.profile
        ? { ...PROFILE, ...data.profile, dob: data.profile.dob ? new Date(data.profile.dob).toISOString().split('T')[0] : '' }
        : { ...PROFILE };

      setProfile(nextProfile);
      setForm(nextProfile);
      setProfileLoaded(true);
    };

    loadProfile();
  }, [authReady, authUser]);

  const loading = Boolean(authReady && authUser?.authId && !profileLoaded);

  const handleSave = async () => {
    if (!authUser?.authId) return;
    setSaving(true);
    const res = await authFetch('/api/profile', authUser, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form }),
    });
    const data = await res.json();
    const saved = data?.profile
      ? { ...PROFILE, ...data.profile, dob: data.profile.dob ? new Date(data.profile.dob).toISOString().split('T')[0] : '' }
      : form;
    setProfile(saved);
    setForm(saved);
    setSaving(false);
    setEditing(false);
  };

  return (
    <>
      <TopBar title="My Profile" />
      <div className="page-area">

        {loading ? (
          <div className="card">
            <p className="text-muted">Loading profile...</p>
          </div>
        ) : !authUser?.authId ? (
          <div className="card">
            <p className="text-muted">We could not identify your login session. Please sign in again from the gateway app.</p>
          </div>
        ) : (
        <>
        {/* Profile Header Card */}
        <div className="card mb-20" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '28px 28px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), #0070cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: 'white', flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,76,140,0.25)'
          }}>
            {(profile.name || '?').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{profile.name || '—'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{profile.email}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>Individual Plan</span>
              <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>✓ Active</span>
              <span className="badge badge-other">{profile.city || '—'}</span>
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => { setEditing(!editing); setForm(profile); }}>
            {editing ? 'Cancel' : '✏ Edit Profile'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="stats-grid mb-20">
          {STATS.map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0' }}>{s.value}</div>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          {/* Personal Info Card */}
          <div className="card">
            <div className="card-title">
              Personal Information
              {editing && <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>● Editing</span>}
            </div>

            {editing ? (
              <div>
                {[
                  { key: 'name', label: 'Full Name', type: 'text' },
                  { key: 'email', label: 'Email Address', type: 'email' },
                  { key: 'phone', label: 'Phone Number', type: 'text' },
                  { key: 'dob', label: 'Date of Birth', type: 'date' },
                  { key: 'city', label: 'City', type: 'text' },
                  { key: 'occupation', label: 'Occupation', type: 'text' },
                  { key: 'annualIncome', label: 'Annual Income (₹)', type: 'number' },
                ].map(f => (
                  <div className="form-group" key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type={f.type} value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setEditing(false)}>Discard</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Full Name', value: profile.name },
                  { label: 'Email', value: profile.email },
                  { label: 'Phone', value: profile.phone },
                  {
                    label: 'Date of Birth',
                    value: profile.dob
                      ? new Date(profile.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                      : '—'
                  },
                  { label: 'City', value: profile.city },
                  { label: 'Occupation', value: profile.occupation },
                  { label: 'Annual Income', value: `₹${profile.annualIncome}` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title">Account Settings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {MENU_ITEMS.map(item => (
                  item.href ? (
                    <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize: 20, width: 36, height: 36, background: 'var(--primary-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>›</span>
                      </div>
                    </Link>
                  ) : (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 20, width: 36, height: 36, background: 'var(--primary-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>›</span>
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #fff5f5, #fff)', border: '1px solid #fecaca' }}>
              <div className="card-title" style={{ color: 'var(--danger)' }}>Danger Zone</div>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
                Permanently delete your account and all financial data. This action cannot be undone.
              </p>
              <button className="btn btn-danger btn-block" style={{ background: 'var(--danger)', color: 'white' }}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </>
  );
}
