// api/auth/login.js  — Finflow_All / Gateway
//
// Fix: removed the broken jwt.sign call with "name: ..." placeholder.
// The response now returns user: { id, email, firstName, lastName }
// so the frontend redirectSuccess() can build the authUser object correctly.

import { getDb } from '../_lib/db.js';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET');
  }
  return new TextEncoder().encode(secret);
}

function resolveUserCollectionName(userType) {
  if (userType === 'individual') return 'individual_users';
  if (userType === 'sme') return 'sme_users';
  return null;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, userType } = req.body || {};

  if (!email || !password || !userType) {
    return res.status(400).json({ success: false, message: 'Email, password and account type are required.' });
  }

  const collectionName = resolveUserCollectionName(userType);
  if (!collectionName) {
    return res.status(400).json({ success: false, message: 'Invalid account type.' });
  }

  try {
    const db = await getDb();
    const user = await db.collection(collectionName).findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userId = user._id.toString();
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

    const token = await new SignJWT({
      email: user.email,
      name,
      userType,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecretKey());

    // Return user data + JWT. Apps must verify the JWT and derive authId from `sub`.
    return res.status(200).json({
      success: true,
      userType,
      token,
      user: {
        id: userId,          // authId (also equals JWT `sub`)
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Server error. Please try again.'
        : (err?.message || 'Server error. Please try again.');
    return res.status(500).json({ success: false, message });
  }
}