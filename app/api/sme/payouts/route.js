import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Payout from "@/models/Payout";
import { normalizeMoney, normalizeString } from "@/lib/db-normalizers";

export async function GET() {
  try {
    await connectToDatabase();
    const payouts = await Payout.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: payouts });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Set expected arrival to 2 business days from now
    const arrival = new Date();
    arrival.setDate(arrival.getDate() + 2);
    
    body.status = 'In Transit';
    body.expectedArrival = arrival;
    body.reference = 'PO_' + Math.floor(Math.random() * 900000 + 100000);
    body.amount = Math.max(0.01, normalizeMoney(body.amount, 0));
    body.destinationBank = normalizeString(body.destinationBank);
    body.accountMask = normalizeString(body.accountMask).slice(-4).padStart(4, "0");

    const payout = await Payout.create(body);
    return NextResponse.json({ success: true, data: payout }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
