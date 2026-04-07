import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  totalBilled: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema, "sme_customers");
