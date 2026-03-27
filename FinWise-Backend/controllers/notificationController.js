import mongoose from 'mongoose';
import User from '../models/User.js';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { sendBudgetAlertEmail, sendWeeklyReportEmail, testEmailConnection } from '../utils/emailService.js';

const lc = (s) => (typeof s === 'string' ? s.toLowerCase() : s);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get current spending for a budget in its period.
 */
const getSpendingForBudget = async (budget) => {
  const startDate = new Date(budget.year, budget.month - 1, 1);
  const endDate   = new Date(budget.year, budget.month, 0, 23, 59, 59, 999);

  const result = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(budget.user),
        type: 'EXPENSE',
        $expr: { $eq: [{ $toLower: '$category' }, lc(budget.category)] },
        date: { $gte: startDate, $lte: endDate }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  return result[0]?.total || 0;
};

// ─── Check budgets and fire alert emails for a specific user ──────────────────
export const checkAndSendBudgetAlerts = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.notificationPrefs?.budgetAlerts) return;

  const now = new Date();
  const budgets = await Budget.find({
    user: new mongoose.Types.ObjectId(userId),
    alertsEnabled: true,
    year: now.getFullYear(),
    month: now.getMonth() + 1
  });

  for (const budget of budgets) {
    const currentSpending = await getSpendingForBudget(budget);
    const percentageUsed  = budget.amount > 0 ? (currentSpending / budget.amount) * 100 : 0;

    if (percentageUsed < budget.alertThreshold) continue;

    // Cooldown: don't re-send same alert within 24 hours
    const lastSent = budget.lastAlertSent;
    if (lastSent) {
      const hoursSinceLast = (now - new Date(lastSent)) / (1000 * 60 * 60);
      if (hoursSinceLast < 24) continue;
    }

    await sendBudgetAlertEmail({ user, budget, currentSpending, percentageUsed });

    // Record when alert was last sent
    await Budget.findByIdAndUpdate(budget._id, { lastAlertSent: now });
  }
};

// ─── Route: POST /api/notifications/check-budgets ─────────────────────────────
// Called by the frontend after creating a transaction — triggers check for the user
export const checkBudgets = async (req, res) => {
  try {
    await checkAndSendBudgetAlerts(req.user.id);
    res.status(200).json({ success: true, message: 'Budget alerts checked' });
  } catch (error) {
    console.error('checkBudgets error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Route: POST /api/notifications/send-report ───────────────────────────────
// Manually trigger a weekly report for the authenticated user
export const sendWeeklyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const user   = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const report = await buildWeeklyReport(userId);
    const result = await sendWeeklyReportEmail({ user, report });

    if (result.success) {
      res.status(200).json({ success: true, message: `Report sent to ${user.email}` });
    } else {
      res.status(500).json({ success: false, message: result.reason || 'Failed to send report' });
    }
  } catch (error) {
    console.error('sendWeeklyReport error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Route: PUT /api/notifications/preferences ────────────────────────────────
export const updateNotificationPrefs = async (req, res) => {
  try {
    const { budgetAlerts, weeklyReport, weeklyReportDay } = req.body;

    const update = {};
    if (budgetAlerts  !== undefined) update['notificationPrefs.budgetAlerts']    = budgetAlerts;
    if (weeklyReport  !== undefined) update['notificationPrefs.weeklyReport']     = weeklyReport;
    if (weeklyReportDay !== undefined) update['notificationPrefs.weeklyReportDay'] = weeklyReportDay;

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      data: { notificationPrefs: user.notificationPrefs }
    });
  } catch (error) {
    console.error('updateNotificationPrefs error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Route: GET /api/notifications/preferences ────────────────────────────────
export const getNotificationPrefs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        notificationPrefs: user.notificationPrefs || {
          budgetAlerts: true,
          weeklyReport: true,
          weeklyReportDay: 1
        }
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Route: GET /api/notifications/test-email ─────────────────────────────────
export const testEmail = async (req, res) => {
  try {
    const result = await testEmailConnection();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Build weekly report data ─────────────────────────────────────────────────
export const buildWeeklyReport = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now   = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);

  const weekLabel = `${start.toLocaleDateString('en-IN', { day:'numeric', month:'short' })} – ${now.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}`;

  // Transaction stats for the week
  const weeklyStats = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        date: { $gte: start, $lte: now }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const getTotal = (type) => weeklyStats.find(s => s._id === type)?.total || 0;
  const getCount = (type) => weeklyStats.find(s => s._id === type)?.count || 0;

  const totalIncome      = getTotal('INCOME');
  const totalExpenses    = getTotal('EXPENSE');
  const totalInvestments = getTotal('INVESTMENT');
  const netSavings       = totalIncome - totalExpenses;
  const savingsRate      = totalIncome > 0
    ? parseFloat(((netSavings / totalIncome) * 100).toFixed(1))
    : 0;
  const transactionCount = weeklyStats.reduce((s, r) => s + r.count, 0);

  // Top expense categories this week
  const categoryAgg = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        type: 'EXPENSE',
        date: { $gte: start, $lte: now }
      }
    },
    { $group: { _id: { $toLower: '$category' }, amount: { $sum: '$amount' } } },
    { $sort: { amount: -1 } },
    { $limit: 5 }
  ]);

  const topCategories = categoryAgg.map(c => ({
    category: c._id,
    amount:   c.amount
  }));

  // Budget status for current month
  const budgets = await Budget.find({
    user: userObjectId,
    year: now.getFullYear(),
    month: now.getMonth() + 1
  });

  const budgetSummary = await Promise.all(
    budgets.map(async (b) => {
      const spent = await getSpendingForBudget(b);
      const pct   = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      return {
        category: b.category,
        budget:   b.amount,
        spent,
        pct,
        status:   pct >= 100 ? 'EXCEEDED' : pct >= (b.alertThreshold || 80) ? 'WARNING' : 'HEALTHY'
      };
    })
  );

  return {
    weekLabel,
    totalIncome,
    totalExpenses,
    totalInvestments,
    netSavings,
    savingsRate,
    transactionCount,
    topCategories,
    budgetSummary
  };
};

// ─── Cron: send weekly reports to all opted-in users ─────────────────────────
// Called from server.js on a schedule
export const sendWeeklyReportsToAll = async () => {
  console.log('[Cron] Running weekly report job...');

  const today = new Date().getDay(); // 0=Sun … 6=Sat

  const users = await User.find({
    isActive: true,
    'notificationPrefs.weeklyReport': true,
    'notificationPrefs.weeklyReportDay': today
  });

  console.log(`[Cron] Sending reports to ${users.length} user(s)`);

  for (const user of users) {
    try {
      const report = await buildWeeklyReport(user._id);
      await sendWeeklyReportEmail({ user, report });
    } catch (err) {
      console.error(`[Cron] Failed for user ${user.email}:`, err.message);
    }
  }

  console.log('[Cron] Weekly report job complete');
};