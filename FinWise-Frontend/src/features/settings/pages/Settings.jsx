import { useState, useEffect } from 'react'
import {
  Monitor, Bell, Database, Info,
  Check, Download, RefreshCw, Mail,
  Send, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { useAuth } from '../../auth/hooks/useAuth'
import { getTransactions } from '../../../api/transactions'
import {
  getNotificationPrefs,
  updateNotificationPrefs,
  triggerWeeklyReport,
  testEmailConnection
} from '../../../api/notifications'
import { ALERT_THRESHOLDS, PAGINATION } from '../../../utils/constants'

// ── Persist display settings in localStorage ──────────────────────────────────
const SETTINGS_KEY = 'finwise_settings'
const defaultSettings = {
  dateFormat:         'medium',
  pageSize:           10,
  defaultBudgetAlert: 80,
  showAccountBalance: true,
  compactView:        false
}
const loadSettings = () => {
  try {
    const s = localStorage.getItem(SETTINGS_KEY)
    return s ? { ...defaultSettings, ...JSON.parse(s) } : defaultSettings
  } catch { return defaultSettings }
}

// ── Sub-components ────────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, description, iconColor = 'text-blue-600', iconBg = 'bg-blue-50', children }) => (
  <Card>
    <div className="flex items-center space-x-3 mb-5">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
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

const ToggleRow = ({ label, description, checked, onChange, disabled = false }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div className="pr-4">
      <p className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0 ${
        checked && !disabled ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
)

const SelectRow = ({ label, description, value, options, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div className="flex-1 mr-4">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[130px]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

// ── Email status badge ─────────────────────────────────────────────────────────
const EmailStatus = ({ status }) => {
  if (status === 'checking') return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <Loader2 className="h-3 w-3 animate-spin" /> Checking...
    </span>
  )
  if (status === 'ok') return (
    <span className="flex items-center gap-1 text-xs text-green-600">
      <CheckCircle2 className="h-3.5 w-3.5" /> SMTP connected
    </span>
  )
  if (status === 'error') return (
    <span className="flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="h-3.5 w-3.5" /> Not configured
    </span>
  )
  return null
}

// ── Main Settings Page ─────────────────────────────────────────────────────────
const Settings = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [settings, setSettings]           = useState(loadSettings)
  const [saved, setSaved]                 = useState(false)
  const [exporting, setExporting]         = useState(false)
  const [clearingCache, setClearingCache] = useState(false)

  // Notification prefs (server-side)
  const [notifPrefs, setNotifPrefs]       = useState({ budgetAlerts: true, weeklyReport: true, weeklyReportDay: 1 })
  const [savingNotif, setSavingNotif]     = useState(false)
  const [sendingReport, setSendingReport] = useState(false)
  const [emailStatus, setEmailStatus]     = useState(null) // null | checking | ok | error

  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  // Load notification prefs from server on mount
  useEffect(() => {
    getNotificationPrefs()
      .then(data => setNotifPrefs(data.notificationPrefs || notifPrefs))
      .catch(() => {}) // silent — user may not have prefs yet
  }, [])

  // ── Display settings ──────────────────────────────────────────────────────
  const updateDisplay = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSaveDisplay = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSaved(true)
    toast.success('Display settings saved')
    setTimeout(() => setSaved(false), 2000)
  }

  // ── Notification prefs ────────────────────────────────────────────────────
  const handleSaveNotif = async () => {
    setSavingNotif(true)
    try {
      await updateNotificationPrefs(notifPrefs)
      toast.success('Notification preferences saved')
    } catch (err) {
      toast.error(err.message || 'Failed to save preferences')
    } finally {
      setSavingNotif(false)
    }
  }

  // ── Test email connection ─────────────────────────────────────────────────
  const handleTestEmail = async () => {
    setEmailStatus('checking')
    try {
      const result = await testEmailConnection()
      setEmailStatus(result.success ? 'ok' : 'error')
    } catch {
      setEmailStatus('error')
    }
  }

  // ── Send weekly report now ────────────────────────────────────────────────
  const handleSendReport = async () => {
    setSendingReport(true)
    try {
      await triggerWeeklyReport()
      toast.success(`Weekly report sent to ${user?.email}`)
    } catch (err) {
      toast.error(err.message || 'Failed to send report — check email configuration')
    } finally {
      setSendingReport(false)
    }
  }

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await getTransactions({ page: 1, limit: 1000 })
      const transactions = response?.data || []
      if (!transactions.length) { toast.info('No transactions to export'); return }

      const headers = ['Date','Type','Description','Category','Subcategory','Merchant','Amount','Account','Tax Deductible','Status']
      const rows = transactions.map(t => [
        new Date(t.date).toLocaleDateString('en-IN'),
        t.type,
        `"${(t.description||'').replace(/"/g,'""')}"`,
        t.category,
        t.subcategory || '',
        `"${(t.merchant||'').replace(/"/g,'""')}"`,
        t.type === 'INCOME' ? t.amount : -t.amount,
        `"${t.account?.name||''}"`,
        t.taxDeductible ? 'Yes' : 'No',
        t.status
      ])

      const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `finwise_transactions_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${transactions.length} transactions`)
    } catch { toast.error('Failed to export') } finally { setExporting(false) }
  }

  // ── Clear cache ───────────────────────────────────────────────────────────
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Customise your FinWise experience</p>
      </div>

      {/* ── Display Preferences ── */}
      <Section icon={Monitor} title="Display Preferences" description="Control how data is displayed">
        <SelectRow
          label="Date Format"
          value={settings.dateFormat}
          options={[
            { value: 'short',  label: '23/03/2026' },
            { value: 'medium', label: '23 Mar 2026' },
            { value: 'long',   label: 'Monday, 23 March 2026' }
          ]}
          onChange={(v) => updateDisplay('dateFormat', v)}
        />
        <SelectRow
          label="Transactions Per Page"
          value={settings.pageSize}
          options={PAGINATION.PAGE_SIZES.map(n => ({ value: n, label: `${n} per page` }))}
          onChange={(v) => updateDisplay('pageSize', parseInt(v))}
        />
        <ToggleRow
          label="Show Account Balance"
          description="Display balances on account cards"
          checked={settings.showAccountBalance}
          onChange={(v) => updateDisplay('showAccountBalance', v)}
        />
        <ToggleRow
          label="Compact Transaction View"
          description="Reduced spacing — fits more on screen"
          checked={settings.compactView}
          onChange={(v) => updateDisplay('compactView', v)}
        />
        <div className="flex justify-end pt-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveDisplay}
            leftIcon={saved ? <Check className="h-4 w-4" /> : null}
            className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {saved ? 'Saved!' : 'Save Display Settings'}
          </Button>
        </div>
      </Section>

      {/* ── Notification Preferences ── */}
      <Section
        icon={Bell}
        title="Notifications & Alerts"
        description="Email alerts when budgets are breached and weekly financial reports"
        iconColor="text-yellow-600"
        iconBg="bg-yellow-50"
      >
        {/* Email status */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900">Email: {user?.email}</p>
            <p className="text-xs text-gray-500 mt-0.5">Configure SMTP in server .env to enable</p>
          </div>
          <div className="flex items-center gap-2">
            <EmailStatus status={emailStatus} />
            <button
              onClick={handleTestEmail}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
            >
              Test
            </button>
          </div>
        </div>

        <ToggleRow
          label="Budget Threshold Alerts"
          description="Get an email when spending reaches your set threshold (e.g. 80%) or exceeds the budget"
          checked={notifPrefs.budgetAlerts}
          onChange={(v) => setNotifPrefs(p => ({ ...p, budgetAlerts: v }))}
        />

        <ToggleRow
          label="Weekly Financial Report"
          description="A summary email with income, expenses, savings rate and budget status"
          checked={notifPrefs.weeklyReport}
          onChange={(v) => setNotifPrefs(p => ({ ...p, weeklyReport: v }))}
        />

        {notifPrefs.weeklyReport && (
          <SelectRow
            label="Report Day"
            description="Which day of the week to receive the report"
            value={notifPrefs.weeklyReportDay}
            options={DAYS.map((d, i) => ({ value: i, label: d }))}
            onChange={(v) => setNotifPrefs(p => ({ ...p, weeklyReportDay: parseInt(v) }))}
          />
        )}

        <SelectRow
          label="Default Budget Alert Threshold"
          description="New budgets will warn at this percentage"
          value={notifPrefs.defaultBudgetAlert || settings.defaultBudgetAlert}
          options={ALERT_THRESHOLDS.map(n => ({
            value: n,
            label: n === 100 ? '100% — Only on exceed' : `${n}%`
          }))}
          onChange={(v) => setNotifPrefs(p => ({ ...p, defaultBudgetAlert: parseInt(v) }))}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-gray-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSendReport}
            isLoading={sendingReport}
            leftIcon={<Send className="h-4 w-4" />}
          >
            Send Report Now
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveNotif}
            isLoading={savingNotif}
            leftIcon={<Mail className="h-4 w-4" />}
          >
            Save Notification Settings
          </Button>
        </div>
      </Section>

      {/* ── Data Management ── */}
      <Section
        icon={Database}
        title="Data Management"
        description="Export your data or clear the local cache"
        iconColor="text-green-600"
        iconBg="bg-green-50"
      >
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">Export Transactions</p>
            <p className="text-xs text-gray-500 mt-0.5">Download all transactions as CSV</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExportCSV} isLoading={exporting} leftIcon={<Download className="h-4 w-4" />}>
            Export CSV
          </Button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Clear App Cache</p>
            <p className="text-xs text-gray-500 mt-0.5">Force-refresh all data from the server</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleClearCache} isLoading={clearingCache} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Clear Cache
          </Button>
        </div>
      </Section>

      {/* ── About ── */}
      <Section icon={Info} title="About FinWise" iconColor="text-purple-600" iconBg="bg-purple-50">
        <div className="space-y-0">
          {[
            { label: 'Version',        value: '1.0.0' },
            { label: 'Logged in as',   value: user?.email || '—' },
            { label: 'AI powered by',  value: 'Google Gemini 2.5 Flash' },
            { label: 'Built with',     value: 'React 19 · Node.js · MongoDB · Tailwind CSS' }
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2.5 border-b border-gray-100 last:border-0 text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
            </div>
          ))}
        </div>
      </Section>

    </div>
  )
}

export default Settings