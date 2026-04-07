import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Vendor from "@/models/Vendor";
import { normalizeMoney, normalizeString } from "@/lib/db-normalizers";
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
    const payload = {
      ...body,
      name: body.name ? normalizeString(body.name) : body.name,
      email: body.email ? normalizeString(body.email).toLowerCase() : body.email,
      phone: body.phone ? normalizeString(body.phone) : body.phone,
      category: body.category ? normalizeString(body.category) : body.category,
      totalSpent: body.totalSpent !== undefined ? normalizeMoney(body.totalSpent, 0) : body.totalSpent,
    };
    const updated = await Vendor.findOneAndUpdate(
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
    const deleted = await Vendor.findOneAndDelete({ _id: id, ownerAuthId: auth.authId });
    if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
