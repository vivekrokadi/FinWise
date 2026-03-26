import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Card from '../../../components/ui/Card'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import {
  TRANSACTION_TYPES,
  INVESTMENT_TYPES,
  RECURRING_INTERVALS
} from '../../../utils/constants'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useCreateTransaction, useUpdateTransaction } from '../hooks/useTransactions'
import { formatCurrency } from '../../../utils/formatters'

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'INVESTMENT', 'TAX']),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be greater than 0'),
  description: z.string()
    .min(2, 'Description must be at least 2 characters')
    .max(200, 'Description too long'),
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
      type: transaction.type,
      amount: transaction.amount?.toString() || '',
      description: transaction.description,
      date: transaction.date
        ? new Date(transaction.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      category: transaction.category,
      subcategory: transaction.subcategory || '',
      merchant: transaction.merchant || '',
      account: transaction.account?._id || transaction.account || '',
      isRecurring: transaction.isRecurring || false,
      recurringInterval: transaction.recurringInterval || null,
      taxDeductible: transaction.taxDeductible || false,
      investmentType: transaction.investmentType || null,
      tags: transaction.tags?.join(', ') || ''
    } : {
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      taxDeductible: false,
      recurringInterval: null,
      investmentType: null
    }
  })

  const watchType = watch('type')
  const watchIsRecurring = watch('isRecurring')

  const onSubmit = async (data) => {
    const tags = data.tags
      ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const payload = {
      ...data,
      amount: parseFloat(data.amount),
      tags,
      recurringInterval: data.isRecurring ? data.recurringInterval : null,
      investmentType: data.type === 'INVESTMENT' ? (data.investmentType || null) : null
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: transaction._id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch {
      // errors handled by mutation onError toast
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TRANSACTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setValue('type', type.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    watchType === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>

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

          <Input
            label="Description *"
            placeholder="e.g., Grocery shopping, Salary deposit"
            error={errors.description?.message}
            {...register('description')}
          />

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('account')}
            >
              <option value="">Select an account</option>
              {accounts?.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.name} ({account.type}) — {formatCurrency(account.balance, account.currency)}
                </option>
              ))}
            </select>
            {errors.account && <p className="mt-1 text-sm text-red-600">{errors.account.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Category *"
              placeholder="e.g., groceries, salary"
              error={errors.category?.message}
              {...register('category')}
            />
            <Input
              label="Subcategory"
              placeholder="e.g., vegetables, bonus"
              {...register('subcategory')}
            />
          </div>

          <Input
            label="Merchant / Payee"
            placeholder="e.g., BigBasket, Employer"
            {...register('merchant')}
          />

          {/* Investment Type */}
          {watchType === 'INVESTMENT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investment Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('investmentType')}
              >
                <option value="">Select investment type</option>
                {INVESTMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Recurring */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" {...register('isRecurring')} />
              <label className="text-sm text-gray-700">This is a recurring transaction</label>
            </div>
            {watchIsRecurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recurring Interval</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('recurringInterval')}
                >
                  <option value="">Select interval</option>
                  {RECURRING_INTERVALS.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Tax Deductible */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" {...register('taxDeductible')} />
            <label className="text-sm text-gray-700">This transaction is tax deductible</label>
          </div>

          <Input
            label="Tags (comma separated)"
            placeholder="e.g., business, travel, urgent"
            {...register('tags')}
          />

          <div className="flex justify-end space-x-2 pt-4">
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