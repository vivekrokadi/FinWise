import { useState } from 'react'
import {
  Monitor, Bell, Database, Info, ChevronRight,
  Check, Download, Trash2, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { useAuth } from '../../auth/hooks/useAuth'
import { getTransactions } from '../../../api/transactions'
import { ALERT_THRESHOLDS, PAGINATION } from '../../../utils/constants'

// ─── Persist settings in localStorage ────────────────────────────────────────
const SETTINGS_KEY = 'finwise_settings'

const defaultSettings = {
  dateFormat: 'medium',       // short | medium | long
  pageSize: 10,               // transactions per page
  defaultBudgetAlert: 80,     // default alert threshold for new budgets
  showAccountBalance: true,   // show/hide balance on account cards
  compactView: false          // compact transaction list
}

const loadSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, description, children, iconColor = 'text-blue-600', iconBg = 'bg-blue-50' }) => (
  <Card>
    <div className="flex items-center space-x-3 mb-5">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
    {children}
  </Card>
)

// ─── Toggle row ───────────────────────────────────────────────────────────────
const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
)

// ─── Select row ───────────────────────────────────────────────────────────────
const SelectRow = ({ label, description, value, options, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div className="flex-1 mr-4">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[120px]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────
const Settings = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState(loadSettings)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [clearingCache, setClearingCache] = useState(false)

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    saveSettings(settings)
    setSaved(true)
    toast.success('Settings saved')
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      // Fetch all transactions (high limit)
      const response = await getTransactions({ page: 1, limit: 1000 })
      const transactions = response?.data || []

      if (transactions.length === 0) {
        toast.info('No transactions to export')
        return
      }

      // Build CSV
      const headers = ['Date', 'Type', 'Description', 'Category', 'Merchant', 'Amount', 'Account', 'Tax Deductible', 'Status']
      const rows = transactions.map(t => [
        new Date(t.date).toLocaleDateString('en-IN'),
        t.type,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.category,
        `"${(t.merchant || '').replace(/"/g, '""')}"`,
        t.type === 'INCOME' ? t.amount : -t.amount,
        `"${t.account?.name || ''}"`,
        t.taxDeductible ? 'Yes' : 'No',
        t.status
      ])

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `finwise_transactions_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${transactions.length} transactions`)
    } catch (error) {
      toast.error('Failed to export transactions')
    } finally {
      setExporting(false)
    }
  }

  const handleClearCache = () => {
    setClearingCache(true)
    queryClient.clear()
    setTimeout(() => {
      setClearingCache(false)
      toast.success('Cache cleared — data will refresh on next load')
    }, 600)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Customise your FinWise experience</p>
      </div>

      {/* Display Preferences */}
      <Section
        icon={Monitor}
        title="Display Preferences"
        description="Control how data is displayed across the app"
        iconColor="text-blue-600"
        iconBg="bg-blue-50"
      >
        <SelectRow
          label="Date Format"
          description="How dates appear throughout the app"
          value={settings.dateFormat}
          options={[
            { value: 'short', label: '23/03/2026' },
            { value: 'medium', label: '23 Mar 2026' },
            { value: 'long', label: 'Monday, 23 March 2026' }
          ]}
          onChange={(v) => update('dateFormat', v)}
        />

        <SelectRow
          label="Transactions per Page"
          description="Default number of transactions shown in the list"
          value={settings.pageSize}
          options={PAGINATION.PAGE_SIZES.map(n => ({ value: n, label: `${n} per page` }))}
          onChange={(v) => update('pageSize', parseInt(v))}
        />

        <ToggleRow
          label="Show Account Balance"
          description="Display balance amounts on account cards"
          checked={settings.showAccountBalance}
          onChange={(v) => update('showAccountBalance', v)}
        />

        <ToggleRow
          label="Compact Transaction View"
          description="Show more transactions with reduced spacing"
          checked={settings.compactView}
          onChange={(v) => update('compactView', v)}
        />
      </Section>

      {/* Notification Preferences */}
      <Section
        icon={Bell}
        title="Budget Alerts"
        description="Configure default alert behaviour for new budgets"
        iconColor="text-yellow-600"
        iconBg="bg-yellow-50"
      >
        <SelectRow
          label="Default Alert Threshold"
          description="New budgets will alert when spending reaches this percentage"
          value={settings.defaultBudgetAlert}
          options={ALERT_THRESHOLDS.map(n => ({
            value: n,
            label: n === 100 ? '100% — Budget exceeded' : `${n}% — Warning at ${n}%`
          }))}
          onChange={(v) => update('defaultBudgetAlert', parseInt(v))}
        />
      </Section>

      {/* Data Management */}
      <Section
        icon={Database}
        title="Data Management"
        description="Export your data or clear the local cache"
        iconColor="text-green-600"
        iconBg="bg-green-50"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Export Transactions</p>
              <p className="text-xs text-gray-500 mt-0.5">Download all your transactions as a CSV file</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              isLoading={exporting}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export CSV
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Clear App Cache</p>
              <p className="text-xs text-gray-500 mt-0.5">Force-refresh all data from the server</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearCache}
              isLoading={clearingCache}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Clear Cache
            </Button>
          </div>
        </div>
      </Section>

      {/* About */}
      <Section
        icon={Info}
        title="About FinWise"
        iconColor="text-purple-600"
        iconBg="bg-purple-50"
      >
        <div className="space-y-3 text-sm">
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Logged in as', value: user?.email || '—' },
            { label: 'Account created', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—' },
            { label: 'AI powered by', value: 'Google Gemini 2.5 Flash' },
            { label: 'Built with', value: 'React + Node.js + MongoDB' }
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Save Button */}
      <div className="flex justify-end pb-6">
        <Button
          variant="primary"
          onClick={handleSave}
          leftIcon={saved ? <Check className="h-4 w-4" /> : null}
          className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}

export default Settings