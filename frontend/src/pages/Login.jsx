import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { connectSocket } from '../utils/socket'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const { login, loading, error, user, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token')
      if (token) connectSocket(token)
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(form.email, form.password)

    if (ok) {
      const token = localStorage.getItem('token')
      if (token) connectSocket(token)
      toast.success('Welcome back')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-gray-950">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">💼</div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to CareerPilot
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Welcome back
          </p>
        </div>

        {/* Card */}
        <div className="border border-gray-200 dark:border-gray-800 
          rounded-xl p-6 bg-white dark:bg-gray-900 
          shadow-md hover:shadow-lg transition">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="you@example.com"
                className="mt-1 w-full px-3 py-2 rounded-lg border 
                  border-gray-300 dark:border-gray-700 
                  bg-white dark:bg-gray-950 text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 
                  focus:border-indigo-500 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Password
              </label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border 
                    border-gray-300 dark:border-gray-700 
                    bg-white dark:bg-gray-950 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 
                    focus:border-indigo-500 transition"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-500 text-xs hover:text-gray-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white
                bg-indigo-600 hover:bg-indigo-700
                shadow-sm hover:shadow-md
                transition-all duration-150
                active:scale-[0.98]
                disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-indigo-600"
              >
                Forgot password?
              </button>
            </div>
          </form>

          {/* Register */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-600 font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}