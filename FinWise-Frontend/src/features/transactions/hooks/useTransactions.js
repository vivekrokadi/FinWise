import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
  getTransactionStats,
  getCategoryBreakdown
} from '../../../api/transactions'

// Query keys
export const transactionKeys = {
  all: ['transactions'],
  lists: () => [...transactionKeys.all, 'list'],
  list: (filters) => [...transactionKeys.lists(), { filters }],
  details: () => [...transactionKeys.all, 'detail'],
  detail: (id) => [...transactionKeys.details(), id],
  stats: (filters) => [...transactionKeys.all, 'stats', filters],
  categoryBreakdown: (filters) => [...transactionKeys.all, 'categoryBreakdown', filters]
}

/**
 * Hook for transactions list with pagination and filters
 */
export const useTransactions = (filters = {}) => {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

/**
 * Hook for single transaction
 */
export const useTransaction = (id) => {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransaction(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000
  })
}

/**
 * Hook for transaction statistics
 */
export const useTransactionStats = (filters = {}) => {
  return useQuery({
    queryKey: transactionKeys.stats(filters),
    queryFn: () => getTransactionStats(filters),
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

/**
 * Hook for category breakdown
 */
export const useCategoryBreakdown = (filters = {}) => {
  return useQuery({
    queryKey: transactionKeys.categoryBreakdown(filters),
    queryFn: () => getCategoryBreakdown(filters),
    staleTime: 10 * 60 * 1000
  })
}

/**
 * Hook for creating transaction
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(data.message || 'Transaction created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create transaction')
    }
  })
}

/**
 * Hook for updating transaction
 */
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateTransaction(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(data.message || 'Transaction updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update transaction')
    }
  })
}

/**
 * Hook for deleting transaction
 */
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(data.message || 'Transaction deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete transaction')
    }
  })
}

/**
 * Hook for bulk delete transactions
 */
export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => {
      // Accept either a plain array or { transactionIds: [...] }
      const ids = Array.isArray(payload) ? payload : (payload?.transactionIds || [])
      return bulkDeleteTransactions(ids)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(data.message || 'Transactions deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete transactions')
    }
  })
}