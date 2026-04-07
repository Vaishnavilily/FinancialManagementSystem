import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Estimate from "@/models/Estimate";
import { buildDocumentTotals, normalizeString } from "@/lib/db-normalizers";

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await request.json();
    const totals = buildDocumentTotals(body.items, 0);
    const payload = {
      ...body,
      ...totals,
      estimateNumber: normalizeString(body.estimateNumber),
      customerName: normalizeString(body.customerName),
    };
    const updated = await Estimate.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const deleted = await Estimate.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
