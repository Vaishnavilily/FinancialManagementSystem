import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BankConnection from "@/models/BankConnection";
import { requireAuth } from "@/lib/jwt";

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();
    const { id } = params;
    const deleted = await BankConnection.findOneAndDelete({ _id: id, ownerAuthId: auth.authId });
    if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
