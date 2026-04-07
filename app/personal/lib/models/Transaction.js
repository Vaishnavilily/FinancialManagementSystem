import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['income', 'expense'], required: true },
}, { timestamps: true });

TransactionSchema.index({ ownerAuthId: 1, date: -1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema, 'personal_transactions');
