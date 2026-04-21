import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getBudgets,
  getCurrentBudget,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  getBudgetStats
} from '../../../api/budgets'

// Query keys
export const budgetKeys = {
  all: ['budgets'],
  lists: () => [...budgetKeys.all, 'list'],
  list: (year) => [...budgetKeys.lists(), { year }],
  current: () => [...budgetKeys.all, 'current'],
  alerts: () => [...budgetKeys.all, 'alerts'],
  stats: () => [...budgetKeys.all, 'stats'],
  detail: (id) => [...budgetKeys.all, 'detail', id]
}

/**
 * Hook for budgets list
 * @param {number} year - Year to fetch budgets for
 */
export const useBudgets = (year) => {
  return useQuery({
    queryKey: budgetKeys.list(year),
    queryFn: () => getBudgets(year),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

/**
 * Hook for current month budget
 * @param {string} accountId - Optional account ID filter
 */
export const useCurrentBudget = (accountId) => {
  return useQuery({
    queryKey: budgetKeys.current(),
    queryFn: () => getCurrentBudget(accountId),
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

/**
 * Hook for budget alerts
 */
export const useBudgetAlerts = () => {
  return useQuery({
    queryKey: budgetKeys.alerts(),
    queryFn: getBudgetAlerts,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  })
}

/**
 * Hook for budget stats
 */
export const useBudgetStats = (year) => {
  return useQuery({
    queryKey: [...budgetKeys.stats(), { year }],
    queryFn: () => getBudgetStats(year),
    staleTime: 5 * 60 * 1000
  })
}

/**
 * Hook for creating/updating budget
 */
export const useCreateOrUpdateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrUpdateBudget,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.current() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.stats() })
      toast.success(data.message || 'Budget saved successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save budget')
    }
  })
}

/**
 * Hook for updating budget
 */
export const useUpdateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateBudget(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.current() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.stats() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(variables.id) })
      toast.success(data.message || 'Budget updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update budget')
    }
  })
}

/**
 * Hook for deleting budget
 */
export const useDeleteBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.current() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.stats() })
      toast.success(data.message || 'Budget deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete budget')
    }
  })
}