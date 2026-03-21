import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, CreditCard, Save, Key } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { updateProfile } from '../../../api/auth'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import ChangePasswordForm from '../components/ChangePasswordForm'
import { CURRENCIES } from '../../../utils/constants'
import { toast } from 'sonner'

const profileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  currency: z.string(),
  monthlyBudget: z.string()
    .optional()
    .transform((val) => val ? parseFloat(val) : 0)
    .refine((val) => val >= 0, 'Monthly budget must be positive')
})

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      currency: user?.currency || 'RUPEES',
      monthlyBudget: user?.monthlyBudget?.toString() || '0'
    }
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const response = await updateProfile(data)
      if (response.success) {
        updateUser(response.data.user)
        toast.success('Profile updated successfully')
        setIsEditing(false)
      } else {
        toast.error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          {!isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              leftIcon={<User className="h-4 w-4 text-gray-400" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              value={user?.email}
              disabled
              leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
              className="bg-gray-50"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Currency
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

            <Input
              label="Monthly Budget"
              type="number"
              step="0.01"
              placeholder="0.00"
              leftIcon={<CreditCard className="h-4 w-4 text-gray-400" />}
              error={errors.monthlyBudget?.message}
              {...register('monthlyBudget')}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Name</span>
              <span className="font-medium text-gray-900">{user?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Currency</span>
              <span className="font-medium text-gray-900">
                {CURRENCIES.find(c => c.value === user?.currency)?.label || user?.currency}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Monthly Budget</span>
              <span className="font-medium text-gray-900">
                {user?.monthlyBudget ? `₹${user.monthlyBudget.toLocaleString()}` : 'Not set'}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Security Card */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            <p className="text-sm text-gray-600 mt-1">Change your password</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowPasswordForm(true)}
            leftIcon={<Key className="h-4 w-4" />}
          >
            Change Password
          </Button>
        </div>
      </Card>

      {/* Change Password Modal */}
      {showPasswordForm && (
        <ChangePasswordForm onClose={() => setShowPasswordForm(false)} />
      )}
    </div>
  )
}

export default Profile