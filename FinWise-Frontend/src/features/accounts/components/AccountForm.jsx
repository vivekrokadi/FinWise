import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Card from '../../../components/ui/Card'
import { ACCOUNT_TYPES, DEFAULT_COLORS, CURRENCIES } from '../../../utils/constants'
import { useCreateAccount, useUpdateAccount } from '../hooks/useAccounts'

// Account form validation schema
const accountSchema = z.object({
  name: z.string()
    .min(2, 'Account name must be at least 2 characters')
    .max(50, 'Account name must be less than 50 characters'),
  type: z.enum(['CURRENT', 'SAVINGS', 'INVESTMENT', 'CREDIT_CARD']),
  balance: z.string()
    .optional()
    .transform((val) => val ? parseFloat(val) : 0)
    .refine((val) => val >= 0, 'Balance must be positive'),
  currency: z.string().default('RUPEES'),
  isDefault: z.boolean().default(false),
  color: z.string().default(DEFAULT_COLORS.PRIMARY),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .optional()
    .default('')
})

const AccountForm = ({ account, onClose }) => {
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const isEditing = !!account

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: account ? {
      name: account.name,
      type: account.type,
      balance: account.balance?.toString() || '0',
      currency: account.currency || 'RUPEES',
      isDefault: account.isDefault || false,
      color: account.color || DEFAULT_COLORS.PRIMARY,
      description: account.description || ''
    } : {
      type: 'CURRENT',
      currency: 'RUPEES',
      isDefault: false,
      color: DEFAULT_COLORS.PRIMARY,
      description: ''
    }
  })

  const selectedColor = watch('color')

  const onSubmit = async (data) => {
    if (isEditing) {
      await updateMutation.mutateAsync({
        id: account._id,
        data
      })
    } else {
      await createMutation.mutateAsync(data)
    }
    onClose()
  }

  // Prevent background scroll when modal is open
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
            {isEditing ? 'Edit Account' : 'Add New Account'}
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
            label="Account Name"
            placeholder="e.g., Main Checking"
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('type')}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <Input
            label="Initial Balance"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.balance?.message}
            {...register('balance')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('currency')}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                className="w-10 h-10 rounded border border-gray-300"
                {...register('color')}
              />
              <span className="text-sm text-gray-600">
                Selected: {selectedColor}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              {...register('isDefault')}
            />
            <label className="text-sm text-gray-700">
              Set as default account
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about this account..."
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
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
              {isEditing ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default AccountForm