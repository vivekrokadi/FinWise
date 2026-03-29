import { apiClient } from './client'

export const getNotificationPrefs = async () => {
  const response = await apiClient.get('/notifications/preferences')
  return response.data
}

export const updateNotificationPrefs = async (prefs) => {
  const response = await apiClient.put('/notifications/preferences', prefs)
  return response.data
}

export const triggerWeeklyReport = async () => {
  const response = await apiClient.post('/notifications/send-report', {})
  return response
}

export const checkBudgetAlerts = async () => {
  return apiClient.post('/notifications/check-budgets', {})
}

export const testEmailConnection = async () => {
  const response = await apiClient.get('/notifications/test-email')
  return response.data
}