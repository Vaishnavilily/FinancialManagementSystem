import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { normalizeString } from "@/lib/db-normalizers";

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await Settings.findOne({});
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;
    const payload = {
      ...updateData,
      companyName: normalizeString(updateData.companyName),
      email: normalizeString(updateData.email).toLowerCase(),
      currency: normalizeString(updateData.currency, "USD").toUpperCase(),
      timezone: normalizeString(updateData.timezone, "UTC"),
    };
    
    let settings = await Settings.findOne({});
    if (settings) {
      settings = await Settings.findByIdAndUpdate(settings._id, payload, { new: true, runValidators: true });
    } else {
      settings = await Settings.create(payload);
    }
    
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
