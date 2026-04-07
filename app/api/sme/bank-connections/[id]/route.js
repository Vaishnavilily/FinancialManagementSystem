import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BankConnection from "@/models/BankConnection";

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const deleted = await BankConnection.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
