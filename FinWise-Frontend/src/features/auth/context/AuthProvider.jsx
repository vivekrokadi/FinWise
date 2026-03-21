import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthContext } from './AuthContext'
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from '../../../api/auth'
import { apiClient } from '../../../api/client'
import { STORAGE_KEYS } from '../../../utils/constants'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  /**
   * Load user from token on mount
   */
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
      
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await getCurrentUser()
        if (response.success && response.data?.user) {
          setUser(response.data.user)
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user))
        } else {
          // Invalid token
          localStorage.removeItem(STORAGE_KEYS.TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USER)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  /**
   * Login handler
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    try {
      const response = await apiLogin({ email, password })
      
      if (response.success && response.data) {
        const userData = response.data.user
        setUser(userData)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
        toast.success('Login successful!')
        navigate('/dashboard')
        return { success: true }
      } else {
        toast.error(response.message || 'Login failed')
        return { success: false, error: response.message }
      }
    } catch (error) {
      toast.error(error.message || 'Login failed')
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  /**
   * Register handler
   */
  const register = useCallback(async (name, email, password) => {
    setIsLoading(true)
    try {
      const response = await apiRegister({ name, email, password })
      
      if (response.success && response.data) {
        const userData = response.data.user
        setUser(userData)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
        toast.success('Registration successful!')
        navigate('/dashboard')
        return { success: true }
      } else {
        toast.error(response.message || 'Registration failed')
        return { success: false, error: response.message }
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed')
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state
      setUser(null)
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      toast.success('Logged out successfully')
      navigate('/login')
    }
  }, [navigate])

  /**
   * Update user in state
   */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
  }, [])

  /**
   * Memoized context value
   */
  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser
  }), [user, isLoading, login, register, logout, updateUser])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}