import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  setDefaultAccount,
  getAccountStats
} from '../../../api/accounts'

// Query keys
export const accountKeys = {
  all: ['accounts'],
  lists: () => [...accountKeys.all, 'list'],
  list: (filters) => [...accountKeys.lists(), { filters }],
  details: () => [...accountKeys.all, 'detail'],
  detail: (id) => [...accountKeys.details(), id],
  stats: (id) => [...accountKeys.all, 'stats', id]
}

/**
 * Hook for accounts list
 */
export const useAccounts = () => {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: getAccounts,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

/**
 * Hook for single account with transactions
 */
export const useAccount = (id) => {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => getAccount(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

/**
 * Hook for account stats
 */
export const useAccountStats = (id) => {
  return useQuery({
    queryKey: accountKeys.stats(id),
    queryFn: () => getAccountStats(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

/**
 * Hook for creating account
 */
export const useCreateAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAccount,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
      toast.success(data.message || 'Account created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create account')
    }
  })
}

/**
 * Hook for updating account
 */
export const useUpdateAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateAccount(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.id) })
      toast.success(data.message || 'Account updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update account')
    }
  })
}

/**
 * Hook for deleting account
 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
      toast.success(data.message || 'Account deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete account')
    }
  })
}

/**
 * Hook for setting default account
 */
export const useSetDefaultAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setDefaultAccount,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(id) })
      toast.success(data.message || 'Default account updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to set default account')
    }
  })
}