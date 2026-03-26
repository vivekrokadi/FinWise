import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';
import cloudinary from '../config/cloudinary.js';

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { apiVersion: 'v1' }
    })
  : null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Cache availability check for 5 minutes to avoid burning quota on every request
let _geminiCache = { available: null, checkedAt: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000;

// ─── Connection Check ──────────────────────────────────────────────────────────

export const isGeminiAvailable = async () => {
  if (!ai) return false;
  const now = Date.now();
  // Return cached result if still fresh
  if (_geminiCache.available !== null && (now - _geminiCache.checkedAt) < CACHE_TTL_MS) {
    return _geminiCache.available;
  }
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: "Say 'TEST'"
    });
    _geminiCache = { available: !!response.text, checkedAt: now };
    return _geminiCache.available;
  } catch (error) {
    // Treat quota exhaustion (429) same as unavailable — use fallback
    console.log('Gemini not available:', error.message);
    _geminiCache = { available: false, checkedAt: now };
    return false;
  }
};

export const testGeminiConnection = async () => {
  if (!ai) {
    return { success: false, message: 'Gemini API key not configured' };
  }
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: "Say 'Gemini is working!' in a short response."
    });
    return {
      success: true,
      message: 'Gemini connection successful',
      model: GEMINI_MODEL,
      response: response.text
    };
  } catch (error) {
    return { success: false, message: 'Gemini connection failed', error: error.message };
  }
};

// ─── Financial Insights ────────────────────────────────────────────────────────

export const generateFinancialInsights = async (financialData) => {
  try {
    const geminiAvailable = await isGeminiAvailable();

    if (geminiAvailable) {
      const prompt = `
You are a personal finance advisor. Analyze this financial data and provide exactly 3 concise, actionable insights.

Financial Summary:
- Period: ${financialData.period}
- Total Income: ₹${financialData.totalIncome || 0}
- Total Expenses: ₹${financialData.totalExpenses || 0}
- Total Investment: ₹${financialData.totalInvestment || 0}
- Net Income: ₹${financialData.netIncome || 0}
- Transaction Count: ${financialData.transactionCount || 0}
- Category Breakdown: ${JSON.stringify(financialData.byCategory || {})}

Rules:
1. Each insight must be specific to the numbers above — no generic advice
2. Each insight must be actionable with a clear next step
3. Keep each insight to 1-2 sentences
4. Return ONLY a numbered list (1. 2. 3.) with no intro or outro text
      `.trim();

      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt
        });

        const text = response.text.trim();

        // Parse numbered list items
        const insights = text
          .split('\n')
          .filter((line) => line.trim().match(/^\d+\./))
          .map((line) => line.replace(/^\d+\.\s*/, '').trim())
          .filter((insight) => insight.length > 10);

        if (insights.length >= 2) {
          console.log('AI insights generated successfully');
          return insights.slice(0, 3);
        }
      } catch (aiError) {
        console.log('AI insights error, using fallback:', aiError.message);
      }
    }

    return generateSmartFallbackInsights(financialData);
  } catch (error) {
    console.error('Error in generateFinancialInsights:', error);
    return generateSmartFallbackInsights(financialData);
  }
};

