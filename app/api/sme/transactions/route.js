import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { normalizeMoney, normalizeString } from "@/lib/db-normalizers";

export async function GET() {
  try {
    await connectToDatabase();
    const transactions = await Transaction.find({}).sort({ date: -1 });
    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const payload = {
      ...body,
      description: normalizeString(body.description),
      category: normalizeString(body.category, "Uncategorized"),
      reference: normalizeString(body.reference),
      amount: Math.max(0, normalizeMoney(body.amount, 0)),
    };
    const transaction = await Transaction.create(payload);
    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
