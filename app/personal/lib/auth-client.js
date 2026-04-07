const STORAGE_KEY = 'finflow.auth';

const CANDIDATE_USER_KEYS = [
  'finflow.auth',
  'finflow_user',
  'finflowUser',
  'gatewayUser',
  'authUser',
  'user',
];

const CANDIDATE_AUTH_ID_KEYS = ['authId', 'userId', 'id', 'sub'];

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

  for (const key of CANDIDATE_USER_KEYS) {
    const raw = storage.getItem(key);
    const parsed = safeJsonParse(raw);
    if (parsed) {
      const user = sanitizeUser(parsed);
      if (user) return user;
    }
  }

  const plain = {};
  for (const key of CANDIDATE_AUTH_ID_KEYS) {
    const value = storage.getItem(key);
    if (value) plain[key] = value;
  }
  const email = storage.getItem('email');
  const name = storage.getItem('name');
  if (email) plain.email = email;
  if (name) plain.name = name;

  return sanitizeUser(plain);
}

function readFromQuery() {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const fromQuery = {
    authId: params.get('authId') || '',
    userId: params.get('userId') || '',
    id: params.get('id') || '',
    sub: params.get('sub') || '',
    email: params.get('email') || '',
    name: params.get('name') || '',
    token: params.get('token') || '',
    accessToken: params.get('accessToken') || '',
  };
  return sanitizeUser(fromQuery);
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
  }

  return merged;
}
