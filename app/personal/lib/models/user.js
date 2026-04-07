import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  authId: { type: String, required: true, unique: true, index: true }, // link to your auth provider identifier
  name: { type: String, default: '' },
  email: { type: String, lowercase: true, trim: true, sparse: true, unique: true },
  phone: { type: String, default: '' },
  dob: { type: Date },
  city: { type: String, default: '' },
  occupation: { type: String, default: '' },
  annualIncome: { type: Number, default: 0 },
  plan: { type: String, default: 'Individual' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLoginAt: { type: Date, default: Date.now },

  // Kept for backward compatibility with existing documents.
  budgets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Budget' }],
  goals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema, 'personal_users');
