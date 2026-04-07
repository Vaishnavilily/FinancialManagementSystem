import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Payout from "@/models/Payout";
import Invoice from "@/models/Invoice";

export async function GET() {
  try {
    await connectToDatabase();
    
    // 1. Sum up all incoming funds (Paid Invoices)
    const paidInvoices = await Invoice.find({ status: "Paid" });
    const totalCollected = paidInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

    // 2. Sum up all outgoing funds (Payouts already requested)
    const allPayouts = await Payout.find({});
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
