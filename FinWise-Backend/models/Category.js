import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['INCOME', 'EXPENSE', 'INVESTMENT', 'TAX'],
    required: true
  },
  color: {
    type: String,
    required: true,
    default: '#6B7280'
  },
  icon: {
    type: String,
    default: 'Circle'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: 500
  },
  taxDeductible: {
    type: Boolean,
    default: false
  },
  investmentEligible: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Static method to get default categories
categorySchema.statics.getDefaultCategories = function() {
  return [
    // Income Categories
    { name: 'salary', type: 'INCOME', color: '#22c55e', icon: 'Wallet', isDefault: true },
    { name: 'freelance', type: 'INCOME', color: '#06b6d4', icon: 'Laptop', isDefault: true },
    { name: 'investments', type: 'INCOME', color: '#6366f1', icon: 'TrendingUp', isDefault: true },
    { name: 'business', type: 'INCOME', color: '#ec4899', icon: 'Building', isDefault: true },
    { name: 'rental', type: 'INCOME', color: '#f59e0b', icon: 'Home', isDefault: true },
    { name: 'other-income', type: 'INCOME', color: '#64748b', icon: 'Plus', isDefault: true },

    // Expense Categories
    { name: 'housing', type: 'EXPENSE', color: '#ef4444', icon: 'Home', isDefault: true, taxDeductible: true },
    { name: 'transportation', type: 'EXPENSE', color: '#f97316', icon: 'Car', isDefault: true },
    { name: 'groceries', type: 'EXPENSE', color: '#84cc16', icon: 'ShoppingCart', isDefault: true },
    { name: 'utilities', type: 'EXPENSE', color: '#06b6d4', icon: 'Zap', isDefault: true },
    { name: 'entertainment', type: 'EXPENSE', color: '#8b5cf6', icon: 'Film', isDefault: true },
    { name: 'food', type: 'EXPENSE', color: '#f43f5e', icon: 'Utensils', isDefault: true },
    { name: 'shopping', type: 'EXPENSE', color: '#ec4899', icon: 'ShoppingBag', isDefault: true },
    { name: 'healthcare', type: 'EXPENSE', color: '#14b8a6', icon: 'Heart', isDefault: true, taxDeductible: true },
    { name: 'education', type: 'EXPENSE', color: '#6366f1', icon: 'GraduationCap', isDefault: true, taxDeductible: true },
    { name: 'personal', type: 'EXPENSE', color: '#d946ef', icon: 'User', isDefault: true },
    { name: 'travel', type: 'EXPENSE', color: '#0ea5e9', icon: 'Plane', isDefault: true },
    { name: 'insurance', type: 'EXPENSE', color: '#64748b', icon: 'Shield', isDefault: true },
    { name: 'gifts', type: 'EXPENSE', color: '#f472b6', icon: 'Gift', isDefault: true },
    { name: 'bills', type: 'EXPENSE', color: '#fb7185', icon: 'Receipt', isDefault: true },
    { name: 'other-expense', type: 'EXPENSE', color: '#94a3b8', icon: 'MoreHorizontal', isDefault: true },

    // Investment Categories
    { name: 'stocks', type: 'INVESTMENT', color: '#10b981', icon: 'TrendingUp', isDefault: true, investmentEligible: true },
    { name: 'crypto', type: 'INVESTMENT', color: '#f59e0b', icon: 'Bitcoin', isDefault: true, investmentEligible: true },
    { name: 'real-estate', type: 'INVESTMENT', color: '#ef4444', icon: 'Home', isDefault: true, investmentEligible: true },
    { name: 'bonds', type: 'INVESTMENT', color: '#3b82f6', icon: 'FileText', isDefault: true, investmentEligible: true },
    { name: 'mutual-funds', type: 'INVESTMENT', color: '#8b5cf6', icon: 'PieChart', isDefault: true, investmentEligible: true },

    // Tax Categories
    { name: 'income-tax', type: 'TAX', color: '#dc2626', icon: 'Calculator', isDefault: true },
    { name: 'property-tax', type: 'TAX', color: '#ea580c', icon: 'Home', isDefault: true },
    { name: 'sales-tax', type: 'TAX', color: '#d97706', icon: 'Receipt', isDefault: true },
    { name: 'investment-tax', type: 'TAX', color: '#059669', icon: 'TrendingUp', isDefault: true }
  ];
};

// Method to initialize default categories
categorySchema.statics.initializeDefaultCategories = async function() {
  try {
    const defaultCategories = this.getDefaultCategories();
    const existingCategories = await this.find({ isDefault: true });
    
    if (existingCategories.length === 0) {
      await this.insertMany(defaultCategories);
      console.log('✅ Default categories initialized successfully');
      return true;
    } else {
      console.log('✅ Default categories already exist');
      return true;
    }
  } catch (error) {
    console.error('❌ Error initializing default categories:', error.message);
    throw error;
  }
};

export default mongoose.model('Category', categorySchema);