import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, CreditCard, Save, Key, Camera, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../auth/hooks/useAuth'
import { updateProfile, changePassword } from '../../../api/auth'
import { uploadAvatar, deleteUserAccount } from '../../../api/users'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import ChangePasswordForm from '../components/ChangePasswordForm'
import { CURRENCIES } from '../../../utils/constants'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  currency: z.string(),
  monthlyBudget: z.string()
    .optional()
    .transform((val) => val ? parseFloat(val) : 0)
    .refine((val) => val >= 0, 'Monthly budget must be positive')
})

const Profile = () => {
  const { user, updateUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      currency: user?.currency || 'INR',
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

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }
    setUploadingAvatar(true)
    try {
      const data = await uploadAvatar(file)
      updateUser({ ...user, avatar: data.avatar })
      toast.success('Avatar updated successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount()
      toast.success('Account deleted')
      await logout()
    } catch (error) {
      toast.error(error.message || 'Failed to delete account')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
      </div>

      {/* Avatar Card */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-20 h-20 object-cover" />
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition"
              disabled={uploadingAvatar}
            >
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 2MB</p>
          </div>
        </div>
      </Card>

      {/* Profile Info */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          {!isEditing && (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Currency</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('currency')}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
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
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Name', value: user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Currency', value: CURRENCIES.find(c => c.value === user?.currency)?.label || user?.currency },
              { label: 'Monthly Budget', value: user?.monthlyBudget ? `₹${user.monthlyBudget.toLocaleString('en-IN')}` : 'Not set' }
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Security */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            <p className="text-sm text-gray-600 mt-1">Change your login password</p>
          </div>
          <Button variant="secondary" onClick={() => setShowPasswordForm(true)} leftIcon={<Key className="h-4 w-4" />}>
            Change Password
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button
          variant="danger"
          size="sm"
          leftIcon={<Trash2 className="h-4 w-4" />}
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete Account
        </Button>
      </Card>

      {/* Change Password Modal */}
      {showPasswordForm && <ChangePasswordForm onClose={() => setShowPasswordForm(false)} />}

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-4">
              Are you absolutely sure? This will permanently delete your account, all transactions, accounts, and budgets. This cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteAccount}>Yes, Delete Everything</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Profile