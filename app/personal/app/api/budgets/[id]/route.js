import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Budget from '@/lib/models/Budget';
import User from '@/lib/models/user';
import { requireAuth } from '@/lib/jwt';

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = params;
    const authId = auth.authId;

    const deleted = await Budget.findOneAndDelete({ _id: id, ownerAuthId: authId });
    if (!deleted) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    await User.updateOne({ authId }, { $pull: { budgets: id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
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

    const budget = await Budget.findOneAndUpdate(
      { _id: id, ownerAuthId: authId },
      updates,
      { new: true, runValidators: true }
    );
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
