import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['transport', 'food', 'energy'],
  },
  subcategory: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  co2eKg: {
    type: Number,
    required: true,
    min: 0,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient dashboard queries
activityLogSchema.index({ userId: 1, loggedAt: -1 });
activityLogSchema.index({ userId: 1, category: 1 });

export default mongoose.model('ActivityLog', activityLogSchema);
