import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { normalizeMoney, normalizeString } from "@/lib/db-normalizers";

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await request.json();
    const payload = {
      ...body,
      name: body.name ? normalizeString(body.name) : body.name,
      email: body.email ? normalizeString(body.email).toLowerCase() : body.email,
      phone: body.phone ? normalizeString(body.phone) : body.phone,
      address: body.address ? normalizeString(body.address) : body.address,
      totalBilled: body.totalBilled !== undefined ? normalizeMoney(body.totalBilled, 0) : body.totalBilled,
    };
    const updated = await Customer.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
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
    const deleted = await Customer.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
