import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// ─── Transporter ──────────────────────────────────────────────────────────────
// Supports Gmail (SMTP) — configure via .env
const createTransporter = () => {
  // Support both EMAIL_USER/EMAIL_PASS and EMAIL_USERNAME/EMAIL_PASSWORD naming
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const user = process.env.EMAIL_USER || process.env.EMAIL_USERNAME;
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    console.warn('[EmailService] Email credentials not configured — emails disabled');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

const transporter = createTransporter();
const FROM = process.env.EMAIL_FROM || `FinWise <${process.env.EMAIL_USER || process.env.EMAIL_USERNAME}>`;

// ─── Shared HTML wrapper ──────────────────────────────────────────────────────
const htmlWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#F3F4F6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#111827; }
    .wrapper { max-width:600px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
    .header  { background:linear-gradient(135deg,#2563EB,#4F46E5); padding:32px 40px; }
    .header h1 { margin:0; color:#fff; font-size:24px; font-weight:700; }
    .header p  { margin:6px 0 0; color:#BFDBFE; font-size:14px; }
    .body    { padding:32px 40px; }
    .body p  { margin:0 0 16px; line-height:1.6; color:#374151; font-size:15px; }
    .stat-row { display:flex; gap:12px; margin:20px 0; flex-wrap:wrap; }
    .stat { flex:1; min-width:120px; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; padding:14px 16px; }
    .stat .label { font-size:12px; color:#6B7280; margin-bottom:4px; }
    .stat .value { font-size:20px; font-weight:700; color:#111827; }
    .alert-box { border-radius:8px; padding:16px 20px; margin:20px 0; }
    .alert-warning  { background:#FFFBEB; border-left:4px solid #F59E0B; }
    .alert-exceeded { background:#FEF2F2; border-left:4px solid #EF4444; }
    .alert-box .title { font-weight:600; font-size:15px; margin-bottom:6px; }
    .alert-warning  .title { color:#92400E; }
    .alert-exceeded .title { color:#991B1B; }
    .alert-box .desc { font-size:14px; color:#6B7280; line-height:1.5; }
    .progress-bar { background:#E5E7EB; border-radius:6px; height:10px; margin:10px 0; overflow:hidden; }
    .progress-fill { height:100%; border-radius:6px; }
    .cat-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #F3F4F6; font-size:14px; }
    .cat-row:last-child { border:none; }
    .badge { display:inline-block; padding:2px 8px; border-radius:99px; font-size:12px; font-weight:600; }
    .badge-exceeded { background:#FEE2E2; color:#991B1B; }
    .badge-warning  { background:#FEF3C7; color:#92400E; }
    .badge-healthy  { background:#D1FAE5; color:#065F46; }
    .cta  { text-align:center; margin:28px 0 8px; }
    .cta a { display:inline-block; background:#2563EB; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; font-size:15px; }
    .footer { background:#F9FAFB; padding:20px 40px; text-align:center; font-size:12px; color:#9CA3AF; border-top:1px solid #E5E7EB; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>💰 FinWise</h1>
      <p>AI-Powered Personal Finance Assistant</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>You're receiving this because you enabled notifications in FinWise.<br/>
      Manage preferences in <strong>Settings → Notifications</strong>.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Currency formatter ───────────────────────────────────────────────────────
const fmt = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

// ─── Budget Alert Email ───────────────────────────────────────────────────────
export const sendBudgetAlertEmail = async ({ user, budget, currentSpending, percentageUsed }) => {
  if (!transporter) return { success: false, reason: 'Email not configured' };

  const isExceeded = percentageUsed >= 100;
  const remaining  = Math.max(0, budget.amount - currentSpending);
  const fillColor  = isExceeded ? '#EF4444' : '#F59E0B';
  const fillPct    = Math.min(percentageUsed, 100).toFixed(0);
  const alertClass = isExceeded ? 'alert-exceeded' : 'alert-warning';
  const alertTitle = isExceeded
    ? `⚠️ Budget Exceeded: ${budget.category}`
    : `🔔 Budget Alert: ${budget.category}`;
  const alertDesc  = isExceeded
    ? `You've spent ${fmt(currentSpending)} against a budget of ${fmt(budget.amount)} — ${percentageUsed.toFixed(1)}% used. Consider reviewing your spending.`
    : `You've used ${percentageUsed.toFixed(1)}% of your ${budget.category} budget. Only ${fmt(remaining)} remaining for this period.`;

  const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const period = budget.period === 'MONTHLY'
    ? `${months[budget.month]} ${budget.year}`
    : `${budget.year} (Yearly)`;

  const html = htmlWrapper(`
    <p>Hi <strong>${user.name}</strong>,</p>

    <div class="${alertClass} alert-box">
      <div class="title">${alertTitle}</div>
      <div class="desc">${alertDesc}</div>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Budget</div>
        <div class="value">${fmt(budget.amount)}</div>
      </div>
      <div class="stat">
        <div class="label">Spent</div>
        <div class="value" style="color:${isExceeded ? '#EF4444' : '#F59E0B'}">${fmt(currentSpending)}</div>
      </div>
      <div class="stat">
        <div class="label">Remaining</div>
        <div class="value" style="color:${remaining > 0 ? '#059669' : '#EF4444'}">${fmt(remaining)}</div>
      </div>
    </div>

    <p style="font-size:13px;color:#6B7280;margin-bottom:4px;">
      Progress — ${period}
    </p>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${fillPct}%;background:${fillColor}"></div>
    </div>
    <p style="font-size:13px;color:#6B7280;text-align:right;margin-top:4px;">${fillPct}% used</p>

    <div class="cta">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/budgets">View Budgets →</a>
    </div>
  `);

  try {
    await transporter.sendMail({
      from:    FROM,
      to:      user.email,
      subject: isExceeded
        ? `[FinWise] Budget Exceeded: ${budget.category} (${percentageUsed.toFixed(0)}% used)`
        : `[FinWise] Budget Alert: ${budget.category} (${percentageUsed.toFixed(0)}% used)`,
      html
    });
    console.log(`[EmailService] Budget alert sent to ${user.email} for category: ${budget.category}`);
    return { success: true };
  } catch (err) {
    console.error('[EmailService] Budget alert failed:', err.message);
    return { success: false, reason: err.message };
  }
};

// ─── Weekly Financial Report Email ───────────────────────────────────────────
export const sendWeeklyReportEmail = async ({ user, report }) => {
  if (!transporter) return { success: false, reason: 'Email not configured' };

  const {
    weekLabel, totalIncome, totalExpenses, totalInvestments,
    savingsRate, netSavings, topCategories, budgetSummary,
    transactionCount
  } = report;

  const savingsColor = savingsRate >= 20 ? '#059669' : savingsRate >= 0 ? '#D97706' : '#EF4444';

  const catRows = (topCategories || []).map(c => `
    <div class="cat-row">
      <span style="text-transform:capitalize;color:#374151">${c.category}</span>
      <span style="font-weight:600;color:#111827">${fmt(c.amount)}</span>
    </div>
  `).join('');

  const budgetRows = (budgetSummary || []).map(b => {
    const badgeClass = b.status === 'EXCEEDED' ? 'badge-exceeded'
      : b.status === 'WARNING' ? 'badge-warning' : 'badge-healthy';
    return `
    <div class="cat-row">
      <span style="text-transform:capitalize;color:#374151">${b.category}</span>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:13px;color:#6B7280">${fmt(b.spent)} / ${fmt(b.budget)}</span>
        <span class="badge ${badgeClass}">${b.pct}%</span>
      </div>
    </div>
  `}).join('');

  const html = htmlWrapper(`
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Here's your weekly financial summary for <strong>${weekLabel}</strong>.</p>

    <div class="stat-row">
      <div class="stat">
        <div class="label">Income</div>
        <div class="value" style="color:#059669">${fmt(totalIncome)}</div>
      </div>
      <div class="stat">
        <div class="label">Expenses</div>
        <div class="value" style="color:#EF4444">${fmt(totalExpenses)}</div>
      </div>
      <div class="stat">
        <div class="label">Savings</div>
        <div class="value" style="color:${savingsColor}">${fmt(netSavings)}</div>
      </div>
      <div class="stat">
        <div class="label">Savings Rate</div>
        <div class="value" style="color:${savingsColor}">${savingsRate}%</div>
      </div>
    </div>

    ${totalInvestments > 0 ? `<p style="font-size:14px;color:#374151">Investments this week: <strong style="color:#2563EB">${fmt(totalInvestments)}</strong></p>` : ''}
    <p style="font-size:14px;color:#6B7280">Total transactions: <strong>${transactionCount}</strong></p>

    ${catRows ? `
    <h3 style="margin:24px 0 8px;font-size:15px;color:#111827">Top Expense Categories</h3>
    ${catRows}` : ''}

    ${budgetRows ? `
    <h3 style="margin:24px 0 8px;font-size:15px;color:#111827">Budget Status</h3>
    ${budgetRows}` : ''}

    <div class="cta">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard">Open Dashboard →</a>
    </div>
  `);

  try {
    await transporter.sendMail({
      from:    FROM,
      to:      user.email,
      subject: `[FinWise] Weekly Report — ${weekLabel}`,
      html
    });
    console.log(`[EmailService] Weekly report sent to ${user.email}`);
    return { success: true };
  } catch (err) {
    console.error('[EmailService] Weekly report failed:', err.message);
    return { success: false, reason: err.message };
  }
};

// ─── Connection test ──────────────────────────────────────────────────────────
export const testEmailConnection = async () => {
  if (!transporter) return { success: false, reason: 'Email credentials not configured in .env' };
  try {
    await transporter.verify();
    return { success: true, message: 'SMTP connection verified' };
  } catch (err) {
    return { success: false, reason: err.message };
  }
};