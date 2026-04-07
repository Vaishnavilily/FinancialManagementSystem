// api/seed-demo.js
// Seeds Personal + SME demo data for demo users only.
// Protected by ?secret=SEED_SECRET

import { getDb } from './_lib/db.js';

function requireSeedSecret(req) {
  const secret = req?.query?.secret;
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    const err = new Error('Unauthorized. Pass ?secret=SEED_SECRET');
    err.statusCode = 401;
    throw err;
  }
}

function nowIso() {
  return new Date();
}

function asMoney(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function pickId(doc) {
  return doc?._id?.toString?.() || '';
}

export default async function handler(req, res) {
  try {
    requireSeedSecret(req);

    const db = await getDb();

    // Auth users (gateway collections)
    const individualAuth = await db.collection('individual_users').findOne({ email: 'individual@finflow.com' });
    const smeAuth = await db.collection('sme_users').findOne({ email: 'sme@finflow.com' });

    const individualAuthId = pickId(individualAuth);
    const smeAuthId = pickId(smeAuth);

    if (!individualAuthId || !smeAuthId) {
      return res.status(400).json({
        success: false,
        message: 'Demo auth users not found. Run /api/seed first, then /api/seed-demo.',
      });
    }

    const createdAt = nowIso();

    // -------------------------
    // Personal demo data
    // -------------------------
    await db.collection('personal_users').updateOne(
      { authId: individualAuthId },
      {
        $setOnInsert: {
          authId: individualAuthId,
          createdAt,
        },
        $set: {
          name: 'Demo Individual',
          email: 'individual@finflow.com',
          phone: '+910000000001',
          dob: new Date('1998-04-07T00:00:00.000Z'),
          city: 'Hyderabad',
          occupation: 'Software Engineer',
          annualIncome: 1200000,
          plan: 'Individual',
          status: 'active',
          lastLoginAt: createdAt,
          updatedAt: createdAt,
        },
      },
      { upsert: true }
    );

    // budgets
    await db.collection('personal_budgets').updateOne(
      { ownerAuthId: individualAuthId, month: new Date().toISOString().slice(0, 7), category: 'Food & Dining' },
      {
        $setOnInsert: {
          ownerAuthId: individualAuthId,
          category: 'Food & Dining',
          limit: asMoney(12000),
          spent: asMoney(4200),
          alertThreshold: 80,
          month: new Date().toISOString().slice(0, 7),
          createdAt,
          updatedAt: createdAt,
        },
      },
      { upsert: true }
    );
    await db.collection('personal_budgets').updateOne(
      { ownerAuthId: individualAuthId, month: new Date().toISOString().slice(0, 7), category: 'Housing & Rent' },
      {
        $setOnInsert: {
          ownerAuthId: individualAuthId,
          category: 'Housing & Rent',
          limit: asMoney(25000),
          spent: asMoney(25000),
          alertThreshold: 80,
          month: new Date().toISOString().slice(0, 7),
          createdAt,
          updatedAt: createdAt,
        },
      },
      { upsert: true }
    );

    // goals
    const goalDocs = [
      {
        ownerAuthId: individualAuthId,
        name: 'Emergency Fund',
        targetAmount: asMoney(200000),
        currentAmount: asMoney(85000),
        category: 'Emergency Fund',
        deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 8, 1),
      },
      {
        ownerAuthId: individualAuthId,
        name: 'Goa Trip',
        targetAmount: asMoney(60000),
        currentAmount: asMoney(21000),
        category: 'Travel',
        deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 4, 1),
      },
    ];
    const existingGoals = await db.collection('personal_goals').countDocuments({ ownerAuthId: individualAuthId });
    if (existingGoals === 0) {
      await db.collection('personal_goals').insertMany(
        goalDocs.map((g) => ({ ...g, createdAt, updatedAt: createdAt }))
      );
    }

    // transactions
    const existingTxns = await db.collection('personal_transactions').countDocuments({ ownerAuthId: individualAuthId });
    if (existingTxns === 0) {
      await db.collection('personal_transactions').insertMany([
        {
          ownerAuthId: individualAuthId,
          date: new Date(),
          description: 'Salary',
          category: 'Income',
          amount: asMoney(85000),
          type: 'income',
          createdAt,
          updatedAt: createdAt,
        },
        {
          ownerAuthId: individualAuthId,
          date: new Date(),
          description: 'Rent',
          category: 'Housing',
          amount: asMoney(25000),
          type: 'expense',
          createdAt,
          updatedAt: createdAt,
        },
        {
          ownerAuthId: individualAuthId,
          date: new Date(),
          description: 'Groceries',
          category: 'Food',
          amount: asMoney(3200),
          type: 'expense',
          createdAt,
          updatedAt: createdAt,
        },
      ]);
    }

    // -------------------------
    // SME demo data
    // -------------------------
    // Settings
    await db.collection('sme_settings').updateOne(
      { ownerAuthId: smeAuthId },
      {
        $setOnInsert: {
          ownerAuthId: smeAuthId,
          createdAt,
        },
        $set: {
          companyName: 'Demo SME Pvt Ltd',
          email: 'sme@finflow.com',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          theme: 'Light',
          updatedAt: createdAt,
        },
      },
      { upsert: true }
    );

    // Customers / Vendors
    const hasCustomers = await db.collection('sme_customers').countDocuments({ ownerAuthId: smeAuthId });
    if (hasCustomers === 0) {
      await db.collection('sme_customers').insertMany([
        {
          ownerAuthId: smeAuthId,
          name: 'Acme Retail',
          email: 'ap@acmeretail.example',
          phone: '+91 90000 00001',
          address: 'Bangalore, IN',
          status: 'Active',
          totalBilled: asMoney(125000),
          createdAt,
          updatedAt: createdAt,
        },
        {
          ownerAuthId: smeAuthId,
          name: 'Zenith Logistics',
          email: 'finance@zenithlogistics.example',
          phone: '+91 90000 00002',
          address: 'Mumbai, IN',
          status: 'Active',
          totalBilled: asMoney(78000),
          createdAt,
          updatedAt: createdAt,
        },
      ]);
    }

    const hasVendors = await db.collection('sme_vendors').countDocuments({ ownerAuthId: smeAuthId });
    if (hasVendors === 0) {
      await db.collection('sme_vendors').insertMany([
        {
          ownerAuthId: smeAuthId,
          name: 'Cloud Hosting Co',
          email: 'billing@cloudhosting.example',
          phone: '+91 90000 00003',
          category: 'Software',
          status: 'Active',
          totalSpent: asMoney(42000),
          createdAt,
          updatedAt: createdAt,
        },
        {
          ownerAuthId: smeAuthId,
          name: 'Office Supplies Mart',
          email: 'sales@officesupplies.example',
          phone: '+91 90000 00004',
          category: 'Office',
          status: 'Active',
          totalSpent: asMoney(18000),
          createdAt,
          updatedAt: createdAt,
        },
      ]);
    }

    // Accounts
    const hasAccounts = await db.collection('sme_accounts').countDocuments({ ownerAuthId: smeAuthId });
    if (hasAccounts === 0) {
      await db.collection('sme_accounts').insertMany([
        { ownerAuthId: smeAuthId, code: '1000', name: 'Cash', type: 'Asset', balance: asMoney(250000), description: 'Cash on hand', createdAt, updatedAt: createdAt },
        { ownerAuthId: smeAuthId, code: '1100', name: 'Bank', type: 'Asset', balance: asMoney(850000), description: 'Bank account', createdAt, updatedAt: createdAt },
        { ownerAuthId: smeAuthId, code: '4000', name: 'Sales', type: 'Revenue', balance: asMoney(0), description: 'Sales revenue', createdAt, updatedAt: createdAt },
        { ownerAuthId: smeAuthId, code: '5000', name: 'Operating Expenses', type: 'Expense', balance: asMoney(0), description: 'General expenses', createdAt, updatedAt: createdAt },
      ]);
    }

    // Invoices / Bills / Estimates / Transactions
    const hasInvoices = await db.collection('sme_invoices').countDocuments({ ownerAuthId: smeAuthId });
    if (hasInvoices === 0) {
      await db.collection('sme_invoices').insertMany([
        {
          ownerAuthId: smeAuthId,
          invoiceNumber: 'INV-DEMO-001',
          customerName: 'Acme Retail',
          customerEmail: 'ap@acmeretail.example',
          issueDate: new Date(),
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 14),
          items: [
            { description: 'Monthly subscription', quantity: 1, price: asMoney(50000), amount: asMoney(50000) },
            { description: 'Setup fee', quantity: 1, price: asMoney(25000), amount: asMoney(25000) },
          ],
          subtotal: asMoney(75000),
          taxRate: 18,
          taxAmount: asMoney(13500),
          total: asMoney(88500),
          status: 'Sent',
          accentColor: '#004C91',
          createdAt,
          updatedAt: createdAt,
        },
        {
          ownerAuthId: smeAuthId,
          invoiceNumber: 'INV-DEMO-002',
          customerName: 'Zenith Logistics',
          customerEmail: 'finance@zenithlogistics.example',
          issueDate: new Date(),
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7),
          items: [{ description: 'Consulting', quantity: 10, price: asMoney(6000), amount: asMoney(60000) }],
          subtotal: asMoney(60000),
          taxRate: 18,
          taxAmount: asMoney(10800),
          total: asMoney(70800),
          status: 'Paid',
          accentColor: '#004C91',
          createdAt,
          updatedAt: createdAt,
        },
      ]);
    }

    const hasBills = await db.collection('sme_bills').countDocuments({ ownerAuthId: smeAuthId });
    if (hasBills === 0) {
      await db.collection('sme_bills').insertMany([
        {
          ownerAuthId: smeAuthId,
          billNumber: 'BILL-DEMO-001',
          vendorName: 'Cloud Hosting Co',
          issueDate: new Date(),
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 10),
          items: [{ description: 'Compute + Storage', quantity: 1, price: asMoney(18000), amount: asMoney(18000) }],
          subtotal: asMoney(18000),
          taxRate: 18,
          taxAmount: asMoney(3240),
          total: asMoney(21240),
          status: 'Unpaid',
          createdAt,
          updatedAt: createdAt,
        },
      ]);
    }

    const hasEstimates = await db.collection('sme_estimates').countDocuments({ ownerAuthId: smeAuthId });
    if (hasEstimates === 0) {
      await db.collection('sme_estimates').insertMany([
        {
          ownerAuthId: smeAuthId,
          estimateNumber: 'EST-DEMO-001',
          customerName: 'Acme Retail',
          issueDate: new Date(),
          items: [{ description: 'Q2 Support Retainer', quantity: 1, price: asMoney(90000), amount: asMoney(90000) }],
          subtotal: asMoney(90000),
          total: asMoney(90000),
          status: 'Sent',
          createdAt,
          updatedAt: createdAt,
        },
      ]);
    }

    const hasSmeTxns = await db.collection('sme_transactions').countDocuments({ ownerAuthId: smeAuthId });
    if (hasSmeTxns === 0) {
      await db.collection('sme_transactions').insertMany([
        {
          ownerAuthId: smeAuthId,
          date: new Date(),
          description: 'Invoice payment INV-DEMO-002',
          amount: asMoney(70800),
          type: 'Income',
          category: 'Sales',
          reference: 'UTR123456',
          status: 'Completed',
          isReconciled: false,
          createdAt,
          updatedAt: createdAt,
        },
        {
          ownerAuthId: smeAuthId,
          date: new Date(),
          description: 'Cloud Hosting Co - monthly',
          amount: asMoney(21240),
          type: 'Expense',
          category: 'Software',
          reference: 'BILL-DEMO-001',
          status: 'Completed',
          isReconciled: false,
          createdAt,
          updatedAt: createdAt,
        },
      ]);
    }

    // Bank connections
    const hasConnections = await db.collection('sme_bank_connections').countDocuments({ ownerAuthId: smeAuthId });
    if (hasConnections === 0) {
      await db.collection('sme_bank_connections').insertMany([
        {
          ownerAuthId: smeAuthId,
          bankName: 'Demo Bank',
          accountName: 'Demo SME Pvt Ltd',
          accountMask: '4321',
          status: 'Connected',
          balance: asMoney(850000),
          lastSync: new Date(),
          provider: 'Mock-Plaid',
          createdAt,
          updatedAt: createdAt,
        },
      ]);
    }

    // Payouts
    const hasPayouts = await db.collection('sme_payouts').countDocuments({ ownerAuthId: smeAuthId });
    if (hasPayouts === 0) {
      await db.collection('sme_payouts').insertMany([
        {
          ownerAuthId: smeAuthId,
          amount: asMoney(25000),
          destinationBank: 'Demo Bank',
          accountMask: '4321',
          reference: 'PO_123456',
          status: 'Paid',
          expectedArrival: new Date(),
          createdAt,
          updatedAt: createdAt,
        },
      ]);
    }

    return res.status(200).json({
      success: true,
      seeded: {
        personalAuthId: individualAuthId,
        smeAuthId,
      },
      message: 'Demo data seeded into prefixed Personal/SME collections.',
    });
  } catch (err) {
    const status = err?.statusCode || 500;
    return res.status(status).json({ success: false, message: err?.message || 'Seed failed' });
  }
}

