import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  getMe,
} from '../api/auth'
import type { User } from '../types'

export function useAuth() {
  const { token, user, setToken, setUser, logout: storeLogout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token && !user) {
      getMe()
        .then((me: User) => setUser(me))
        .catch(() => {
          storeLogout()
        })
    }
  }, [token, user, setUser, storeLogout])

  async function login(email: string, password: string) {
    const { access_token } = await loginApi(email, password)
    setToken(access_token)
    const me = await getMe()
    setUser(me)
    navigate('/')
  }

  async function logout() {
    try {
      await logoutApi()
    } catch {
      // ignore logout API errors
    }
    storeLogout()
    navigate('/login')
  }

  async function register(data: {
    email: string
    password: string
    full_name?: string
  }) {
    await registerApi(data)
    await login(data.email, data.password)
  }

  return {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!token,
  }
}
