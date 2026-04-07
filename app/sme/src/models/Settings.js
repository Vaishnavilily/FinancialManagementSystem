import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  companyName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  currency: { type: String, default: "USD", trim: true, uppercase: true },
  timezone: { type: String, default: "UTC", trim: true },
  theme: { type: String, enum: ['Light', 'Dark', 'System'], default: 'Light' }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema, "sme_settings");
