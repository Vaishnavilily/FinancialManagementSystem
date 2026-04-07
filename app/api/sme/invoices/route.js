import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { buildDocumentTotals, normalizeString } from "@/lib/db-normalizers";

export async function GET() {
  try {
    await connectToDatabase();
    const invoices = await Invoice.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: invoices });
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
      invoiceNumber: normalizeString(body.invoiceNumber),
      customerName: normalizeString(body.customerName),
      customerEmail: normalizeString(body.customerEmail),
    };
    const invoice = await Invoice.create(payload);
    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