const generateSmartFallbackInsights = (data) => {
  const insights = [];
  const totalIncome = data.totalIncome || 0;
  const totalExpenses = data.totalExpenses || 0;
  const netIncome = totalIncome - totalExpenses;
  const transactionCount = data.transactionCount || 0;

  // Insight 1: Income vs expenses
  if (totalIncome === 0 && totalExpenses === 0) {
    insights.push('Start tracking your income and expenses to get personalized financial insights.');
  } else if (netIncome < 0) {
    const overspend = Math.abs(netIncome).toLocaleString('en-IN');
    insights.push(
      `Your expenses exceed your income by ₹${overspend}. Review your largest expense categories and cut discretionary spending immediately.`
    );
  } else if (totalIncome > 0 && netIncome / totalIncome < 0.2) {
    const savingsRate = ((netIncome / totalIncome) * 100).toFixed(1);
    insights.push(
      `You're saving only ${savingsRate}% of your income. Aim for at least 20% by reducing your top spending category.`
    );
  } else {
    const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : 0;
    insights.push(
      `You're saving ${savingsRate}% of your income — good discipline. Consider moving surplus into an SIP or index fund for compounding growth.`
    );
  }

  // Insight 2: Transaction patterns
  if (transactionCount === 0) {
    insights.push('No transactions recorded. Start logging expenses to unlock budget tracking and trend analysis.');
  } else if (transactionCount < 10) {
    insights.push(
      `Only ${transactionCount} transactions recorded. Ensure all cash and UPI payments are tracked for accurate financial planning.`
    );
  } else {
    insights.push(
      `You made ${transactionCount} transactions this period. Review them weekly — small recurring expenses like subscriptions often add up unnoticed.`
    );
  }

  // Insight 3: Category-specific advice
  const categoryBreakdown = data.byCategory || {};
  const categories = Object.keys(categoryBreakdown);
  if (categories.length > 0) {
    const largestCategory = categories.reduce((a, b) =>
      categoryBreakdown[a] > categoryBreakdown[b] ? a : b
    );
    const largestAmount = categoryBreakdown[largestCategory];
    const pct = totalExpenses > 0 ? ((largestAmount / totalExpenses) * 100).toFixed(1) : 0;

    if (largestAmount > totalExpenses * 0.4) {
      insights.push(
        `"${largestCategory}" accounts for ${pct}% of your expenses (₹${largestAmount.toLocaleString('en-IN')}). This is disproportionately high — set a specific budget cap for this category.`
      );
    } else {
      insights.push(
        `Your spending is spread across ${categories.length} categories with "${largestCategory}" being the largest at ${pct}%. Set monthly budget limits per category to stay in control.`
      );
    }
  } else {
    insights.push(
      'Set specific monthly budget limits per spending category to track where your money goes and identify savings opportunities.'
    );
  }

  return insights;
};

// ─── Receipt Scanner ───────────────────────────────────────────────────────────

export const scanReceiptWithAI = async (imageBuffer, mimeType) => {
  try {
    console.log('Processing receipt...');

    // Upload to Cloudinary for storage regardless of AI availability
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'finwise/receipts',
            quality: 'auto',
            fetch_format: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(imageBuffer);
    });

    console.log('Receipt uploaded to Cloudinary:', uploadResult.secure_url);

    const geminiAvailable = await isGeminiAvailable();
    if (geminiAvailable) {
      const prompt = `
Analyze this receipt image and extract the following information.
Return ONLY a valid JSON object with no markdown formatting, no backticks, no extra text.

{
  "amount": <number, total amount paid>,
  "date": "<YYYY-MM-DD or null if not visible>",
  "description": "<brief description of what was purchased>",
  "merchantName": "<store or merchant name>",
  "category": "<one of: groceries, dining, shopping, transportation, entertainment, utilities, healthcare, other>"
}
      `.trim();

      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: [
            {
              inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        });

        const text = response.text.trim();
        console.log('AI Receipt Response:', text);

        // Strip any markdown fences if present
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);

        return {
          amount: typeof parsed.amount === 'number' && parsed.amount > 0 ? parsed.amount : null,
          date: parsed.date ? new Date(parsed.date) : new Date(),
          description: parsed.description || 'Receipt scan',
          merchantName: parsed.merchantName || 'Unknown merchant',
          category: parsed.category || 'other',
          receiptUrl: uploadResult.secure_url,
          aiScanned: true,
          note: 'AI scanning completed successfully'
        };
      } catch (aiError) {
        console.log('AI receipt scanning failed:', aiError.message);
        // Fall through to manual entry notice
      }
    }

    // Honest fallback — don't invent numbers
    return {
      amount: null,
      date: new Date(),
      description: 'Receipt uploaded — please fill in the details manually',
      merchantName: '',
      category: 'other',
      receiptUrl: uploadResult.secure_url,
      aiScanned: false,
      note: 'AI scanning unavailable. Receipt saved — please enter details manually.'
    };
  } catch (error) {
    console.error('Receipt scanning error:', error);
    throw new Error('Receipt processing failed: ' + error.message);
  }
};

