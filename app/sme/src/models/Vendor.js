import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  category: { type: String, trim: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  totalSpent: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema, "sme_vendors");
