import { createContext } from 'react'

/**
 * Auth Context definition
 * Contains user state and auth methods
 */
export const AuthContext = createContext({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
})