import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Card from '../../../components/ui/Card'
import { BUDGET_PERIODS, ALERT_THRESHOLDS } from '../../../utils/constants'
import { useCreateOrUpdateBudget, useUpdateBudget } from '../hooks/useBudgets'

// Budget form validation schema
const budgetSchema = z.object({
  amount: z.string()
    .min(1, 'Budget amount is required')
    .transform((val) => parseFloat(val))
    .refine((val) => val > 0, 'Budget amount must be greater than 0'),
  period: z.enum(['MONTHLY', 'YEARLY']),
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  year: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : new Date().getFullYear()),
  month: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : new Date().getMonth() + 1),
  alertsEnabled: z.boolean().default(true),
  alertThreshold: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 80)
    .refine((val) => val >= 0 && val <= 100, 'Alert threshold must be between 0 and 100')
})

const BudgetForm = ({ budget, onClose }) => {
  const createMutation = useCreateOrUpdateBudget()
  const updateMutation = useUpdateBudget()
  const isEditing = !!budget

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget ? {
      amount: budget.amount?.toString() || '',
      period: budget.period || 'MONTHLY',
      category: budget.category,
      year: budget.year?.toString() || new Date().getFullYear().toString(),
      month: budget.month?.toString() || (new Date().getMonth() + 1).toString(),
      alertsEnabled: budget.alertsEnabled !== undefined ? budget.alertsEnabled : true,
      alertThreshold: budget.alertThreshold?.toString() || '80'
    } : {
      period: 'MONTHLY',
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString(),
      alertsEnabled: true,
      alertThreshold: '80'
    }
  })

  const watchPeriod = watch('period')

  const onSubmit = async (data) => {
    // Clean up data based on period
    const payload = {
      amount: data.amount,
      period: data.period,
      category: data.category.toLowerCase(),
      year: data.year,
      alertsEnabled: data.alertsEnabled,
      alertThreshold: data.alertThreshold
    }

    if (data.period === 'MONTHLY') {
      payload.month = data.month
    }

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: budget._id,
        data: payload
      })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onClose()
  }

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Budget' : 'Create New Budget'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Category"
            placeholder="e.g., Groceries, Transportation"
            error={errors.category?.message}
            {...register('category')}
          />

          <Input
            label="Budget Amount *"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Period *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BUDGET_PERIODS.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => setValue('period', period.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    watchPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            {errors.period && (
              <p className="mt-1 text-sm text-red-600">{errors.period.message}</p>
            )}
          </div>

          {/* Year and Month based on period */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Year"
              type="number"
              min="2000"
              max="2100"
              error={errors.year?.message}
              {...register('year')}
            />

            {watchPeriod === 'MONTHLY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('month', { valueAsNumber: true })}
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
                {errors.month && (
                  <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Alert Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
                {...register('alertsEnabled')}
              />
              <label className="text-sm text-gray-700">
                Enable budget alerts
              </label>
            </div>

            {watch('alertsEnabled') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert at percentage (%)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('alertThreshold')}
                >
                  {ALERT_THRESHOLDS.map((threshold) => (
                    <option key={threshold} value={threshold}>
                      {threshold}% - {threshold === 100 ? 'Exceeded' : 'Warning at ' + threshold + '%'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {isEditing ? 'Update Budget' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default BudgetForm