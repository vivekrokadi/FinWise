import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: 'INR'
  },
  monthlyBudget: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },

  // ── Notification preferences ────────────────────────────────────────────────
  notificationPrefs: {
    budgetAlerts: {
      type: Boolean,
      default: true         // email when budget threshold is crossed
    },
    weeklyReport: {
      type: Boolean,
      default: true         // weekly financial summary email
    },
    weeklyReportDay: {
      type: Number,
      default: 1,           // 0=Sun, 1=Mon … 6=Sat
      min: 0,
      max: 6
    }
  }
}, {
  timestamps: true
});

// Hash password before save (only when modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Cascade delete accounts, transactions, and budgets when user is deleted
userSchema.pre('findOneAndDelete', async function (next) {
  const user = await this.model.findOne(this.getFilter());
  if (user) {
    await mongoose.model('Account').deleteMany({ user: user._id });
    await mongoose.model('Transaction').deleteMany({ user: user._id });
    await mongoose.model('Budget').deleteMany({ user: user._id });
  }
  next();
});

export default mongoose.model('User', userSchema);