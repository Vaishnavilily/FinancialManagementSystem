import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Bill from "@/models/Bill";
import { buildDocumentTotals, normalizeString } from "@/lib/db-normalizers";
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
    const totals = buildDocumentTotals(body.items, body.taxRate);
    const payload = {
      ...body,
      ...totals,
      billNumber: normalizeString(body.billNumber),
      vendorName: normalizeString(body.vendorName),
    };
    const updated = await Bill.findOneAndUpdate(
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
    const deleted = await Bill.findOneAndDelete({ _id: id, ownerAuthId: auth.authId });
    if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
