import { jwtVerify } from 'jose';

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET');
  }
  return new TextEncoder().encode(secret);
}

function extractBearerToken(request) {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header) return null;
  const m = header.match(/^\s*Bearer\s+(.+)\s*$/i);
  return m ? m[1] : null;
}

export async function requireAuth(request) {
  const token = extractBearerToken(request);
  if (!token) {
    return { ok: false, status: 401, error: 'Missing Authorization bearer token' };
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const authId = payload?.sub ? String(payload.sub) : '';
    if (!authId) {
      return { ok: false, status: 401, error: 'Invalid token (missing sub)' };
    }
    return { ok: true, authId, payload };
  } catch {
    return { ok: false, status: 401, error: 'Invalid or expired token' };
  }
}

