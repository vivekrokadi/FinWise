import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../api/client'

/**
 * Fetch dashboard statistics from backend
 */
const fetchDashboardStats = async () => {
  const response = await apiClient.get('/users/dashboard')
  return response.data
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  })
}