import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Calendar, ChevronDown } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Card from '../../../components/ui/Card'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import {
  TRANSACTION_TYPES,
  INVESTMENT_TYPES,
  RECURRING_INTERVALS,
  CATEGORIES
} from '../../../utils/constants'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useCreateTransaction, useUpdateTransaction } from '../hooks/useTransactions'
import { formatCurrency } from '../../../utils/formatters'

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'INVESTMENT', 'TAX']),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Amount must be greater than 0'),
  description: z.string().min(2, 'At least 2 characters').max(200, 'Too long'),
  date: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional().default(''),
  merchant: z.string().optional().default(''),
  account: z.string().min(1, 'Account is required'),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.string().nullable().optional(),
  taxDeductible: z.boolean().default(false),
  investmentType: z.string().nullable().optional(),
  tags: z.string().optional().default('')
})

// ── Styled Select component (consistent with the Input component) ──────────────
const SelectField = ({ label, required, error, children, className = '', ...props }) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        className={`w-full px-3 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
        }`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
)

const TransactionForm = ({ transaction, onClose }) => {
  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const isEditing = !!transaction

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction ? {
      type:              transaction.type,
      amount:            transaction.amount?.toString() || '',
      description:       transaction.description,
      date:              transaction.date
                           ? new Date(transaction.date).toISOString().split('T')[0]
                           : new Date().toISOString().split('T')[0],
      category:          transaction.category || '',
      subcategory:       transaction.subcategory || '',
      merchant:          transaction.merchant || '',
      account:           transaction.account?._id || transaction.account || '',
      isRecurring:       transaction.isRecurring || false,
      recurringInterval: transaction.recurringInterval || null,
      taxDeductible:     transaction.taxDeductible || false,
      investmentType:    transaction.investmentType || null,
      tags:              transaction.tags?.join(', ') || ''
    } : {
      type:              'EXPENSE',
      date:              new Date().toISOString().split('T')[0],
      isRecurring:       false,
      taxDeductible:     false,
      recurringInterval: null,
      investmentType:    null,
      category:          '',
      subcategory:       ''
    }
  })

  const watchType        = watch('type')
  const watchCategory    = watch('category')
  const watchIsRecurring = watch('isRecurring')

  // Derive categories list from selected type
  const categoryList = useMemo(
    () => CATEGORIES[watchType] || [],
    [watchType]
  )

  // Derive subcategories from selected category
  const subcategoryList = useMemo(() => {
    const found = categoryList.find(c => c.value === watchCategory)
    return found?.subcategories || []
  }, [categoryList, watchCategory])

  // When type changes, clear category and subcategory
  const handleTypeChange = (newType) => {
    setValue('type', newType)
    setValue('category', '')
    setValue('subcategory', '')
  }

  // When category changes, clear subcategory
  const handleCategoryChange = (e) => {
    setValue('category', e.target.value)
    setValue('subcategory', '')
  }

  const onSubmit = async (data) => {
    const tags = data.tags
      ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const payload = {
      ...data,
      amount:            parseFloat(data.amount),
      tags,
      recurringInterval: data.isRecurring ? data.recurringInterval : null,
      investmentType:    data.type === 'INVESTMENT' ? (data.investmentType || null) : null
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: transaction._id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch {
      // toast shown by mutation onError
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  if (accountsLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="p-8"><LoadingSpinner /></Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TRANSACTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    watchType === type.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount *"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount')}
            />
            <Input
              label="Date"
              type="date"
              leftIcon={<Calendar className="h-4 w-4 text-gray-400" />}
              error={errors.date?.message}
              {...register('date')}
            />
          </div>

          {/* Description */}
          <Input
            label="Description *"
            placeholder="e.g., Grocery shopping, Monthly salary"
            error={errors.description?.message}
            {...register('description')}
          />

          {/* Account */}
          <SelectField
            label="Account"
            required
            error={errors.account?.message}
            {...register('account')}
          >
            <option value="">Select an account</option>
            {accounts?.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name} — {formatCurrency(a.balance, a.currency)}
              </option>
            ))}
          </SelectField>

          {/* Category + Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category dropdown */}
            <SelectField
              label="Category"
              required
              error={errors.category?.message}
              value={watchCategory}
              onChange={handleCategoryChange}
            >
              <option value="">Select category</option>
              {categoryList.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </SelectField>

            {/* Subcategory dropdown — populated from selected category */}
            <SelectField
              label="Subcategory"
              disabled={!watchCategory || subcategoryList.length === 0}
              {...register('subcategory')}
            >
              <option value="">
                {!watchCategory
                  ? 'Select category first'
                  : subcategoryList.length === 0
                  ? 'No subcategories'
                  : 'Select subcategory'}
              </option>
              {subcategoryList.map((sub) => (
                <option key={sub.value} value={sub.value}>
                  {sub.label}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Merchant */}
          <Input
            label="Merchant / Payee"
            placeholder="e.g., BigBasket, Company Name"
            {...register('merchant')}
          />

          {/* Investment Type — only for INVESTMENT transactions */}
          {watchType === 'INVESTMENT' && (
            <SelectField label="Investment Type" {...register('investmentType')}>
              <option value="">Select investment type</option>
              {INVESTMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </SelectField>
          )}

          {/* Recurring */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
                {...register('isRecurring')}
              />
              <span className="text-sm text-gray-700">This is a recurring transaction</span>
            </label>

            {watchIsRecurring && (
              <SelectField label="Recurring Interval" {...register('recurringInterval')}>
                <option value="">Select interval</option>
                {RECURRING_INTERVALS.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </SelectField>
            )}
          </div>

          {/* Tax Deductible */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
              {...register('taxDeductible')}
            />
            <span className="text-sm text-gray-700">Tax deductible</span>
          </label>

          {/* Tags */}
          <Input
            label="Tags (comma separated)"
            placeholder="e.g., business, reimbursable, urgent"
            {...register('tags')}
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {isEditing ? 'Update Transaction' : 'Create Transaction'}
            </Button>
          </div>

        </form>
      </Card>
    </div>
  )
}

export default TransactionForm