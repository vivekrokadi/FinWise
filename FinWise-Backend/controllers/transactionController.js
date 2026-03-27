import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import { checkAndSendBudgetAlerts } from './notificationController.js';
import Account from '../models/Account.js';
import { calculateNextRecurringDate } from '../utils/helpers.js';

const normalizeType = (t) => (typeof t === 'string' ? t.trim().toUpperCase() : t);
const normalizeCategory = (c) => (typeof c === 'string' ? c.trim().toLowerCase() : c);

export const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      account,
      startDate,
      endDate,
      search
    } = req.query;

    let query = { user: new mongoose.Types.ObjectId(req.user.id) };

    if (type) query.type = normalizeType(type);

    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (account) query.account = account;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { merchant: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const lim = Math.min(100, Math.max(1, Number(limit)));

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('account', 'name type')
        .sort({ date: -1 })
        .limit(lim)
        .skip((pageNum - 1) * lim),
      Transaction.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pagination: {
        page: pageNum,
        pages: Math.ceil(total / lim)
      },
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: new mongoose.Types.ObjectId(req.user.id)
    }).populate('account', 'name type');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      description,
      date,
      category,
      subcategory = '',
      merchant = '',
      isRecurring = false,
      recurringInterval = null,
      account: accountId,
      tags = [],
      taxDeductible = false,
      investmentType = null
    } = req.body || {};

    const requiredFields = ['type', 'amount', 'description', 'category', 'account'];
    const missingFields = requiredFields.filter(
      (field) => !req.body || req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const normalizedType = normalizeType(type);
    const validTypes = ['INCOME', 'EXPENSE', 'INVESTMENT', 'TAX'];
    if (!validTypes.includes(normalizedType)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction type' });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    // Verify account belongs to the logged-in user
    const account = await Account.findOne({ _id: accountId, user: new mongoose.Types.ObjectId(req.user.id) });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    let normalizedInvestmentType = null;
    if (normalizedType === 'INVESTMENT' && investmentType) {
      normalizedInvestmentType = String(investmentType).trim().toUpperCase();
      const validInvestmentTypes = ['STOCKS', 'CRYPTO', 'REAL_ESTATE', 'BONDS', 'MUTUAL_FUNDS', 'OTHER'];
      if (!validInvestmentTypes.includes(normalizedInvestmentType)) {
        return res.status(400).json({ success: false, message: 'Invalid investment type' });
      }
    }

    const nextRecurringDate =
      isRecurring && recurringInterval
        ? calculateNextRecurringDate(date || new Date(), recurringInterval)
        : null;

    const transaction = await Transaction.create({
      type: normalizedType,
      amount: amountNum,
      description: String(description).trim(),
      date: date ? new Date(date) : new Date(),
      category: normalizeCategory(category),
      subcategory: String(subcategory || '').trim(),
      merchant: String(merchant || '').trim(),
      isRecurring: Boolean(isRecurring),
      recurringInterval: isRecurring ? recurringInterval : null,
      nextRecurringDate,
      account: accountId,
      user: new mongoose.Types.ObjectId(req.user.id),
      tags: Array.isArray(tags) ? tags : [],
      taxDeductible: Boolean(taxDeductible),
      investmentType: normalizedInvestmentType
    });

    await transaction.populate('account', 'name type');

    // Fire budget alert check in background (non-blocking — don't delay response)
    if (transaction.type === 'EXPENSE') {
      checkAndSendBudgetAlerts(req.user.id).catch(err =>
        console.error('Budget alert check failed:', err.message)
      );
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    // Find the transaction and verify ownership
    const existing = await Transaction.findOne({
      _id: req.params.id,
      user: new mongoose.Types.ObjectId(req.user.id)
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const update = { ...req.body };

    // Validate and normalize type if being updated
    if (update.type) {
      update.type = normalizeType(update.type);
      const validTypes = ['INCOME', 'EXPENSE', 'INVESTMENT', 'TAX'];
      if (!validTypes.includes(update.type)) {
        return res.status(400).json({ success: false, message: 'Invalid transaction type' });
      }
    }

    if (update.amount !== undefined) {
      const amountNum = parseFloat(update.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
      }
      update.amount = amountNum;
    }

    if (update.category) {
      update.category = normalizeCategory(update.category);
    }

    if (update.investmentType) {
      update.investmentType = String(update.investmentType).trim().toUpperCase();
    }

    // Prevent changing the owner or account to another user's account
    delete update.user;
    if (update.account) {
      const account = await Account.findOne({ _id: update.account, user: new mongoose.Types.ObjectId(req.user.id) });
      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }
    }

    // Manually adjust account balance for the difference
    // Old balance delta (to reverse) and new balance delta (to apply)
    const oldType = existing.type;
    const oldAmount = existing.amount;
    const oldAccount = existing.account.toString();

    const newType = update.type || oldType;
    const newAmount = update.amount !== undefined ? update.amount : oldAmount;
    const newAccount = update.account || oldAccount;

    const getBalanceDelta = (type, amount) => {
      if (type === 'INCOME') return amount;
      if (type === 'EXPENSE' || type === 'INVESTMENT' || type === 'TAX') return -amount;
      return 0;
    };

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('account', 'name type');

    // Adjust account balances after update
    if (oldAccount === newAccount) {
      // Same account: reverse old delta, apply new delta
      const Account = (await import('../models/Account.js')).default;
      const account = await Account.findById(oldAccount);
      if (account) {
        account.balance -= getBalanceDelta(oldType, oldAmount);
        account.balance += getBalanceDelta(newType, newAmount);
        await account.save();
      }
    } else {
      // Different accounts: reverse from old, apply to new
      const Account = (await import('../models/Account.js')).default;
      const [oldAcc, newAcc] = await Promise.all([
        Account.findById(oldAccount),
        Account.findById(newAccount)
      ]);
      if (oldAcc) {
        oldAcc.balance -= getBalanceDelta(oldType, oldAmount);
        await oldAcc.save();
      }
      if (newAcc) {
        newAcc.balance += getBalanceDelta(newType, newAmount);
        await newAcc.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: new mongoose.Types.ObjectId(req.user.id)
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // findOneAndDelete triggers the post hook that reverses account balance
    await Transaction.findOneAndDelete({ _id: req.params.id, user: new mongoose.Types.ObjectId(req.user.id) });

    res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkDeleteTransactions = async (req, res) => {
  try {
    const { transactionIds } = req.body || {};

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide transaction IDs to delete' });
    }

    // Verify all transactions belong to this user
    const userTransactions = await Transaction.find({
      _id: { $in: transactionIds },
      user: new mongoose.Types.ObjectId(req.user.id)
    });

    if (userTransactions.length !== transactionIds.length) {
      return res.status(403).json({ success: false, message: 'Some transactions do not belong to you' });
    }

    // Delete one by one so the findOneAndDelete post hook fires for each
    // This ensures account balances are correctly reversed for every transaction
    for (const _id of transactionIds) {
      await Transaction.findOneAndDelete({ _id, user: new mongoose.Types.ObjectId(req.user.id) });
    }

    res.status(200).json({
      success: true,
      message: `${transactionIds.length} transactions deleted successfully`
    });
  } catch (error) {
    console.error('Bulk delete transactions error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate, account } = req.query;
    const userId = req.user.id;

    const matchQuery = { user: new mongoose.Types.ObjectId(userId) };
    if (account) matchQuery.account = account;

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const zero = { totalAmount: 0, count: 0 };
    const byType = (t) => stats.find((s) => s._id === t) || zero;

    const income = byType('INCOME');
    const expense = byType('EXPENSE');
    const investment = byType('INVESTMENT');
    const tax = byType('TAX');

    res.status(200).json({
      success: true,
      data: {
        income: income.totalAmount,
        expense: expense.totalAmount,
        investment: investment.totalAmount,
        tax: tax.totalAmount,
        net: income.totalAmount - expense.totalAmount - investment.totalAmount - tax.totalAmount,
        transactionCount: income.count + expense.count + investment.count + tax.count,
        incomeCount: income.count,
        expenseCount: expense.count,
        investmentCount: investment.count,
        taxCount: tax.count
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCategoryBreakdown = async (req, res) => {
  try {
    const { type = 'EXPENSE', startDate, endDate } = req.query;
    const userId = req.user.id;

    const matchQuery = { user: new mongoose.Types.ObjectId(userId), type: normalizeType(type) };

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const breakdown = await Transaction.aggregate([
      { $match: matchQuery },
      { $addFields: { category_lc: { $toLower: '$category' } } },
      {
        $group: {
          _id: '$category_lc',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};