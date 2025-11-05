import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

export const getBudgets = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const budgets = await Budget.find({ 
      user: req.user.id,
      year: parseInt(year)
    }).sort({ category: 1 });

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.year, budget.month - 1, 1);
        const endDate = new Date(budget.year, budget.month, 0);
        
        const expenses = await Transaction.aggregate([
          {
            $match: {
              user: req.user.id,
              type: 'EXPENSE',
              category: budget.category,
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const currentSpending = expenses[0]?.total || 0;
        
        return {
          ...budget.toObject(),
          currentSpending,
          remainingAmount: Math.max(0, budget.amount - currentSpending),
          percentageUsed: budget.amount > 0 ? (currentSpending / budget.amount) * 100 : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      count: budgetsWithSpending.length,
      data: budgetsWithSpending
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getCurrentBudget = async (req, res) => {
  try {
    const { accountId } = req.query;
    const userId = req.user.id;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const budget = await Budget.findOne({
      user: userId,
      year: currentYear,
      month: currentMonth,
      period: 'MONTHLY'
    });

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    let expenseMatch = {
      user: userId,
      type: 'EXPENSE',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    };

    if (accountId) {
      expenseMatch.account = accountId;
    }

    const expenses = await Transaction.aggregate([
      { $match: expenseMatch },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const currentExpenses = expenses[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        budget: budget ? {
          ...budget.toObject(),
          currentSpending: currentExpenses,
          remainingAmount: Math.max(0, budget.amount - currentExpenses),
          percentageUsed: budget.amount > 0 ? (currentExpenses / budget.amount) * 100 : 0
        } : null,
        currentExpenses
      }
    });
  } catch (error) {
    console.error('Get current budget error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const createOrUpdateBudget = async (req, res) => {
  try {
    const { amount, period, category, year, month, alertsEnabled, alertThreshold } = req.body;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const budgetData = {
      amount,
      period: period || 'MONTHLY',
      category,
      year: year || currentYear,
      month: period === 'MONTHLY' ? (month || currentMonth) : undefined,
      user: req.user.id,
      alertsEnabled: alertsEnabled !== undefined ? alertsEnabled : true,
      alertThreshold: alertThreshold || 80
    };

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user.id,
        category,
        year: budgetData.year,
        month: budgetData.month,
        period: budgetData.period
      },
      budgetData,
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    const action = budget.isNew ? 'created' : 'updated';

    res.status(200).json({
      success: true,
      message: `Budget ${action} successfully`,
      data: budget
    });
  } catch (error) {
    console.error('Create/update budget error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: updatedBudget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getBudgetAlerts = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const budgets = await Budget.find({
      user: req.user.id,
      year: currentYear,
      month: currentMonth,
      alertsEnabled: true
    });

    const alerts = await Promise.all(
      budgets.map(async (budget) => {
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0);

        const expenses = await Transaction.aggregate([
          {
            $match: {
              user: req.user.id,
              type: 'EXPENSE',
              category: budget.category,
              date: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const currentSpending = expenses[0]?.total || 0;
        const percentageUsed = budget.amount > 0 ? (currentSpending / budget.amount) * 100 : 0;

        if (percentageUsed >= budget.alertThreshold) {
          return {
            budgetId: budget._id,
            category: budget.category,
            budgetAmount: budget.amount,
            currentSpending,
            percentageUsed: percentageUsed.toFixed(1),
            alertType: percentageUsed >= 100 ? 'EXCEEDED' : 'WARNING',
            message: percentageUsed >= 100 
              ? `Budget exceeded for ${budget.category}`
              : `Budget alert: ${percentageUsed.toFixed(1)}% used for ${budget.category}`
          };
        }
        return null;
      })
    );

    const activeAlerts = alerts.filter(alert => alert !== null);

    res.status(200).json({
      success: true,
      count: activeAlerts.length,
      data: activeAlerts
    });
  } catch (error) {
    console.error('Get budget alerts error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getBudgetStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const budgets = await Budget.find({
      user: req.user.id,
      year: currentYear,
      month: currentMonth
    });

    const statsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0);

        const expenses = await Transaction.aggregate([
          {
            $match: {
              user: req.user.id,
              type: 'EXPENSE',
              category: budget.category,
              date: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const currentSpending = expenses[0]?.total || 0;
        const percentageUsed = budget.amount > 0 ? (currentSpending / budget.amount) * 100 : 0;

        return {
          category: budget.category,
          budgetAmount: budget.amount,
          currentSpending,
          percentageUsed: percentageUsed.toFixed(1),
          remainingAmount: Math.max(0, budget.amount - currentSpending),
          status: percentageUsed >= 100 ? 'EXCEEDED' : 
                 percentageUsed >= 80 ? 'WARNING' : 'HEALTHY'
        };
      })
    );

    const totalBudget = statsWithSpending.reduce((sum, stat) => sum + stat.budgetAmount, 0);
    const totalSpending = statsWithSpending.reduce((sum, stat) => sum + stat.currentSpending, 0);
    const overallPercentage = totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        overall: {
          totalBudget,
          totalSpending,
          percentageUsed: overallPercentage.toFixed(1),
          remainingAmount: Math.max(0, totalBudget - totalSpending)
        },
        byCategory: statsWithSpending
      }
    });
  } catch (error) {
    console.error('Get budget stats error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};