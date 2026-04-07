import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/user';
import { requireAuth } from '@/lib/jwt';

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const authId = auth.authId;

    const transactions = await Transaction.find({
      ownerAuthId: authId,
      ...(type && type !== 'all' ? { type } : {}),
    })
      .sort({ date: -1 })
      .limit(100);

    if (transactions.length === 0) {
      const legacyUser = await User.findOne({ authId }).populate({
        path: 'transactions',
        match: type && type !== 'all' ? { type } : {},
        options: { sort: { date: -1 }, limit: 100 },
      });

      if (legacyUser?.transactions?.length) {
        const ids = legacyUser.transactions.map((item) => item._id);
        await Transaction.updateMany(
          { _id: { $in: ids }, ownerAuthId: { $exists: false } },
          { $set: { ownerAuthId: authId } }
        );
        return NextResponse.json(legacyUser.transactions);
      }
    }

    return NextResponse.json(transactions);
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
    const { authId: _ignoredAuthId, ...txnData } = body || {};
    const authId = auth.authId;

    const user = await User.findOne({ authId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const transaction = await Transaction.create({ ...txnData, ownerAuthId: authId });
    user.transactions.push(transaction._id);
    await user.save();

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
