import mongoose from "mongoose";

const BillItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 }
});

const BillSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  billNumber: { type: String, required: true, unique: true, trim: true },
  vendorName: { type: String, required: true, trim: true },
  issueDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date },
  items: { type: [BillItemSchema], default: [] },
  subtotal: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Unpaid', 'Paid', 'Overdue'], default: 'Unpaid' }
}, { timestamps: true });

export default mongoose.models.Bill || mongoose.model("Bill", BillSchema, "sme_bills");
