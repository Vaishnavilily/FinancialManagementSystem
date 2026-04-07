import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Account from "@/models/Account";
import { normalizeMoney, normalizeString } from "@/lib/db-normalizers";

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await request.json();
    const payload = {
      ...body,
      code: body.code ? normalizeString(body.code).toUpperCase() : body.code,
      name: body.name ? normalizeString(body.name) : body.name,
      description: body.description ? normalizeString(body.description) : body.description,
      balance: body.balance !== undefined ? normalizeMoney(body.balance, 0) : body.balance,
    };
    const updated = await Account.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
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
    const deleted = await Account.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
