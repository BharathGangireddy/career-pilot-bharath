import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/jobs', label: 'Applications', icon: '📄' },
  { to: '/kanban', label: 'Kanban', icon: '🧠' },
  { to: '/profile', label: 'Profile', icon: '👤' }
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <div className="w-64 h-screen fixed left-0 top-0 
      bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">

      {/* Logo */}
      <div className="text-xl font-semibold mb-8">
        💼 CareerPilot
      </div>

      {/* Nav */}
      <div className="space-y-1">
        {NAV.map(n => (
          <Link
            key={n.to}
            to={n.to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              pathname === n.to
                ? 'bg-brand-50 text-brand-600'
                : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span>{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </div>
    </div>
  )
}