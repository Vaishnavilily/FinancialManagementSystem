import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  category: { type: String, required: true, trim: true },
  limit: { type: Number, required: true, min: 0 },
  spent: { type: Number, default: 0, min: 0 },
  alertThreshold: { type: Number, default: 80, min: 0, max: 100 },
  month: { type: String, default: () => new Date().toISOString().slice(0, 7), match: /^\d{4}-\d{2}$/ },
}, { timestamps: true });

BudgetSchema.index({ ownerAuthId: 1, month: 1, category: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema, 'personal_budgets');
