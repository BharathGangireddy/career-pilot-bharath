import { create } from 'zustand'
import api from '../utils/api'

// ✅ Safe helper to parse user
const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user')
    return user && user !== 'undefined' ? JSON.parse(user) : null
  } catch (err) {
    console.error('Invalid user in localStorage:', err)
    return null
  }
}

// ✅ Safe helper for token
const getTokenFromStorage = () => {
  const token = localStorage.getItem('token')
  return token && token !== 'undefined' ? token : null
}

const useAuthStore = create((set, get) => ({
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  loading: false,
  error: null,

  // 🔐 LOGIN
  login: async (email, password) => {
    set({ loading: true, error: null })

    try {
      const { data } = await api.post('/auth/login', { email, password })

      const userData = data.user || data

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(userData))

      set({
        user: userData,
        token: data.token,
        loading: false,
        error: null
      })

      return true
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed'

      set({
        error: message,
        loading: false
      })

      return false
    }
  },

  // 📝 REGISTER
  register: async (name, email, password) => {
    set({ loading: true, error: null })

    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password
      })

      const userData = data.user || data

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(userData))

      set({
        user: userData,
        token: data.token,
        loading: false,
        error: null
      })

      return true
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed'

      set({
        error: message,
        loading: false
      })

      return false
    }
  },

  // 🚪 LOGOUT
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  // 📄 UPDATE RESUME (🔥 FIXED PROPERLY)
  updateResume: async (resumeText) => {
    try {
      const { data } = await api.put('/auth/resume', { resumeText })

      // ✅ Handle both backend formats
      const updatedUser = data.user || {
        ...get().user,
        resumeText: data.resumeText
      }

      // ✅ Persist to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))

      // ✅ Update state
      set({ user: updatedUser })

      return true
    } catch (err) {
      console.error('Resume update failed:', err)
      throw err
    }
  },

  // ❌ CLEAR ERROR
  clearError: () => set({ error: null })
}))

export default useAuthStore