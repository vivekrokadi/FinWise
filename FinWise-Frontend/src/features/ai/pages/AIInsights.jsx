import { useState } from 'react'
import {
  Brain, TrendingUp, TrendingDown, Wallet,
  Sparkles, Receipt, ReceiptIndianRupee, FileText, ChevronDown, ChevronUp, X
} from 'lucide-react'
import { useGenerateInsights, useInvestmentSuggestions, useTaxTips, useScanReceipt } from '../hooks/useAI'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useCreateTransaction } from '../../transactions/hooks/useTransactions'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { formatCurrency } from '../../../utils/formatters'
import { TRANSACTION_TYPES, INVESTMENT_TYPES } from '../../../utils/constants'
import { toast } from 'sonner'

// ─── Sub-components ───────────────────────────────────────────────────────────

const InsightCard = ({ index, text }) => (
  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
      {index + 1}
    </span>
    <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
  </div>
)

const SuggestionCard = ({ suggestion }) => {
  const riskColors = {
    LOW: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    MODERATE: 'bg-yellow-100 text-yellow-700',
    HIGH: 'bg-red-100 text-red-700'
  }
  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">{suggestion.type}</h3>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColors[suggestion.risk] || riskColors.MEDIUM}`}>
            {suggestion.risk} Risk
          </span>
        </div>
        <span className="text-blue-600 font-semibold text-sm">{formatCurrency(suggestion.amount)}</span>
      </div>
      <p className="text-gray-600 text-sm mb-2">{suggestion.suggestion}</p>
      <p className="text-xs text-gray-500">Expected return: {suggestion.potentialReturn}</p>
    </Card>
  )
}

