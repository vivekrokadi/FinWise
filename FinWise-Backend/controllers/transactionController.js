import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import { calculateNextRecurringDate } from '../utils/helpers.js';

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

    let query = { user: req.user.id };

    if (type) query.type = type;
    if (category) query.category = category;
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

    const transactions = await Transaction.find(query)
      .populate('account', 'name type')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit)
      },
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('account', 'name type');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const createTransaction = async (req, res) => {
  try {
    console.log('Transaction request body:', req.body); // Debug log
    
    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is missing'
      });
    }

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
    } = req.body;

    if (!type || !amount || !description || !category || !accountId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, amount, description, category, account'
      });
    }

    const account = await Account.findOne({
      _id: accountId,
      user: req.user.id
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const nextRecurringDate = isRecurring && recurringInterval
      ? calculateNextRecurringDate(date || new Date(), recurringInterval)
      : null;

    const transaction = await Transaction.create({
      type,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
      category,
      subcategory,
      merchant,
      isRecurring: Boolean(isRecurring),
      recurringInterval: isRecurring ? recurringInterval : null,
      nextRecurringDate,
      account: accountId,
      user: req.user.id,
      tags,
      taxDeductible: Boolean(taxDeductible),
      investmentType: type === 'INVESTMENT' ? investmentType : null
    });

    await transaction.populate('account', 'name type');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('account', 'name type');

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const bulkDeleteTransactions = async (req, res) => {
  try {
    const { transactionIds } = req.body;

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide transaction IDs to delete'
      });
    }

    const userTransactions = await Transaction.find({
      _id: { $in: transactionIds },
      user: req.user.id
    });

    if (userTransactions.length !== transactionIds.length) {
      return res.status(403).json({
        success: false,
        message: 'Some transactions do not belong to you'
      });
    }

    await Transaction.deleteMany({
      _id: { $in: transactionIds },
      user: req.user.id
    });

    res.status(200).json({
      success: true,
      message: `${transactionIds.length} transactions deleted successfully`
    });
  } catch (error) {
    console.error('Bulk delete transactions error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate, account } = req.query;
    const userId = req.user.id;

    let matchQuery = { user: userId };
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

    const income = stats.find(s => s._id === 'INCOME') || { totalAmount: 0, count: 0 };
    const expense = stats.find(s => s._id === 'EXPENSE') || { totalAmount: 0, count: 0 };
    const investment = stats.find(s => s._id === 'INVESTMENT') || { totalAmount: 0, count: 0 };

    const result = {
      income: income.totalAmount,
      expense: expense.totalAmount,
      investment: investment.totalAmount,
      net: income.totalAmount - expense.totalAmount,
      transactionCount: income.count + expense.count + investment.count,
      incomeCount: income.count,
      expenseCount: expense.count,
      investmentCount: investment.count
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getCategoryBreakdown = async (req, res) => {
  try {
    const { type = 'EXPENSE', startDate, endDate } = req.query;
    const userId = req.user.id;

    let matchQuery = { user: userId, type };
    
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const breakdown = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};