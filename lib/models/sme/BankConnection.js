import mongoose from "mongoose";

const BankConnectionSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  bankName: { type: String, required: true, trim: true },
  accountName: { type: String, required: true, trim: true },
  accountMask: { type: String, required: true, trim: true, minlength: 4, maxlength: 4 }, // e.g., "1234"
  status: { type: String, enum: ['Connected', 'Disconnected', 'Syncing'], default: 'Connected' },
  balance: { type: Number, default: 0, min: 0 },
  lastSync: { type: Date, default: Date.now },
  provider: { type: String, default: 'Mock-Plaid', trim: true } // Plaid, Stripe, etc
}, { timestamps: true });

export default mongoose.models.BankConnection || mongoose.model("BankConnection", BankConnectionSchema, "sme_bank_connections");
