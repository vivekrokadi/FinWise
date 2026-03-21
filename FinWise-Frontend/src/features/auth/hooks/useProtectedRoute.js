import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

/**
 * Hook to protect routes
 * Redirects to login if not authenticated
 * @param {boolean} redirectIfAuthenticated - If true, redirects to dashboard when authenticated (for login/register pages)
 */
export const useProtectedRoute = (redirectIfAuthenticated = false) => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (redirectIfAuthenticated && isAuthenticated) {
        // For login/register pages - redirect to dashboard if already logged in
        navigate('/dashboard')
      } else if (!redirectIfAuthenticated && !isAuthenticated) {
        // For protected pages - redirect to login if not authenticated
        navigate('/login')
      }
    }
  }, [isAuthenticated, isLoading, navigate, redirectIfAuthenticated])

  return { isAuthenticated, isLoading }
}