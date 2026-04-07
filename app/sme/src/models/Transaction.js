import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  category: { type: String, default: 'Uncategorized', trim: true },
  reference: { type: String, trim: true },
  status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
  isReconciled: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema, "sme_transactions");
