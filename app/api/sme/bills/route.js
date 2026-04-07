import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Bill from "@/models/Bill";
import { buildDocumentTotals, normalizeString } from "@/lib/db-normalizers";

export async function GET() {
  try {
    await connectToDatabase();
    const bills = await Bill.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: bills });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const totals = buildDocumentTotals(body.items, body.taxRate);
    const payload = {
      ...body,
      ...totals,
      billNumber: normalizeString(body.billNumber),
      vendorName: normalizeString(body.vendorName),
    };
    const bill = await Bill.create(payload);
    return NextResponse.json({ success: true, data: bill }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
