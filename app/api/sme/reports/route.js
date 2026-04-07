import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Invoice from "@/models/Invoice";
import Bill from "@/models/Bill";

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all-time";
    
    let dateFilter = {};
    if (period === "last-30") {
      const date30DaysAgo = new Date();
      date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
      dateFilter = { $gte: date30DaysAgo };
    } else if (period === "past-week") {
      const date7DaysAgo = new Date();
      date7DaysAgo.setDate(date7DaysAgo.getDate() - 7);
      dateFilter = { $gte: date7DaysAgo };
    }

    // 1. Transactions - Income and Expenses
    const transactionQuery = period === "all-time" ? {} : { date: dateFilter };
    const transactions = await Transaction.find(transactionQuery);
    
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = {};

    transactions.forEach(t => {
      if (t.type === 'Income') {
        totalIncome += t.amount;
      } else if (t.type === 'Expense') {
        totalExpenses += t.amount;
        
        // Group by category
        const cat = t.category || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      }
    });

    const netProfit = totalIncome - totalExpenses;

    const expensesByCategory = Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 categories

    // 2. Receivables (Unpaid Sent Invoices)
    const invoiceQuery = { status: "Sent" };
    if (period !== "all-time") invoiceQuery.issueDate = dateFilter;
    
    const invoices = await Invoice.find(invoiceQuery);
    const receivables = invoices.reduce((sum, inv) => sum + inv.total, 0);

    // 3. Payables (Unpaid Bills)
    const billQuery = { status: "Unpaid" };
    if (period !== "all-time") billQuery.issueDate = dateFilter;
    
    const bills = await Bill.find(billQuery);
    const payables = bills.reduce((sum, bill) => sum + bill.total, 0);

    const reportData = {
      totalIncome,
      totalExpenses,
      netProfit,
      receivables,
      payables,
      expensesByCategory,
      period
    };

    return NextResponse.json({ success: true, data: reportData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
