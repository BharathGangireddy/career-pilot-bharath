import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Bell } from 'lucide-react'

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/jobs', label: 'Applications' },
  { to: '/kanban', label: 'Kanban' },
  { to: '/profile', label: 'Profile' }
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  const notifications = [
    'Interview scheduled at Google',
    'Application moved to Offer',
    'Resume improved successfully'
  ]

  // 🌗 Load theme
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const isDark = saved === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    setDark(isDark)
  }, [])

  // 🌗 Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ✅ Close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 🔥 Auto popup (no spam)
  useEffect(() => {
    if (!notifications.length) return

    toast.success(notifications[0], { id: 'notif' })
  }, [])

  // ⏱ simulate live update
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.success('New interview scheduled 🚀', { id: 'live' })
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  const toggleDark = () => {
    const newMode = !dark
    setDark(newMode)
    document.documentElement.classList.toggle('dark', newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')

    toast.success(newMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const firstName = user?.name?.split(' ')[0] || 'User'
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300
      ${scrolled
        ? 'backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 shadow-sm border-b border-gray-200/60 dark:border-gray-700/60'
        : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 text-xl font-semibold text-brand-600">
            <span className="text-2xl">💼</span>
            CareerPilot
          </Link>

          {/* Nav */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {NAV.map(n => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-4 py-2 text-sm rounded-lg transition ${
                  pathname === n.to
                    ? 'bg-white dark:bg-gray-900 shadow text-brand-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">

            {/* 🔔 Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                  {notifications.length}
                </span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-900 
                  rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 
                  p-4 z-50 backdrop-blur-xl animate-dropdown">

                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      🔔 Notifications
                    </p>
                    <span className="text-xs text-gray-400">
                      {notifications.length} new
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 rounded-lg 
                        hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                      >
                        <span className="text-indigo-500 mt-1">✨</span>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {n}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setNotifOpen(false)}
                    className="mt-3 w-full text-xs text-indigo-600 hover:underline"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* 🌗 Toggle */}
            <button onClick={toggleDark}
              className="relative w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1">
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
                dark ? 'translate-x-6' : ''
              }`} />
            </button>

            {/* 👤 User */}
            <div className="relative z-50" ref={dropdownRef}>
              <div
                onClick={() => setDropdown(!dropdown)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center">
                  {initial}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {firstName}
                </span>
              </div>

              {dropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border rounded-xl shadow-xl p-2">
                  <Link to="/profile" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setOpen(!open)} className="md:hidden">☰</button>
          </div>
        </div>

        {/* Mobile */}
        {open && (
          <div className="md:hidden mt-2 bg-white dark:bg-gray-900 border rounded-xl p-2 space-y-1 shadow">
            {NAV.map(n => (
              <Link key={n.to} to={n.to}
                className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                {n.label}
              </Link>
            ))}
          </div>
        )}

      </div>
    </nav>
  )
}