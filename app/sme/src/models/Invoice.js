import mongoose from "mongoose";

const InvoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 }
});

const InvoiceSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  invoiceNumber: { type: String, required: true, unique: true, trim: true },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, lowercase: true, trim: true },
  issueDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date },
  items: { type: [InvoiceItemSchema], default: [] },
  subtotal: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Draft', 'Sent', 'Paid', 'Overdue'], default: 'Draft' },
  accentColor: { type: String, default: '#004C91', trim: true }
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema, "sme_invoices");
