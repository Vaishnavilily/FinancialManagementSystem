import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Budget from '@/lib/models/Budget';
import User from '@/lib/models/user';
import { requireAuth } from '@/lib/jwt';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();
    const authId = auth.authId;

    const budgets = await Budget.find({ ownerAuthId: authId }).sort({ createdAt: -1 });

    if (budgets.length === 0) {
      const legacyUser = await User.findOne({ authId }).populate('budgets');
      if (legacyUser?.budgets?.length) {
        const ids = legacyUser.budgets.map((item) => item._id);
        await Budget.updateMany(
          { _id: { $in: ids }, ownerAuthId: { $exists: false } },
          { $set: { ownerAuthId: authId } }
        );
        return NextResponse.json(legacyUser.budgets);
      }
    }

    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();
    const body = await request.json();
    const { authId: _ignoredAuthId, ...budgetData } = body || {};
    const authId = auth.authId;

    const user = await User.findOne({ authId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const budget = await Budget.create({ ...budgetData, ownerAuthId: authId });
    user.budgets.push(budget._id);
    await user.save();

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

