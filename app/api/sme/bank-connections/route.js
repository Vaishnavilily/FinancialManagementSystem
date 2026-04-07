import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BankConnection from "@/models/BankConnection";
import { normalizeMoney, normalizeString } from "@/lib/db-normalizers";

export async function GET() {
  try {
    await connectToDatabase();
    const connections = await BankConnection.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: connections });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Simulate initial bank connection balance logic with some random data
    if (body.balance === undefined || body.balance === null) {
      body.balance = Math.floor(Math.random() * 5000) + 1000;
    }
    if (!body.accountMask) {
      // Generate random 4 digits
      body.accountMask = Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    body.bankName = normalizeString(body.bankName);
    body.accountName = normalizeString(body.accountName);
    body.balance = Math.max(0, normalizeMoney(body.balance, 0));
    body.accountMask = normalizeString(body.accountMask).slice(-4).padStart(4, "0");
    body.provider = normalizeString(body.provider, "Mock-Plaid");
    body.status = 'Connected';
    body.lastSync = new Date();

    const connection = await BankConnection.create(body);
    return NextResponse.json({ success: true, data: connection }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
