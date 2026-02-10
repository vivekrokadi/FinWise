import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

export const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user.id })
      .sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user.id });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const transactions = await Transaction.find({
      account: req.params.id,
      user: req.user.id
    }).sort({ date: -1 }).limit(50);

    res.status(200).json({
      success: true,
      data: { account, transactions }
    });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createAccount = async (req, res) => {
  try {
    const {
      name,
      type = 'CURRENT',
      balance = 0,
      currency = 'RUPEES',
      isDefault = false,
      color = '#3B82F6',
      description = ''
    } = req.body || {};

    if (!name || String(name).trim() === '') {
      return res.status(400).json({ success: false, message: 'Account name is required' });
    }

    const normalizedType = String(type).trim().toUpperCase();
    const validTypes = ['CURRENT', 'SAVINGS', 'INVESTMENT', 'CREDIT_CARD'];
    if (!validTypes.includes(normalizedType)) {
      return res.status(400).json({ success: false, message: 'Invalid account type' });
    }

    const account = await Account.create({
      name: String(name).trim(),
      type: normalizedType,
      balance: parseFloat(balance) || 0,
      currency: currency || 'RUPEES',
      isDefault: Boolean(isDefault),
      color: color || '#3B82F6',
      description: description || '',
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account
    });
  } catch (error) {
    console.error('Account creation error:', error);

    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'An account with this name already exists' });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAccount = async (req, res) => {
  try {
    let account = await Account.findOne({ _id: req.params.id, user: req.user.id });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const { balance, type, ...rest } = req.body || {};
    const updateData = { ...rest };

    if (type) {
      const normalizedType = String(type).trim().toUpperCase();
      const validTypes = ['CURRENT', 'SAVINGS', 'INVESTMENT', 'CREDIT_CARD'];
      if (!validTypes.includes(normalizedType)) {
        return res.status(400).json({ success: false, message: 'Invalid account type' });
      }
      updateData.type = normalizedType;
    }

    account = await Account.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Account updated successfully',
      data: account
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user.id });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const transactionCount = await Transaction.countDocuments({ account: req.params.id });
    if (transactionCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete account with existing transactions' });
    }

    await Account.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const setDefaultAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user.id });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    await Account.updateMany({ user: req.user.id }, { isDefault: false });

    account.isDefault = true;
    await account.save();

    res.status(200).json({
      success: true,
      message: 'Default account updated successfully',
      data: account
    });
  } catch (error) {
    console.error('Set default account error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAccountStats = async (req, res) => {
  try {
    const accountId = req.params.id;
    const userId = req.user.id;

    const account = await Account.findOne({ _id: accountId, user: userId });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const mkMatch = (type) => ([
      {
        $match: {
          account: account._id,
          user: userId,
          type,
          $expr: {
            $and: [
              { $eq: [{ $month: '$date' }, currentMonth] },
              { $eq: [{ $year: '$date' }, currentYear] }
            ]
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyIncome = await Transaction.aggregate(mkMatch('INCOME'));
    const monthlyExpenses = await Transaction.aggregate(mkMatch('EXPENSE'));

    const stats = {
      currentBalance: account.balance,
      monthlyIncome: monthlyIncome[0]?.total || 0,
      monthlyExpenses: monthlyExpenses[0]?.total || 0,
      netFlow: (monthlyIncome[0]?.total || 0) - (monthlyExpenses[0]?.total || 0),
      transactionCount: await Transaction.countDocuments({ account: accountId, user: userId })
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Get account stats error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
