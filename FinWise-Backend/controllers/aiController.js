import { 
  scanReceiptWithAI, 
  generateFinancialInsights, 
  generateInvestmentSuggestions,
  generateTaxTips,
  testGeminiConnection
} from '../utils/aiService.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import Budget from '../models/Budget.js';

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
    console.log('🔍 Starting insights generation...');
    console.log('Insights request body:', req.body); // Debug log
    
    const { period = 'month', accountId } = req.body || {};
    const userId = req.user.id;

    // Get financial data for the period
    const startDate = new Date();
    if (period === 'month') {
      startDate.setDate(1);
    } else if (period === 'year') {
      startDate.setMonth(0, 1);
    } else if (period === 'quarter') {
      const currentQuarter = Math.floor(startDate.getMonth() / 3);
      startDate.setMonth(currentQuarter * 3, 1);
    }

    const endDate = new Date();

    let matchQuery = {
      user: userId,
      date: { $gte: startDate, $lte: endDate }
    };

    if (accountId) {
      matchQuery.account = accountId;
    }

    console.log('📊 Fetching transactions for insights...');
    const transactions = await Transaction.find(matchQuery);
    console.log(`📈 Found ${transactions.length} transactions`);
    
    const stats = transactions.reduce((acc, transaction) => {
      const amount = transaction.amount;
      
      if (transaction.type === 'EXPENSE') {
        acc.totalExpenses += amount;
        acc.byCategory[transaction.category] = (acc.byCategory[transaction.category] || 0) + amount;
      } else if (transaction.type === 'INCOME') {
        acc.totalIncome += amount;
      } else if (transaction.type === 'INVESTMENT') {
        acc.totalInvestment += amount;
      }
      
      return acc;
    }, {
      totalExpenses: 0,
      totalIncome: 0,
      totalInvestment: 0,
      byCategory: {},
      transactionCount: transactions.length
    });

    console.log('📋 Financial stats calculated:', stats);

    // Generate AI insights
    console.log('🤖 Calling AI service for insights...');
    const insights = await generateFinancialInsights({
      period,
      ...stats,
      netIncome: stats.totalIncome - stats.totalExpenses
    });

    console.log('✅ Insights generated successfully');

    res.status(200).json({
      success: true,
      data: {
        insights,
        summary: {
          totalIncome: stats.totalIncome,
          totalExpenses: stats.totalExpenses,
          totalInvestment: stats.totalInvestment,
          netIncome: stats.totalIncome - stats.totalExpenses,
          transactionCount: stats.transactionCount
        },
        period: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (error) {
    console.error('❌ Error in generateInsights controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate insights',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getInvestmentSuggestions = async (req, res) => {
  try {
    console.log('Investment suggestions request body:', req.body); // Debug log
    
    const { riskTolerance = 'MODERATE', investmentAmount = 1000 } = req.body || {};
    const userId = req.user.id;

    // Get user financial data
    const accounts = await Account.find({ user: userId });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const transactions = await Transaction.find({
      user: userId,
      type: 'INVESTMENT'
    }).sort({ date: -1 }).limit(10);

    const userData = {
      totalBalance,
      investmentHistory: transactions.length,
      recentInvestments: transactions.slice(0, 3).map(t => ({
        type: t.investmentType,
        amount: t.amount
      }))
    };

    console.log('🤖 Generating investment suggestions...');
    const suggestions = await generateInvestmentSuggestions(userData, riskTolerance, investmentAmount);

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        riskProfile: riskTolerance,
        investmentAmount,
        userSnapshot: userData,
        disclaimer: 'These are general suggestions. Please consult with a financial advisor for personalized advice.'
      }
    });
  } catch (error) {
    console.error('❌ Investment suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate investment suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getTaxTips = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();

    const taxDeductibleExpenses = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          taxDeductible: true,
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
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

    const totalDeductible = taxDeductibleExpenses.reduce((sum, item) => sum + item.total, 0);

    const investments = await Transaction.find({
      user: userId,
      type: 'INVESTMENT',
      date: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      }
    });

    const totalInvestments = investments.reduce((sum, inv) => sum + inv.amount, 0);

    const taxData = {
      year: currentYear,
      totalDeductible,
      totalInvestments,
      taxDeductibleCount: taxDeductibleExpenses.length,
      investmentCount: investments.length
    };

    console.log('🤖 Generating tax tips...');
    const tips = await generateTaxTips(taxData);

    res.status(200).json({
      success: true,
      data: {
        tips,
        taxYear: currentYear,
        totalDeductibleExpenses: totalDeductible,
        totalInvestments: totalInvestments,
        note: 'Consult with a tax professional for personalized advice.'
      }
    });
  } catch (error) {
    console.error('❌ Tax tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate tax tips'
    });
  }
};

// Test endpoint for Gemini connection
export const testAIConnection = async (req, res) => {
  try {
    const result = await testGeminiConnection();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI connection test failed',
      error: error.message
    });
  }
};