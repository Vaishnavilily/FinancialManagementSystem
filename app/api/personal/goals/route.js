import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/lib/models/Goal';
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

    const goals = await Goal.find({ ownerAuthId: authId }).sort({ createdAt: -1 });

    if (goals.length === 0) {
      const legacyUser = await User.findOne({ authId }).populate('goals');
      if (legacyUser?.goals?.length) {
        const ids = legacyUser.goals.map((item) => item._id);
        await Goal.updateMany(
          { _id: { $in: ids }, ownerAuthId: { $exists: false } },
          { $set: { ownerAuthId: authId } }
        );
        return NextResponse.json(legacyUser.goals);
      }
    }

    return NextResponse.json(goals);
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
    const { authId: _ignoredAuthId, ...goalData } = body || {};
    const authId = auth.authId;

    const user = await User.findOne({ authId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const goal = await Goal.create({ ...goalData, ownerAuthId: authId });
    user.goals.push(goal._id);
    await user.save();

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
