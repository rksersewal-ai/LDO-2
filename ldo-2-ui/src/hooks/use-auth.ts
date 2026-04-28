'use client'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/lib/auth'

export function useAuth() {
  const router = useRouter()
  const { user, token, isAuthenticated, logout: _logout } = useAuthStore()
  const logout = async () => { await authApi.logout(); _logout(); router.replace('/login') }
  return { user, token, isAuthenticated, logout }
}