// ─── Investment Suggestions ────────────────────────────────────────────────────

export const generateInvestmentSuggestions = async (userData, riskProfile = 'MODERATE', amount = 1000) => {
  try {
    const geminiAvailable = await isGeminiAvailable();

    if (geminiAvailable) {
      const prompt = `
You are a financial advisor. Provide exactly 3 investment suggestions based on:
- Risk Profile: ${riskProfile}
- Investment Amount: ₹${amount}
- Total Account Balance: ₹${userData.totalBalance || 0}
- Number of past investments: ${userData.investmentHistory || 0}

Rules:
1. Tailor suggestions specifically to the risk profile and amount above
2. Return ONLY a valid JSON array with no markdown or extra text
3. Each suggestion must have: type, suggestion, risk, potentialReturn, amount (number)

Example format:
[
  {
    "type": "STOCKS",
    "suggestion": "Invest in Nifty 50 index fund via SIP for long-term wealth creation",
    "risk": "MEDIUM",
    "potentialReturn": "10-12% annually",
    "amount": 600
  }
]

The 3 suggestion amounts must sum to exactly ₹${amount}.
      `.trim();

      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt
        });

        const text = response.text.trim();
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);

        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('AI investment suggestions generated successfully');
          return parsed.slice(0, 3).map((s) => ({
            type: s.type || 'STOCKS',
            suggestion: s.suggestion || '',
            risk: s.risk || riskProfile,
            potentialReturn: s.potentialReturn || 'Variable',
            amount: typeof s.amount === 'number' ? s.amount : amount / 3
          }));
        }
      } catch (aiError) {
        console.log('AI investment suggestions failed:', aiError.message);
      }
    }

    // Fallback based on risk profile
    return getFallbackInvestmentSuggestions(riskProfile, amount);
  } catch (error) {
    console.error('Error generating investment suggestions:', error);
    throw error;
  }
};

const getFallbackInvestmentSuggestions = (riskProfile, amount) => {
  const profiles = {
    LOW: [
      {
        type: 'BONDS',
        suggestion: 'Government bonds or PPF for guaranteed, tax-efficient returns with zero risk',
        risk: 'LOW',
        potentialReturn: '7-8% annually',
        amount: amount * 0.6
      },
      {
        type: 'MUTUAL_FUNDS',
        suggestion: 'Debt mutual funds for stable returns better than a savings account',
        risk: 'LOW',
        potentialReturn: '6-8% annually',
        amount: amount * 0.3
      },
      {
        type: 'STOCKS',
        suggestion: 'Small allocation to large-cap index fund for inflation-beating returns',
        risk: 'MEDIUM',
        potentialReturn: '10-12% annually',
        amount: amount * 0.1
      }
    ],
    MODERATE: [
      {
        type: 'STOCKS',
        suggestion: 'Nifty 50 index fund via monthly SIP for long-term wealth creation',
        risk: 'MEDIUM',
        potentialReturn: '10-12% annually',
        amount: amount * 0.5
      },
      {
        type: 'MUTUAL_FUNDS',
        suggestion: 'Balanced advantage funds that auto-adjust equity/debt allocation',
        risk: 'MEDIUM',
        potentialReturn: '8-10% annually',
        amount: amount * 0.35
      },
      {
        type: 'BONDS',
        suggestion: 'Corporate bonds or NPS for tax deduction under 80C and stable returns',
        risk: 'LOW',
        potentialReturn: '7-9% annually',
        amount: amount * 0.15
      }
    ],
    HIGH: [
      {
        type: 'STOCKS',
        suggestion: 'Mid-cap and small-cap funds for high growth potential over 5+ year horizon',
        risk: 'HIGH',
        potentialReturn: '12-18% annually',
        amount: amount * 0.6
      },
      {
        type: 'STOCKS',
        suggestion: 'Sectoral/thematic funds in high-growth sectors like technology or pharma',
        risk: 'HIGH',
        potentialReturn: '15-25% annually',
        amount: amount * 0.25
      },
      {
        type: 'CRYPTO',
        suggestion: 'Small allocation to established cryptocurrencies — only invest what you can afford to lose',
        risk: 'HIGH',
        potentialReturn: 'Highly variable',
        amount: amount * 0.15
      }
    ]
  };

  return profiles[riskProfile] || profiles['MODERATE'];
};

