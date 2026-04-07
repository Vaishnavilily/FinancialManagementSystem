import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Account from "@/models/Account";
import { normalizeMoney, normalizeString } from "@/lib/db-normalizers";

export async function GET() {
  try {
    await connectToDatabase();
    const accounts = await Account.find({}).sort({ code: 1 });
    return NextResponse.json({ success: true, data: accounts });
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
      code: normalizeString(body.code).toUpperCase(),
      name: normalizeString(body.name),
      description: normalizeString(body.description),
      balance: normalizeMoney(body.balance, 0),
    };
    const account = await Account.create(payload);
    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
