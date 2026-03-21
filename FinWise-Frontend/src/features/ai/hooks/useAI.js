import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  generateInsights,
  getInvestmentSuggestions,
  getTaxTips,
  scanReceipt
} from '../../../api/ai'

/**
 * Hook for generating financial insights
 */
export const useGenerateInsights = () => {
  return useMutation({
    mutationFn: generateInsights,
    onError: (error) => {
      toast.error(error.message || 'Failed to generate insights')
    }
  })
}

/**
 * Hook for getting investment suggestions
 */
export const useInvestmentSuggestions = () => {
  return useMutation({
    mutationFn: getInvestmentSuggestions,
    onError: (error) => {
      toast.error(error.message || 'Failed to get investment suggestions')
    }
  })
}

/**
 * Hook for getting tax tips
 */
export const useTaxTips = () => {
  return useMutation({
    mutationFn: getTaxTips,
    onError: (error) => {
      toast.error(error.message || 'Failed to get tax tips')
    }
  })
}

/**
 * Hook for scanning receipt
 */
export const useScanReceipt = () => {
  return useMutation({
    mutationFn: scanReceipt,
    onError: (error) => {
      toast.error(error.message || 'Failed to scan receipt')
    }
  })
}