import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Vendor from "@/models/Vendor";
import { normalizeMoney, normalizeString } from "@/lib/db-normalizers";
import { requireAuth } from "@/lib/jwt";

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();
    const vendors = await Vendor.find({ ownerAuthId: auth.authId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: vendors });
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
    const payload = {
      ...body,
      ownerAuthId: auth.authId,
      name: normalizeString(body.name),
      email: normalizeString(body.email).toLowerCase(),
      phone: normalizeString(body.phone),
      category: normalizeString(body.category),
      totalSpent: normalizeMoney(body.totalSpent, 0),
    };
    const vendor = await Vendor.create(payload);
    return NextResponse.json({ success: true, data: vendor }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
