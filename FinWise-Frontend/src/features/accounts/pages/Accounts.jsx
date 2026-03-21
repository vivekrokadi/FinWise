import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAccounts } from '../hooks/useAccounts'
import AccountCard from '../components/AccountCard'
import AccountForm from '../components/AccountForm'
import Button from '../../../components/ui/Button'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Card from '../../../components/ui/Card'

const Accounts = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  
  const { data: accounts, isLoading, error } = useAccounts()

  const handleEdit = (account) => {
    setEditingAccount(account)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAccount(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load accounts</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your bank accounts and wallets</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Account
        </Button>
      </div>

      {/* Accounts Grid */}
      {accounts?.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first bank account or wallet
            </p>
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Your First Account
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts?.map((account) => (
            <AccountCard
              key={account._id}
              account={account}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Account Form Modal */}
      {showForm && (
        <AccountForm
          account={editingAccount}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

export default Accounts