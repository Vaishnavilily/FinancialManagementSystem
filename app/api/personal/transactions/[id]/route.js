import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/user';
import { requireAuth } from '@/lib/jwt';

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = params;
    const authId = auth.authId;

    const txn = await Transaction.findOne({ _id: id, ownerAuthId: authId });
    if (!txn) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json(txn);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = params;
    const body = await request.json();
    const { authId: _ignoredAuthId, ...updates } = body || {};
    const authId = auth.authId;

    const txn = await Transaction.findOneAndUpdate(
      { _id: id, ownerAuthId: authId },
      updates,
      { new: true, runValidators: true }
    );
    if (!txn) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(txn);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = params;
    const authId = auth.authId;

    const txn = await Transaction.findOneAndDelete({ _id: id, ownerAuthId: authId });
    if (!txn) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Remove reference from user
    await User.updateOne(
      { authId },
      { $pull: { transactions: id } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
