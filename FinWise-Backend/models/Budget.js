import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please add a budget amount'],
    min: [0, 'Budget amount must be positive']
  },
  period: {
    type: String,
    enum: ['MONTHLY', 'YEARLY'],
    default: 'MONTHLY'
  },
  category: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  },
  month: {
    type: Number,
    required: function() {
      return this.period === 'MONTHLY';
    },
    min: 1,
    max: 12
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  alertsEnabled: {
    type: Boolean,
    default: true
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  lastAlertSent: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for unique budget per category and period
budgetSchema.index({ user: 1, category: 1, year: 1, month: 1 }, { unique: true });

// Virtual for current spending (to be calculated)
budgetSchema.virtual('currentSpending').get(function() {
  // This would be calculated in the controller
  return 0;
});

budgetSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.amount - this.currentSpending);
});

budgetSchema.virtual('percentageUsed').get(function() {
  return this.amount > 0 ? (this.currentSpending / this.amount) * 100 : 0;
});

export default mongoose.model('Budget', budgetSchema);