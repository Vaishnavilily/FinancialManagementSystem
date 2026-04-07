import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Payout from "@/models/Payout";
import Invoice from "@/models/Invoice";
import { requireAuth } from "@/lib/jwt";

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();
    
    // 1. Sum up all incoming funds (Paid Invoices)
    const paidInvoices = await Invoice.find({ ownerAuthId: auth.authId, status: "Paid" });
    const totalCollected = paidInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

    // 2. Sum up all outgoing funds (Payouts already requested)
    const allPayouts = await Payout.find({ ownerAuthId: auth.authId });
    const totalPaidOut = allPayouts.reduce((sum, payout) => sum + (Number(payout.amount) || 0), 0);

    // 3. Available to Sweep
    const availableBalance = Math.max(0, totalCollected - totalPaidOut);

    return NextResponse.json({ 
      success: true, 
      data: {
        availableBalance,
        totalCollected,
        totalPaidOut
      } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
