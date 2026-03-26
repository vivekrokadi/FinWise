import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { generateInsights, getInvestmentSuggestions, getTaxTips, scanReceipt } from '../../../api/ai'

export const useGenerateInsights = () => {
  return useMutation({
    mutationFn: generateInsights,
    onError: (error) => toast.error(error.message || 'Failed to generate insights')
  })
}

export const useInvestmentSuggestions = () => {
  return useMutation({
    mutationFn: getInvestmentSuggestions,
    onError: (error) => toast.error(error.message || 'Failed to get investment suggestions')
  })
}

export const useTaxTips = () => {
  return useMutation({
    mutationFn: getTaxTips,
    onError: (error) => toast.error(error.message || 'Failed to get tax tips')
  })
}

export const useScanReceipt = () => {
  return useMutation({
    mutationFn: scanReceipt,
    onSuccess: (data) => {
      if (data?.aiScanned) {
        toast.success('Receipt scanned successfully')
      } else {
        toast.info('Receipt saved — please fill in the details manually')
      }
    },
    onError: (error) => toast.error(error.message || 'Failed to scan receipt')
  })
}