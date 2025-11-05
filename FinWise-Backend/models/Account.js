import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an account name'],
    trim: true,
    maxlength: [50, 'Account name cannot be more than 50 characters']
  },
  type: {
    type: String,
    enum: ['CURRENT', 'SAVINGS', 'INVESTMENT', 'CREDIT_CARD'],
    default: 'CURRENT'
  },
  balance: {
    type: Number,
    default: 0,
    required: true
  },
  currency: {
    type: String,
    default: 'RUPEES'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

// Ensure only one default account per user
accountSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Index for better query performance
accountSchema.index({ user: 1, isDefault: 1 });

export default mongoose.model('Account', accountSchema);