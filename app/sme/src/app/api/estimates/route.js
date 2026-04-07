import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Estimate from "@/models/Estimate";
import { buildDocumentTotals, normalizeString } from "@/lib/db-normalizers";
import { requireAuth } from "@/lib/jwt";

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();
    const estimates = await Estimate.find({ ownerAuthId: auth.authId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: estimates });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();
    const body = await request.json();
    const totals = buildDocumentTotals(body.items, 0);
    const payload = {
      ...body,
      ...totals,
      ownerAuthId: auth.authId,
      estimateNumber: normalizeString(body.estimateNumber),
      customerName: normalizeString(body.customerName),
    };
    const estimate = await Estimate.create(payload);
    return NextResponse.json({ success: true, data: estimate }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
