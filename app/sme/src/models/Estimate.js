import mongoose from "mongoose";

const EstimateItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 }
});

const EstimateSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  estimateNumber: { type: String, required: true, unique: true, trim: true },
  customerName: { type: String, required: true, trim: true },
  issueDate: { type: Date, required: true, default: Date.now },
  items: { type: [EstimateItemSchema], default: [] },
  subtotal: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Draft', 'Sent', 'Accepted', 'Rejected'], default: 'Draft' }
}, { timestamps: true });

export default mongoose.models.Estimate || mongoose.model("Estimate", EstimateSchema, "sme_estimates");
