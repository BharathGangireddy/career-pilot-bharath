// UPDATED VERSION (based on your file) :contentReference[oaicite:0]{index=0}

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import useJobStore from '../store/jobStore'
import useAuthStore from '../store/authStore'
import { STATUS_CONFIG } from '../utils/status'
import { getSocket } from '../utils/socket'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const PIE_COLORS = {
  wishlist:'#6b7280',
  applied:'#3b82f6',
  interview:'#f59e0b',
  offer:'#22c55e',
  rejected:'#ef4444'
}

// 🔥 Counter
function Counter({ value }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2 })
    return controls.stop
  }, [value])

  return <motion.span>{rounded}</motion.span>
}

export default function Dashboard() {
  const { stats, jobs = [], fetchStats, fetchJobs } = useJobStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchStats()
    fetchJobs()
  }, [])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    socket.on('jobUpdate', () => {
      fetchJobs()
      fetchStats()
    })

    return () => socket.off('jobUpdate')
  }, [])

  const statusData = stats?.stats?.map(s => ({
    name: STATUS_CONFIG[s._id]?.label || s._id,
    value: s.count,
    status: s._id
  })) || []

  const monthlyData = stats?.monthly?.map(m => ({
    name: MONTHS[m._id.month - 1],
    applications: m.count
  })) || []

  const total = statusData.reduce((a, b) => a + b.value, 0)
  const interviews = statusData.find(s => s.status === 'interview')?.value || 0
  const offers = statusData.find(s => s.status === 'offer')?.value || 0
  const responseRate = total > 0
    ? Math.round(((interviews + offers) / total) * 100)
    : 0

  const recentJobs = jobs.slice(0, 5)
  const firstName = user?.name?.split(' ')[0] || 'User'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-6 py-10"
    >

      {/* 🔥 MAIN WRAPPER */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-gray-500">Here’s your job search overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Applications', value: total },
            { label: 'Interviews', value: interviews },
            { label: 'Offers', value: offers },
            { label: 'Response rate', value: responseRate }
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition p-5 relative overflow-hidden"
            >

              {/* Gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

              <motion.span
                className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />

              <div className="text-3xl font-semibold">
                <Counter value={s.value} />
                {s.label === 'Response rate' && '%'}
              </div>

              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">

          {/* Bar Chart */}
          <motion.div whileHover={{ scale: 1.01 }} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <h2 className="font-semibold mb-4">Applications over time</h2>

            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1"/>
                      <stop offset="100%" stopColor="#8b5cf6"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="url(#barGradient)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-gray-400">
                No data yet
              </div>
            )}
          </motion.div>

          {/* Pie Chart */}
          <motion.div whileHover={{ scale: 1.01 }} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <h2 className="font-semibold mb-4">Status breakdown</h2>

            {statusData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={240}>
                  <PieChart>
                    <Pie data={statusData} innerRadius={60} outerRadius={90} dataKey="value">
                      {statusData.map(entry => (
                        <Cell key={entry.status} fill={PIE_COLORS[entry.status]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex-1 space-y-3">
                  {statusData.map(s => (
                    <div key={s.status} className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[s.status] }} />
                        {s.name}
                      </div>
                      <span className="font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-gray-400">
                No data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">Recent applications</h2>
            <Link to="/jobs" className="text-sm text-indigo-600 hover:underline">
              View all
            </Link>
          </div>

          {recentJobs.length > 0 ? (
            <div className="divide-y">
              {recentJobs.map((job, i) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link
                    to={`/jobs/${job._id}`}
                    className="flex justify-between py-3 px-2 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-sm">{job.role}</p>
                      <p className="text-xs text-gray-500">{job.company}</p>
                    </div>

                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_CONFIG[job.status]?.color}`}>
                      {STATUS_CONFIG[job.status]?.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p>No applications yet</p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  )
}