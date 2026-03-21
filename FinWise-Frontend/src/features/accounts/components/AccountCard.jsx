import { useNavigate } from 'react-router-dom'
import { Wallet, MoreVertical, Star, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatCurrency, formatAccountType } from '../../../utils/formatters'
import { useSetDefaultAccount, useDeleteAccount } from '../hooks/useAccounts'

const AccountCard = ({ account, onEdit }) => {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const setDefaultMutation = useSetDefaultAccount()
  const deleteMutation = useDeleteAccount()

  const handleSetDefault = async () => {
    await setDefaultMutation.mutateAsync(account._id)
    setShowMenu(false)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(account._id)
    setShowMenu(false)
    setShowDeleteConfirm(false)
  }

  const balanceColor = account.balance >= 0 ? 'text-green-600' : 'text-red-600'

  return (
    <Card className="relative hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${account.color}20` }}
          >
            <Wallet className="h-5 w-5" style={{ color: account.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{account.name}</h3>
            <p className="text-sm text-gray-500">{formatAccountType(account.type)}</p>
          </div>
        </div>

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    navigate(`/accounts/${account._id}`)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onEdit(account)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit Account
                </button>
                {!account.isDefault && (
                  <button
                    onClick={handleSetDefault}
                    disabled={setDefaultMutation.isPending}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Set as Default
                  </button>
                )}
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={() => {
                    setShowMenu(false)
                    setShowDeleteConfirm(true)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete Account
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Current Balance</p>
        <p className={`text-2xl font-bold ${balanceColor}`}>
          {formatCurrency(account.balance, account.currency)}
        </p>
      </div>

      {/* Default badge and quick actions */}
      <div className="flex items-center justify-between">
        {account.isDefault && (
          <div className="flex items-center text-sm text-yellow-600">
            <Star className="h-4 w-4 mr-1 fill-yellow-400" />
            Default Account
          </div>
        )}
        
        <div className="flex space-x-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/accounts/${account._id}`)}
          >
            View
          </Button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{account.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  )
}

export default AccountCard