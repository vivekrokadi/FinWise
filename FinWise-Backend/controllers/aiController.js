import mongoose from 'mongoose';
import {
  scanReceiptWithAI,
  generateFinancialInsights,
  generateInvestmentSuggestions as aiInvestmentSuggestions,
  generateTaxTips as aiTaxTips,
  testGeminiConnection
} from '../utils/aiService.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

export const scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a receipt image' });
    }

    const scannedData = await scanReceiptWithAI(req.file.buffer, req.file.mimetype);

    res.status(200).json({
      success: true,
      message: scannedData.aiScanned
        ? 'Receipt scanned successfully'
        : 'Receipt uploaded — please fill in the details manually',
      data: scannedData
    });
  } catch (error) {
    console.error('Receipt scanning error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to scan receipt' });
  }
};

export const generateInsights = async (req, res) => {
  try {
    const { period = 'month', accountId } = req.body || {};
    const userId = req.user.id;

    const now = new Date();
    let startDate = new Date(now);

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(1);
        break;
      case 'quarter': {
        const quarter = Math.floor(startDate.getMonth() / 3);
        startDate.setMonth(quarter * 3, 1);
        break;
      }
      case 'year':
        startDate.setMonth(0, 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate.setDate(1);
    }

    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    const baseQuery = { user: new mongoose.Types.ObjectId(userId), date: { $gte: startDate, $lte: endDate } };
    if (accountId) baseQuery.account = accountId;

    let transactions = await Transaction.find(baseQuery);

    // If no transactions in the chosen period, look back 90 days
    if (transactions.length === 0 && period !== 'all') {
      const d90 = new Date(now);
      d90.setDate(now.getDate() - 90);
      const fallbackQuery = { user: new mongoose.Types.ObjectId(userId), date: { $gte: d90, $lte: endDate } };
      if (accountId) fallbackQuery.account = accountId;
      transactions = await Transaction.find(fallbackQuery);
    }

    const stats = transactions.reduce(
      (acc, t) => {
        const amt = t.amount;
        if (t.type === 'EXPENSE') {
          acc.totalExpenses += amt;
          const cat = (t.category || '').toLowerCase();
          acc.byCategory[cat] = (acc.byCategory[cat] || 0) + amt;
        } else if (t.type === 'INCOME') {
          acc.totalIncome += amt;
        } else if (t.type === 'INVESTMENT') {
          acc.totalInvestment += amt;
        } else if (t.type === 'TAX') {
          acc.totalTax += amt;
        }
        return acc;
      },
      {
        totalExpenses: 0,
        totalIncome: 0,
        totalInvestment: 0,
        totalTax: 0,
        byCategory: {},
        transactionCount: transactions.length
      }
    );

    const insights = await generateFinancialInsights({
      period,
      ...stats,
      netIncome: stats.totalIncome - stats.totalExpenses
    });

    res.status(200).json({
      success: true,
      data: {
        insights,
        summary: {
          totalIncome: stats.totalIncome,
          totalExpenses: stats.totalExpenses,
          totalInvestment: stats.totalInvestment,
          totalTax: stats.totalTax,
          netIncome: stats.totalIncome - stats.totalExpenses,
          transactionCount: stats.transactionCount
        },
        period: { start: startDate, end: endDate }
      }
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate insights' });
  }
};

export const getInvestmentSuggestions = async (req, res) => {
  try {
    const { riskTolerance = 'MODERATE', investmentAmount = 1000 } = req.body;
    const userId = req.user.id;

    const validRiskProfiles = ['LOW', 'MODERATE', 'HIGH'];
    const normalizedRisk = String(riskTolerance).toUpperCase();
    if (!validRiskProfiles.includes(normalizedRisk)) {
      return res.status(400).json({ success: false, message: 'Invalid risk tolerance. Use LOW, MODERATE, or HIGH.' });
    }

    const amountNum = parseFloat(investmentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ success: false, message: 'Investment amount must be a positive number.' });
    }

    const accounts = await Account.find({ user: new mongoose.Types.ObjectId(userId) });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const recentInv = await Transaction.find({ user: new mongoose.Types.ObjectId(userId), type: 'INVESTMENT' })
      .sort({ date: -1 })
      .limit(5);

    const userData = {
      totalBalance,
      investmentHistory: recentInv.length,
      recentInvestments: recentInv.map((t) => ({
        type: t.investmentType || 'UNKNOWN',
        amount: t.amount
      }))
    };

    const suggestions = await aiInvestmentSuggestions(userData, normalizedRisk, amountNum);

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        riskProfile: normalizedRisk,
        investmentAmount: amountNum,
        userSnapshot: userData
      }
    });
  } catch (error) {
    console.error('Investment suggestions error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate investment suggestions' });
  }
};

export const getTaxTips = async (req, res) => {
  try {
    const userId = req.user.id;
    const year = new Date().getFullYear();

    const [deductible, investments] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            taxDeductible: true,
            date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) }
          }
        },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ]),
      Transaction.find({
        user: new mongoose.Types.ObjectId(userId),
        type: 'INVESTMENT',
        date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) }
      })
    ]);

    const totalDeductible = deductible.reduce((s, d) => s + d.total, 0);
    const totalInvestments = investments.reduce((s, t) => s + t.amount, 0);

    const tips = await aiTaxTips({
      year,
      totalDeductible,
      totalInvestments,
      taxDeductibleCount: deductible.length,
      investmentCount: investments.length
    });

    res.status(200).json({
      success: true,
      data: {
        tips,
        taxYear: year,
        totalDeductibleExpenses: totalDeductible,
        totalInvestments
      }
    });
  } catch (error) {
    console.error('Tax tips error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate tax tips' });
  }
};

export const checkAIStatus = async (req, res) => {
  try {
    const result = await testGeminiConnection();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};