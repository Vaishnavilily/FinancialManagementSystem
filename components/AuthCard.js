'use client';

import { useMemo, useState } from 'react';
import Logo from './Logo';
import PasswordStrength from './PasswordStrength';

const APPS = {
  individual: 'https://finflow-all.vercel.app/dashboard',
  sme: 'https://finflow-all.vercel.app/'
};

const TYPE_LABELS = {
  individual: 'Individual',
  sme: 'SME Business'
};

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePassword(password) {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters.' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password needs at least one uppercase letter.' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password needs at least one lowercase letter.' };
  if (!/\d/.test(password)) return { valid: false, message: 'Password needs at least one digit.' };
  if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, message: 'Password needs at least one special character.' };
  return { valid: true };
}

function getBadgeLabel(type) {
  return `${TYPE_LABELS[type] ?? TYPE_LABELS.individual} Account`;
}

export default function AuthCard() {
  const [view, setView] = useState('choose');
  const [currentType, setCurrentType] = useState('individual');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginAlert, setLoginAlert] = useState(null);
  const [registerAlert, setRegisterAlert] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Login successful!');
  const [successMessage, setSuccessMessage] = useState('Redirecting you to your dashboard…');

  const loginSubtitle = currentType === 'sme'
    ? 'Sign in to manage your business finances'
    : 'Sign in to manage your personal finances';

  const passwordRules = useMemo(() => ({
    len: registerPassword.length >= 8,
    upper: /[A-Z]/.test(registerPassword),
    lower: /[a-z]/.test(registerPassword),
    digit: /\d/.test(registerPassword),
    special: /[^A-Za-z0-9]/.test(registerPassword)
  }), [registerPassword]);

  const handleClearLoginAlert = () => setLoginAlert(null);
  const handleClearRegisterAlert = () => setRegisterAlert(null);

  const handleSelectType = (type) => {
    setCurrentType(type);
    handleClearLoginAlert();
    setLoginEmail('');
    setLoginPassword('');
    setView('login');
  };

  const handleSelectTypeForCreate = (type) => {
    setCurrentType(type);
    handleClearRegisterAlert();
    setRegisterFirstName('');
    setRegisterLastName('');
    setRegisterPhone('');
    setRegisterEmail('');
    setRegisterPassword('');
    setShowRegisterPassword(false);
    setView('register');
  };

  const handleLogin = async () => {
    handleClearLoginAlert();

    if (!loginEmail || !loginPassword) {
      setLoginAlert({ type: 'error', message: 'Please enter your email and password.' });
      return;
    }

    if (!validateEmail(loginEmail)) {
      setLoginAlert({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setLoginLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, userType: currentType })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        redirectSuccess(currentType, false, data.user, data.token);
      } else {
        setLoginAlert({
          type: 'error',
          message: data.message || 'Invalid email or password. Please try again.'
        });
      }
    } catch (error) {
      console.error('API error:', error);
      setLoginAlert({
        type: 'error',
        message: 'Could not connect to the authentication server. Please try again.'
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    handleClearRegisterAlert();

    if (!registerFirstName || !registerLastName) {
      setRegisterAlert({ type: 'error', message: 'Please enter your first and last name.' });
      return;
    }

    if (!registerPhone) {
      setRegisterAlert({ type: 'error', message: 'Please enter your phone number.' });
      return;
    }

    if (!registerEmail || !validateEmail(registerEmail)) {
      setRegisterAlert({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    const passwordCheck = validatePassword(registerPassword);
    if (!passwordCheck.valid) {
      setRegisterAlert({ type: 'error', message: passwordCheck.message });
      return;
    }

    setRegisterLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: registerFirstName,
          lastName: registerLastName,
          phone: registerPhone,
          email: registerEmail,
          password: registerPassword,
          userType: currentType
        })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        redirectSuccess(currentType, true, data.user, data.token);
      } else {
        setRegisterAlert({
          type: 'error',
          message: data.message || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('API error:', error);
      setRegisterAlert({
        type: 'error',
        message: 'Could not connect to the authentication server. Please try again.'
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  const redirectSuccess = (type, isNew, user, token) => {
    setSuccessTitle(isNew ? 'Account created!' : 'Login successful!');
    setSuccessMessage(
      `Redirecting you to ${type === 'sme' ? 'FinFlow SME' : 'FinFlow Individual'}…`
    );
    setView('success');

    const authUser = {
      authId: user?.id ? String(user.id) : user?._id ? String(user._id) : '',
      email: user?.email ? String(user.email).toLowerCase() : '',
      name: [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim(),
      userType: type,
      token: token ? String(token) : ''
    };

    if (authUser.authId) {
      localStorage.setItem('finflow.auth', JSON.stringify(authUser));
    }

    const targetPath = APPS[type] || APPS.individual;
    const targetUrl = new URL(targetPath);

    if (authUser.authId) targetUrl.searchParams.set('authId', authUser.authId);
    if (authUser.email) targetUrl.searchParams.set('email', authUser.email);
    if (authUser.name) targetUrl.searchParams.set('name', authUser.name);
    if (authUser.token) targetUrl.searchParams.set('token', authUser.token);

    setTimeout(() => {
      window.location.href = targetUrl.toString();
    }, 2200);
  };

  return (
    <div className="card">
      <Logo />

      <div className={`view ${view === 'choose' ? 'active' : ''}`}>
        <h2>Welcome back</h2>
        <p className="subtitle">Select your account type to continue</p>
        <div className="user-type-grid">
          <button
            type="button"
            className="user-type-btn"
            onClick={() => handleSelectType('individual')}
          >
            <div className="icon">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="7" r="4" />
                <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
              </svg>
            </div>
            <div className="label">Individual</div>
            <div className="desc">Personal finance tracking</div>
          </button>
          <button
            type="button"
            className="user-type-btn"
            onClick={() => handleSelectType('sme')}
          >
            <div className="icon">
              <svg viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
            </div>
            <div className="label">SME</div>
            <div className="desc">Business & accounting</div>
          </button>
        </div>
        <div className="divider">
          <span>or</span>
        </div>
        <button type="button" className="create-link-btn" onClick={() => setView('createType')}>
          + Create new account
        </button>
      </div>

      <div className={`view ${view === 'login' ? 'active' : ''}`}>
        <button type="button" className="back-btn" onClick={() => setView('choose')}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <span className={`badge ${currentType}`}>{getBadgeLabel(currentType)}</span>
        <h2>Sign in</h2>
        <p className="subtitle">{loginSubtitle}</p>
        {loginAlert && (
          <div className={`alert alert-${loginAlert.type}`}>
            {loginAlert.type === 'error' ? (
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            <span>{loginAlert.message}</span>
          </div>
        )}
        <form onSubmit={(event) => { event.preventDefault(); handleLogin(); }}>
          <div className="field-group">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field-group">
            <label htmlFor="login-password">Password</label>
            <div className="pw-wrapper">
              <input
                id="login-password"
                type={showLoginPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowLoginPassword((current) => !current)}
              >
                <svg viewBox="0 0 24 24">
                  {showLoginPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loginLoading}>
            {loginLoading && <div className="spinner" />}
            <span>{loginLoading ? 'Signing in…' : 'Sign in'}</span>
          </button>
        </form>
        <div className="footer-link">
          Don&apos;t have an account?{' '}
          <a href="#" onClick={(event) => { event.preventDefault(); setView('createType'); }}>
            Create one
          </a>
        </div>
      </div>

      <div className={`view ${view === 'createType' ? 'active' : ''}`}>
        <button type="button" className="back-btn" onClick={() => setView('choose')}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h2>Create account</h2>
        <p className="subtitle">What type of account do you need?</p>
        <div className="user-type-grid">
          <button
            type="button"
            className="user-type-btn"
            onClick={() => handleSelectTypeForCreate('individual')}
          >
            <div className="icon">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="7" r="4" />
                <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
              </svg>
            </div>
            <div className="label">Individual</div>
            <div className="desc">Personal finance</div>
          </button>
          <button
            type="button"
            className="user-type-btn"
            onClick={() => handleSelectTypeForCreate('sme')}
          >
            <div className="icon">
              <svg viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
            </div>
            <div className="label">SME</div>
            <div className="desc">Business & accounting</div>
          </button>
        </div>
      </div>

      <div className={`view ${view === 'register' ? 'active' : ''}`}>
        <button type="button" className="back-btn" onClick={() => setView('createType')}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <span className={`badge ${currentType}`}>{getBadgeLabel(currentType)}</span>
        <h2>Create account</h2>
        <p className="subtitle">Fill in your details to get started</p>
        {registerAlert && (
          <div className={`alert alert-${registerAlert.type}`}>
            {registerAlert.type === 'error' ? (
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            <span>{registerAlert.message}</span>
          </div>
        )}
        <form onSubmit={(event) => { event.preventDefault(); handleRegister(); }}>
          <div className="field-row">
            <div className="field-group">
              <label htmlFor="reg-firstname">First name</label>
              <input
                id="reg-firstname"
                type="text"
                value={registerFirstName}
                onChange={(event) => setRegisterFirstName(event.target.value)}
                placeholder="Jane"
              />
            </div>
            <div className="field-group">
              <label htmlFor="reg-lastname">Last name</label>
              <input
                id="reg-lastname"
                type="text"
                value={registerLastName}
                onChange={(event) => setRegisterLastName(event.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="reg-phone">Phone number</label>
            <input
              id="reg-phone"
              type="tel"
              value={registerPhone}
              onChange={(event) => setRegisterPhone(event.target.value)}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
          <div className="field-group">
            <label htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              type="email"
              value={registerEmail}
              onChange={(event) => setRegisterEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field-group">
            <label htmlFor="reg-password">Create password</label>
            <div className="pw-wrapper">
              <input
                id="reg-password"
                type={showRegisterPassword ? 'text' : 'password'}
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowRegisterPassword((current) => !current)}
              >
                <svg viewBox="0 0 24 24">
                  {showRegisterPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            <PasswordStrength password={registerPassword} />
          </div>
          <button type="submit" className="btn-primary" disabled={registerLoading}>
            {registerLoading && <div className="spinner" />}
            <span>{registerLoading ? 'Creating account…' : 'Create account'}</span>
          </button>
        </form>
        <div className="footer-link">
          Already have an account?{' '}
          <a href="#" onClick={(event) => { event.preventDefault(); setView('login'); }}>
            Sign in
          </a>
        </div>
      </div>

      <div className={`view ${view === 'success' ? 'active' : ''}`}>
        <div className="success-icon">
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="success-title">{successTitle}</h2>
        <p className="subtitle success-msg">{successMessage}</p>
        <div className="success-state">
          <div className="spinner" />
        </div>
      </div>
    </div>
  );
}
