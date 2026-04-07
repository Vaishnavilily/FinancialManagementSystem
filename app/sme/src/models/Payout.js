import mongoose from "mongoose";

const PayoutSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: 0.01 },
  destinationBank: { type: String, required: true, trim: true },
  accountMask: { type: String, required: true, trim: true, minlength: 4, maxlength: 4 },
  reference: { type: String, trim: true },
  status: { type: String, enum: ['Paid', 'Pending', 'In Transit', 'Failed'], default: 'In Transit' },
  expectedArrival: { type: Date }
}, { timestamps: true });

export default mongoose.models.Payout || mongoose.model("Payout", PayoutSchema, "sme_payouts");
