import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['INCOME', 'EXPENSE', 'INVESTMENT', 'TAX'],
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
      maxlength: [200, 'Description cannot be more than 200 characters']
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    category: {
      type: String,
      required: true
    },
    subcategory: {
      type: String,
      default: ''
    },
    merchant: {
      type: String,
      trim: true
    },
    receiptImage: {
      type: String,
      default: ''
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringInterval: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', null],
      default: null
    },
    nextRecurringDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'COMPLETED'
    },
    tags: [{ type: String, trim: true }],
    taxDeductible: {
      type: Boolean,
      default: false
    },
    investmentType: {
      type: String,
      enum: ['STOCKS', 'CRYPTO', 'REAL_ESTATE', 'BONDS', 'MUTUAL_FUNDS', 'OTHER', null],
      default: null
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    account: {
      type: mongoose.Schema.ObjectId,
      ref: 'Account',
      required: true
    }
  },
  { timestamps: true }
);

// Indexes
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, isRecurring: 1 });

// Normalize before save: force category lowercase & type uppercase
transactionSchema.pre('save', function (next) {
  if (this.category) this.category = String(this.category).toLowerCase();
  if (this.type) this.type = String(this.type).toUpperCase();
  next();
});

// Update account balance when transaction is created
transactionSchema.post('save', async function () {
  const Account = mongoose.model('Account');
  const account = await Account.findById(this.account);

  if (account) {
    let balanceChange = 0;
    if (this.type === 'INCOME') balanceChange = this.amount;
    if (this.type === 'EXPENSE' || this.type === 'INVESTMENT' || this.type === 'TAX') balanceChange = -this.amount;
    account.balance += balanceChange;
    await account.save();
  }
});

transactionSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const Account = mongoose.model('Account');
    const account = await Account.findById(doc.account);

    if (account) {
      let balanceChange = 0;
      if (doc.type === 'INCOME') balanceChange = -doc.amount;
      if (doc.type === 'EXPENSE' || doc.type === 'INVESTMENT' || doc.type === 'TAX') balanceChange = doc.amount;
      account.balance += balanceChange;
      await account.save();
    }
  }
});

export default mongoose.model('Transaction', transactionSchema);
