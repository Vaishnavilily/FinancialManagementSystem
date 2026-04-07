export function authFetch(path, authUser, options = {}) {
  const headers = new Headers(options.headers || {});
  if (authUser?.token) {
    headers.set('Authorization', `Bearer ${authUser.token}`);
  }
  return fetch(path, { ...options, headers });
}

