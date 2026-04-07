import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Vendor from "@/models/Vendor";
import { normalizeMoney, normalizeString } from "@/lib/db-normalizers";

export async function GET() {
  try {
    await connectToDatabase();
    const vendors = await Vendor.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: vendors });
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
