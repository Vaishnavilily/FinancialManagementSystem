import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { normalizeMoney, normalizeString } from "@/lib/db-normalizers";
import { requireAuth } from "@/lib/jwt";

export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();
    const { id } = params;
    const body = await request.json();
    const payload = {
      ...body,
      description: normalizeString(body.description),
      category: normalizeString(body.category, "Uncategorized"),
      reference: normalizeString(body.reference),
      amount: Math.max(0, normalizeMoney(body.amount, 0)),
    };
    const updated = await Transaction.findOneAndUpdate(
      { _id: id, ownerAuthId: auth.authId },
      payload,
      { new: true, runValidators: true }
    );
    if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();
    const { id } = params;
    const deleted = await Transaction.findOneAndDelete({ _id: id, ownerAuthId: auth.authId });
    if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
