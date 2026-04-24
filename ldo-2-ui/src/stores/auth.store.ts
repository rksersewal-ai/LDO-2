import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setAuthToken, clearAuthToken, AuthUser } from '@/lib/auth'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, token: null, isAuthenticated: false,
      setAuth: (user, token) => { setAuthToken(token); set({ user, token, isAuthenticated: true }) },
      logout: () => { clearAuthToken(); set({ user: null, token: null, isAuthenticated: false }) },
    }),
    { name: 'ldo-auth' }
  )
)
