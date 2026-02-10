import {
  scanReceiptWithAI,
  generateFinancialInsights,
  generateInvestmentSuggestions as aiInvestmentSuggestions,
  generateTaxTips as aiTaxTips
} from '../utils/aiService.js';

import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

export const scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a receipt image'
      });
    }

    const scannedData = await scanReceiptWithAI(
      req.file.buffer,
      req.file.mimetype
    );

    res.status(200).json({
      success: true,
      message: 'Receipt scanned successfully',
      data: scannedData
    });
  } catch (error) {
    console.error('Receipt scanning error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to scan receipt'
    });
  }
};

export const generateInsights = async (req, res) => {
  try {
    const { period = 'month', accountId } = req.body || {};
    const userId = req.user.id;

    const now = new Date();
    const startDate = new Date(now);

    // Set window based on period
    if (period === 'month') {
      startDate.setDate(1);
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'year') {
      startDate.setMonth(0, 1);
    } else if (period === 'quarter') {
      const quarter = Math.floor(startDate.getMonth() / 3);
      startDate.setMonth(quarter * 3, 1);
    } else if (period === 'all') {
      startDate.setFullYear(1970);
    }

    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    const mkQuery = (from, to) => {
      const q = {
        user: userId,
        date: { $gte: from, $lte: to }
      };
      if (accountId) q.account = accountId;
      return q;
    };

    
    let matchQuery = mkQuery(startDate, endDate);
    let transactions = await Transaction.find(matchQuery);

    if (transactions.length === 0 && period !== 'all') {
      const d90 = new Date(now);
      d90.setDate(now.getDate() - 90);
      matchQuery = mkQuery(d90, endDate);
      transactions = await Transaction.find(matchQuery);
    }

    // Build financial summary
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
        period: {
          start: matchQuery.date.$gte,
          end: matchQuery.date.$lte
        }
      }
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate insights'
    });
  }
};

export const getInvestmentSuggestions = async (req, res) => {
  try {
    const { riskTolerance = 'MODERATE', investmentAmount = 1000 } = req.body;
    const userId = req.user.id;

    const accounts = await Account.find({ user: userId });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const recentInv = await Transaction.find({
      user: userId,
      type: 'INVESTMENT'
    })
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

    const suggestions = await aiInvestmentSuggestions(
      userData,
      riskTolerance,
      investmentAmount
    );

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        riskProfile: riskTolerance,
        investmentAmount,
        userSnapshot: userData
      }
    });
  } catch (error) {
    console.error('Investment suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate investment suggestions'
    });
  }
};


export const getTaxTips = async (req, res) => {
  try {
    const userId = req.user.id;
    const year = new Date().getFullYear();

    const deductible = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          taxDeductible: true,
          date: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31)
          }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalDeductible = deductible.reduce((s, d) => s + d.total, 0);

    const investments = await Transaction.find({
      user: userId,
      type: 'INVESTMENT',
      date: {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31)
      }
    });

    const totalInvestments = investments.reduce((s, t) => s + t.amount, 0);

    const payload = {
      year,
      totalDeductible,
      totalInvestments,
      taxDeductibleCount: deductible.length,
      investmentCount: investments.length
    };

    const tips = await aiTaxTips(payload);

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
    res.status(500).json({
      success: false,
      message: 'Failed to generate tax tips'
    });
  }
};
