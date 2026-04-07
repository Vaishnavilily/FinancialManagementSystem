import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  ownerAuthId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: 0.01 },
  currentAmount: { type: Number, default: 0, min: 0 },
  deadline: { type: Date },
  category: { type: String, default: 'Savings', trim: true },
}, { timestamps: true });

GoalSchema.index({ ownerAuthId: 1, createdAt: -1 });

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema, 'personal_goals');
