// lib/auth.js  — place this in your personal Next.js app (Finflow_Individual / personal folder)
//
// This is the single source of truth for "who is logged in".
// It checks (in order):
//   1. URL params ?authId=... (set by the gateway on redirect)
//   2. localStorage finflow.auth (persisted from a previous session on same domain)
// If found, it cleans the URL and returns the auth object.
// If not found, returns null — the dashboard shows the "sign in" error.

export function getAuthFromUrl() {
    if (typeof window === 'undefined') return null;
  
    const params = new URLSearchParams(window.location.search);
    const authId = params.get('authId');
    const email = params.get('email') ? decodeURIComponent(params.get('email')) : null;
  
    if (authId) {
      const authUser = { authId, email: email || '', userType: 'individual' };
      // Persist it so subsequent page navigations don't need the URL param
      localStorage.setItem('finflow.auth', JSON.stringify(authUser));
      // Clean the URL (remove ?authId=...&email=... from the address bar)
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      return authUser;
    }
  
    return null;
  }
  
  export function getStoredAuth() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('finflow.auth');
      if (!raw) return null;
      const auth = JSON.parse(raw);
      if (!auth?.authId) return null;
      return auth;
    } catch {
      return null;
    }
  }
  
  export function getAuth() {
    return getAuthFromUrl() || getStoredAuth();
  }
  
  export function clearAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('finflow.auth');
  }