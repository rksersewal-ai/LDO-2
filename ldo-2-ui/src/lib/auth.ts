import { apiClient } from './api/client'

export interface AuthUser { id: string; username: string; role: string }
export interface AuthResponse { access_token: string; token_type: string; expires_in: number; user: AuthUser }

export const authApi = {
  login: async (payload: { username: string; password: string }): Promise<AuthResponse> => {
    const form = new URLSearchParams()
    form.append('username', payload.username)
    form.append('password', payload.password)
    const { data } = await apiClient.post<AuthResponse>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  },
  logout: async () => { await apiClient.post('/auth/logout').catch(() => {}) },
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('ldo_token', token)
  document.cookie = `ldo_token=${token}; path=/; max-age=${60 * 60 * 8}; SameSite=Strict`
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('ldo_token')
  document.cookie = 'ldo_token=; path=/; max-age=0'
}