const TaxTipCard = ({ tip }) => {
  const colors = {
    HIGH: 'border-l-red-500 bg-red-50',
    MEDIUM: 'border-l-yellow-500 bg-yellow-50',
    LOW: 'border-l-green-500 bg-green-50'
  }
  return (
    <div className={`border-l-4 rounded-r-lg p-3 ${colors[tip.priority] || colors.MEDIUM}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-500 uppercase">{tip.category}</span>
        <span className={`text-xs font-medium ${tip.priority === 'HIGH' ? 'text-red-600' : tip.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
          {tip.priority}
        </span>
      </div>
      <p className="text-sm text-gray-700">{tip.tip}</p>
    </div>
  )
}

// ─── Receipt Scanner with auto-create transaction ─────────────────────────────
const ReceiptScanner = () => {
  const scanMutation = useScanReceipt()
  const createTransaction = useCreateTransaction()
  const { data: accounts } = useAccounts()

  // Form state pre-filled from scan result
  const [scannedData, setScannedData] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const data = await scanMutation.mutateAsync(file)
    setScannedData(data)

    // Pre-fill form with scanned data — user can review/edit before saving
    setForm({
      type: 'EXPENSE',
      amount: data.amount != null ? String(data.amount) : '',
      description: data.description || '',
      date: data.date
        ? new Date(data.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      category: data.category || 'shopping',
      merchant: data.merchantName || '',
      account: accounts?.[0]?._id || '',
      taxDeductible: false
    })
  }

  const handleSave = async () => {
    if (!form.account) { toast.error('Please select an account'); return }
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Please enter a valid amount'); return }
    if (!form.description) { toast.error('Please enter a description'); return }

    setSaving(true)
    try {
      await createTransaction.mutateAsync({
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description,
        date: form.date,
        category: form.category,
        merchant: form.merchant,
        account: form.account,
        taxDeductible: form.taxDeductible
      })
      toast.success('Transaction saved from receipt!')
      setScannedData(null)
      setForm(null)
    } catch {
      // error toast handled by mutation
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setScannedData(null)
    setForm(null)
  }

  return (
    <Card>
      <div className="flex items-center space-x-2 mb-4">
        <ReceiptIndianRupee className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Receipt Scanner</h3>
      </div>

      {!form ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Upload a receipt image — AI will detect the details and create a transaction automatically.
          </p>
          <label htmlFor="receipt-upload" className={`flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition ${scanMutation.isPending ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
            <input
              type="file"
              accept="image/*"
              id="receipt-upload"
              className="hidden"
              onChange={handleFileChange}
              disabled={scanMutation.isPending}
            />
            {scanMutation.isPending ? (
              <p className="text-sm text-blue-600 animate-pulse">Scanning receipt with AI...</p>
            ) : (
              <div className="text-center">
                <ReceiptIndianRupee className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload a receipt</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
              </div>
            )}
          </label>
        </>
      ) : (
        /* Review & confirm form */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {scannedData?.aiScanned ? '✓ AI scan complete — review and save' : '⚠ Fill in the details manually'}
            </p>
            {scannedData?.receiptUrl && (
              <a href={scannedData.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                View receipt ↗
              </a>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex gap-2">
              {TRANSACTION_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${form.type === t.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount (₹) *"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
            />
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>

          <Input
            label="Description *"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
            />
            <Input
              label="Merchant"
              value={form.merchant}
              onChange={(e) => setForm(f => ({ ...f, merchant: e.target.value }))}
            />
          </div>

          {/* Account selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.account}
              onChange={(e) => setForm(f => ({ ...f, account: e.target.value }))}
            >
              <option value="">Select account</option>
              {accounts?.map((a) => (
                <option key={a._id} value={a._id}>{a.name} — {formatCurrency(a.balance)}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
              checked={form.taxDeductible}
              onChange={(e) => setForm(f => ({ ...f, taxDeductible: e.target.checked }))}
            />
            <label className="text-sm text-gray-700">Tax deductible</label>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button variant="secondary" onClick={handleDiscard} className="flex-1">
              Discard
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={saving} className="flex-1">
              Save Transaction
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const AIInsights = () => {
  const [period, setPeriod] = useState('month')
  const [riskTolerance, setRiskTolerance] = useState('MODERATE')
  const [investmentAmount, setInvestmentAmount] = useState(5000)
  const [showTaxSection, setShowTaxSection] = useState(false)

  const insightsMutation = useGenerateInsights()
  const investmentMutation = useInvestmentSuggestions()
  const taxMutation = useTaxTips()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI Insights</h1>
        <p className="text-gray-600 mt-1">Personalised financial recommendations powered by Gemini AI</p>
      </div>

      {/* Financial Insights */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Financial Insights</h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {['week', 'month', 'quarter', 'year', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          onClick={() => insightsMutation.mutate({ period })}
          isLoading={insightsMutation.isPending}
          leftIcon={<Sparkles className="h-4 w-4" />}
        >
          Generate Insights
        </Button>
      </Card>

      {insightsMutation.data && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(insightsMutation.data.summary.totalIncome)}</p>
                </div>
                <Wallet className="h-8 w-8 text-green-200" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(insightsMutation.data.summary.totalExpenses)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-200" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Income</p>
                  <p className={`text-xl font-bold ${insightsMutation.data.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(insightsMutation.data.summary.netIncome)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </Card>
          </div>
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">AI-Generated Insights</h3>
            </div>
            <div className="space-y-3">
              {insightsMutation.data.insights.map((text, i) => (
                <InsightCard key={i} index={i} text={text} />
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Investment Suggestions */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">Investment Suggestions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value)}
            >
              <option value="LOW">Low — Safe returns</option>
              <option value="MODERATE">Moderate — Balanced</option>
              <option value="HIGH">High — Growth focused</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (₹)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => investmentMutation.mutate({ riskTolerance, investmentAmount })}
          isLoading={investmentMutation.isPending}
        >
          Get Investment Suggestions
        </Button>
      </Card>

      {investmentMutation.data && (
        <div className="space-y-3">
          {investmentMutation.data.suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} />)}
        </div>
      )}

      {/* Tax Tips */}
      <Card>
        <button
          className="w-full flex items-center justify-between"
          onClick={() => setShowTaxSection(!showTaxSection)}
        >
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Tax Saving Tips</h2>
          </div>
          {showTaxSection ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
        </button>

        {showTaxSection && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Personalised tax-saving tips based on your transactions and investments this year.
            </p>
            <Button
              variant="primary"
              onClick={() => taxMutation.mutate()}
              isLoading={taxMutation.isPending}
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              Generate Tax Tips
            </Button>
            {taxMutation.data && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Deductible Expenses</p>
                    <p className="font-bold text-gray-900">{formatCurrency(taxMutation.data.totalDeductibleExpenses)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Total Investments</p>
                    <p className="font-bold text-gray-900">{formatCurrency(taxMutation.data.totalInvestments)}</p>
                  </div>
                </div>
                {taxMutation.data.tips.map((tip, i) => <TaxTipCard key={i} tip={tip} />)}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Receipt Scanner */}
      <ReceiptScanner />
    </div>
  )
}

export default AIInsights