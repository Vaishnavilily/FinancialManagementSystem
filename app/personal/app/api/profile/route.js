import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user';
import { requireAuth } from '@/lib/jwt';

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizePayload(payload = {}) {
  const authId =
    payload.authId ||
    payload.userId ||
    payload.id ||
    payload.sub;

  return {
    authId: authId ? String(authId) : '',
    name: payload.name ? String(payload.name) : '',
    email: payload.email ? String(payload.email).toLowerCase() : '',
    phone: payload.phone ? String(payload.phone) : '',
    dob: payload.dob || null,
    city: payload.city ? String(payload.city) : '',
    occupation: payload.occupation ? String(payload.occupation) : '',
    annualIncome: toNumber(payload.annualIncome),
  };
}

function serializeUser(userDoc) {
  return {
    authId: userDoc.authId,
    name: userDoc.name || '',
    email: userDoc.email || '',
    phone: userDoc.phone || '',
    dob: userDoc.dob || null,
    city: userDoc.city || '',
    occupation: userDoc.occupation || '',
    annualIncome: userDoc.annualIncome || 0,
    plan: userDoc.plan || 'Individual',
    status: userDoc.status || 'active',
    createdAt: userDoc.createdAt,
  };
}

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();
    const payload = normalizePayload({
      authId: auth.authId,
    });

    let user = await User.findOne({ authId: payload.authId });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        authId: payload.authId,
        lastLoginAt: new Date(),
      });
      isNewUser = true;
    } else {
      const updates = { lastLoginAt: new Date() };
      user = await User.findByIdAndUpdate(user._id, updates, { new: true, runValidators: true });
    }

    return NextResponse.json({ isNewUser, profile: serializeUser(user) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();
    const body = await request.json();
    const payload = normalizePayload({ ...(body || {}), authId: auth.authId });

    const updates = {
      name: payload.name,
      email: payload.email || undefined,
      phone: payload.phone,
      city: payload.city,
      occupation: payload.occupation,
      annualIncome: payload.annualIncome,
    };

    if (payload.dob) updates.dob = payload.dob;

    const user = await User.findOneAndUpdate(
      { authId: payload.authId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: serializeUser(user) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
