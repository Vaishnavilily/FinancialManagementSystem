import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { normalizeString } from "@/lib/db-normalizers";
import { requireAuth } from "@/lib/jwt";

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();
    const settings = await Settings.findOne({ ownerAuthId: auth.authId });
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;
    const payload = {
      ...updateData,
      ownerAuthId: auth.authId,
      companyName: normalizeString(updateData.companyName),
      email: normalizeString(updateData.email).toLowerCase(),
      currency: normalizeString(updateData.currency, "USD").toUpperCase(),
      timezone: normalizeString(updateData.timezone, "UTC"),
    };
    
    let settings = await Settings.findOne({ ownerAuthId: auth.authId });
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
