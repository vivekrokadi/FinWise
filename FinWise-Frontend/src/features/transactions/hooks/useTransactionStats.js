import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
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

export const transactionKeys = {
  all: ['transactions'],
  lists: () => [...transactionKeys.all, 'list'],
  list: (filters) => [...transactionKeys.lists(), { filters }],
  details: () => [...transactionKeys.all, 'detail'],
  detail: (id) => [...transactionKeys.details(), id],
  stats: (filters) => [...transactionKeys.all, 'stats', filters],
  categoryBreakdown: (filters) => [...transactionKeys.all, 'categoryBreakdown', filters]
}

export const useTransactions = (filters = {}) => {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000
  })
}

export const useTransaction = (id) => {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransaction(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000
  })
}

export const useTransactionStats = (filters = {}) => {
  return useQuery({
    queryKey: transactionKeys.stats(filters),
    queryFn: () => getTransactionStats(filters),
    staleTime: 10 * 60 * 1000
  })
}

export const useCategoryBreakdown = (filters = {}) => {
  return useQuery({
    queryKey: transactionKeys.categoryBreakdown(filters),
    queryFn: () => getCategoryBreakdown(filters),
    staleTime: 10 * 60 * 1000
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction created successfully')
    },
    onError: (error) => toast.error(error.message || 'Failed to create transaction')
  })
}

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateTransaction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction updated successfully')
    },
    onError: (error) => toast.error(error.message || 'Failed to update transaction')
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction deleted successfully')
    },
    onError: (error) => toast.error(error.message || 'Failed to delete transaction')
  })
}

export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bulkDeleteTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transactions deleted successfully')
    },
    onError: (error) => toast.error(error.message || 'Failed to delete transactions')
  })
}