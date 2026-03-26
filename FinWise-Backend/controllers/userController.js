import mongoose from 'mongoose';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import cloudinary from '../config/cloudinary.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    const rolling30Start = new Date(now);
    rolling30Start.setDate(rolling30Start.getDate() - 30);
    rolling30Start.setHours(0, 0, 0, 0);
    const rolling30End = new Date(now);
    rolling30End.setHours(23, 59, 59, 999);

    const accounts = await Account.find({ user: userObjectId });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const rollingStats = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: rolling30Start, $lte: rolling30End }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const getTotal = (type) => rollingStats.find((s) => s._id === type)?.total || 0;
    const monthlyIncome = getTotal('INCOME');
    const monthlyExpenses = getTotal('EXPENSE');
    const monthlyInvestments = getTotal('INVESTMENT');

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' })
      });
    }

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const trendRaw = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: sixMonthsAgo, $lte: rolling30End },
          type: { $in: ['INCOME', 'EXPENSE'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyTrend = months.map(({ year, month, label }) => {
      const income = trendRaw.find(
        (r) => r._id.year === year && r._id.month === month && r._id.type === 'INCOME'
      )?.total || 0;
      const expense = trendRaw.find(
        (r) => r._id.year === year && r._id.month === month && r._id.type === 'EXPENSE'
      )?.total || 0;
      return { label, income, expense, net: income - expense };
    });

    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: 'EXPENSE',
          date: { $gte: rolling30Start, $lte: rolling30End }
        }
      },
      {
        $group: {
          _id: { $toLower: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 6 } 
    ]);

    const recentTransactions = await Transaction.find({ user: userObjectId })
      .populate('account', 'name type')
      .sort({ date: -1 })
      .limit(5);

    const upcomingBills = await Transaction.find({
      user: userObjectId,
      isRecurring: true,
      nextRecurringDate: { $gte: now }
    })
      .sort({ nextRecurringDate: 1 })
      .limit(5);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const budgetModel = (await import('../models/Budget.js')).default;
    const budgets = await budgetModel.find({
      user: userObjectId,
      year: now.getFullYear(),
      month: now.getMonth() + 1
    });

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

    const monthlyExpenseForBudget = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: 'EXPENSE',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const actualMonthlyExpense = monthlyExpenseForBudget[0]?.total || 0;
    const budgetUsage = totalBudget > 0
      ? parseFloat(((actualMonthlyExpense / totalBudget) * 100).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlyInvestments,
        netWorth: totalBalance,
        savingsRate: monthlyIncome > 0
          ? parseFloat(((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1))
          : 0,

        budgetUsage,
        totalBudget,

        monthlyTrend,
        categoryBreakdown,  

        recentTransactions,
        upcomingBills,
        accountCount: accounts.length,

        period: 'Last 30 days'
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOneAndDelete({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'finwise/avatars',
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: uploadResult.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar: user.avatar }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};