// ─── Tax Tips ──────────────────────────────────────────────────────────────────

export const generateTaxTips = async (taxData) => {
  try {
    const geminiAvailable = await isGeminiAvailable();

    if (geminiAvailable) {
      const prompt = `
You are an Indian tax advisor. Provide 4-5 actionable tax-saving tips based on:
- Tax Year: ${taxData.year}
- Total Tax-Deductible Expenses: ₹${taxData.totalDeductible || 0}
- Total Investments: ₹${taxData.totalInvestments || 0}
- Number of deductible categories: ${taxData.taxDeductibleCount || 0}

Rules:
1. Focus on Indian tax laws (IT Act, 80C, 80D, HRA, etc.)
2. Be specific to the numbers provided above
3. Return ONLY a valid JSON array with no markdown or extra text

Format:
[
  {
    "category": "DEDUCTIONS",
    "tip": "<specific actionable tip>",
    "priority": "HIGH"
  }
]

category must be one of: DEDUCTIONS, RETIREMENT, INVESTMENTS, DOCUMENTATION, GENERAL
priority must be one of: HIGH, MEDIUM, LOW
      `.trim();

      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt
        });

        const text = response.text.trim();
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);

        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('AI tax tips generated successfully');
          return parsed.slice(0, 5).map((t) => ({
            category: t.category || 'GENERAL',
            tip: t.tip || '',
            priority: t.priority || 'MEDIUM'
          }));
        }
      } catch (aiError) {
        console.log('AI tax tips failed:', aiError.message);
      }
    }

    return getFallbackTaxTips(taxData);
  } catch (error) {
    console.error('Error generating tax tips:', error);
    throw error;
  }
};

const getFallbackTaxTips = (taxData) => {
  const tips = [];
  const totalDeductible = taxData.totalDeductible || 0;
  const totalInvestments = taxData.totalInvestments || 0;

  // 80C tip
  const remaining80C = Math.max(0, 150000 - totalInvestments);
  if (remaining80C > 0) {
    tips.push({
      category: 'DEDUCTIONS',
      tip: `You can still invest ₹${remaining80C.toLocaleString('en-IN')} more under Section 80C (ELSS, PPF, NSC) to claim the full ₹1.5L deduction before March 31.`,
      priority: 'HIGH'
    });
  } else {
    tips.push({
      category: 'DEDUCTIONS',
      tip: `You've maximised your ₹1.5L Section 80C limit. Explore Section 80D (health insurance) for an additional ₹25,000–₹50,000 deduction.`,
      priority: 'HIGH'
    });
  }

  if (totalDeductible > 0) {
    tips.push({
      category: 'DEDUCTIONS',
      tip: `You have ₹${totalDeductible.toLocaleString('en-IN')} in tracked deductible expenses. Verify all receipts are saved digitally for ITR filing — missing documentation is the #1 reason deductions are disallowed.`,
      priority: 'HIGH'
    });
  }

  tips.push({
    category: 'RETIREMENT',
    tip: 'Contribute to NPS (National Pension System) for an additional ₹50,000 deduction under Section 80CCD(1B) over and above the 80C limit.',
    priority: 'MEDIUM'
  });

  tips.push({
    category: 'INVESTMENTS',
    tip: 'Hold equity mutual funds and stocks for more than 1 year to qualify for Long Term Capital Gains (LTCG) tax at 10% instead of 15% STCG.',
    priority: 'MEDIUM'
  });

  tips.push({
    category: 'DOCUMENTATION',
    tip: `File your ITR before July 31 to avoid a ₹5,000 late fee. Keep Form 16, bank statements, and investment proofs ready at least 2 months in advance.`,
    priority: 'LOW'
  });

  return tips;
};