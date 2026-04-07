const STORAGE_KEY = 'finflow.auth';

function safeJsonParse(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function sanitizeUser(input = {}) {
  const authId =
    input.authId ||
    input.userId ||
    input.id ||
    input.sub;

  if (!authId) return null;

  return {
    authId: String(authId),
    email: input.email ? String(input.email).toLowerCase() : '',
    name: input.name ? String(input.name) : '',
    token: input.token ? String(input.token) : (input.accessToken ? String(input.accessToken) : ''),
  };
}

function readFromStorage(storage) {
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse(raw);
  return parsed ? sanitizeUser(parsed) : null;
}

function readFromQuery() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return sanitizeUser({
    authId: params.get('authId') || '',
    email: params.get('email') || '',
    name: params.get('name') || '',
    token: params.get('token') || '',
    accessToken: params.get('accessToken') || '',
  });
}

export function resolveClientAuthUser() {
  if (typeof window === 'undefined') return null;

  const fromQuery = readFromQuery();
  const fromLocal = readFromStorage(window.localStorage);
  const fromSession = readFromStorage(window.sessionStorage);

  const merged = sanitizeUser({
    ...(fromLocal || {}),
    ...(fromSession || {}),
    ...(fromQuery || {}),
  });

  if (merged) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    // Clean URL to remove token from address bar.
    if (fromQuery?.token) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  return merged;
}

export function getStoredToken() {
  if (typeof window === 'undefined') return '';
  const user = readFromStorage(window.localStorage) || readFromStorage(window.sessionStorage);
  return user?.token ? String(user.token) : '';
}

