import { useState, useEffect } from 'react'
import {
  Bell, Database, Check,
  Download, RefreshCw, Mail,
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
import { ALERT_THRESHOLDS } from '../../../utils/constants'

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

// ── Main Page ─────────────────────────────────────────────────────────────────
const Settings = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [notifPrefs, setNotifPrefs]       = useState({ budgetAlerts: true, weeklyReport: true, weeklyReportDay: 1 })
  const [savingNotif, setSavingNotif]     = useState(false)
  const [sendingReport, setSendingReport] = useState(false)
  const [emailStatus, setEmailStatus]     = useState(null)
  const [exporting, setExporting]         = useState(false)
  const [clearingCache, setClearingCache] = useState(false)

  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  useEffect(() => {
    getNotificationPrefs()
      .then(data => {
        if (data?.notificationPrefs) setNotifPrefs(data.notificationPrefs)
      })
      .catch(() => {})
  }, [])

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

  const handleTestEmail = async () => {
    setEmailStatus('checking')
    try {
      const result = await testEmailConnection()
      setEmailStatus(result.success ? 'ok' : 'error')
    } catch {
      setEmailStatus('error')
    }
  }

  const handleSendReport = async () => {
    setSendingReport(true)
    try {
      await triggerWeeklyReport()
      toast.success(`Weekly report sent to ${user?.email}`)
    } catch (err) {
      toast.error(err.message || 'Failed to send report — check email configuration in server .env')
    } finally {
      setSendingReport(false)
    }
  }

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
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.category,
        t.subcategory || '',
        `"${(t.merchant || '').replace(/"/g, '""')}"`,
        t.type === 'INCOME' ? t.amount : -t.amount,
        `"${t.account?.name || ''}"`,
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
    } catch {
      toast.error('Failed to export')
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage notifications and your account data</p>
      </div>

      {/* ── Notifications & Alerts ── */}
      <Section
        icon={Bell}
        title="Notifications & Alerts"
        description="Email alerts when budgets are breached and weekly financial reports"
        iconColor="text-yellow-600"
        iconBg="bg-yellow-50"
      >
        {/* Email status row */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900">Email: {user?.email}</p>
            <p className="text-xs text-gray-500 mt-0.5">Configure SMTP in server .env to enable</p>
          </div>
          <div className="flex items-center gap-2">
            <EmailStatus status={emailStatus} />
            <button
              onClick={handleTestEmail}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
            >
              Test connection
            </button>
          </div>
        </div>

        <ToggleRow
          label="Budget Threshold Alerts"
          description="Get an email when spending reaches your alert threshold or exceeds the budget"
          checked={notifPrefs.budgetAlerts}
          onChange={(v) => setNotifPrefs(p => ({ ...p, budgetAlerts: v }))}
        />

        <ToggleRow
          label="Weekly Financial Report"
          description="A summary email every week with income, expenses, savings rate and budget status"
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
          description="New budgets will send a warning at this percentage"
          value={notifPrefs.defaultBudgetAlert || 80}
          options={ALERT_THRESHOLDS.map(n => ({
            value: n,
            label: n === 100 ? '100% — Only when exceeded' : `${n}%`
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
      </Section>

    </div>
  )
}

export default Settings