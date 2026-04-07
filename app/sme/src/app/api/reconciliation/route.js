import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/jwt";

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();
    
    // 1. Fetch internal transactions that are NOT reconciled yet
    const pendingInternalTransactions = await Transaction.find({ 
      ownerAuthId: auth.authId,
      isReconciled: { $ne: true } 
    }).sort({ date: -1 }).lean();

    // 2. Build bank feed solely from real internal transactions
    const bankFeed = [];
    
    // Create perfect mock bank items based on real internal transactions
    pendingInternalTransactions.forEach((tx) => {
      // Simulate real bank descriptions which are often uppercase and messy
      const prefix = tx.type === 'Income' ? 'DEPOSIT DEPOSIT-WEB ' : 'VISA DEBIT ';
      bankFeed.push({
        id: `bank-${tx._id}`,
        date: tx.date,
        description: `${prefix}${tx.description.toUpperCase().substring(0, 15)}`,
        amount: tx.type === 'Income' ? tx.amount : -tx.amount,
        type: tx.type,
        // Pre-compute the suggestion logic
        suggestedMatch: tx
      });
    });

    bankFeed.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Send back both the structured feed (with matches) and the raw pending internal pool (useful for manual matching UI)
    return NextResponse.json({ 
      success: true, 
      data: {
        bankFeed,
        internalUnreconciled: pendingInternalTransactions
      } 
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
