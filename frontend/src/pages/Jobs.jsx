import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useJobStore from '../store/jobStore'
import { STATUSES, STATUS_CONFIG } from '../utils/status'
import toast from 'react-hot-toast'

export default function Jobs() {
  const navigate = useNavigate()

  const { jobs = [], fetchJobs, deleteJob, updateJob, loading } = useJobStore()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [sortField, setSortField] = useState('appliedDate')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchJobs({ search, status: statusFilter })
  }, [search, statusFilter])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this application?')) return
    await deleteJob(id)
    toast.success('Deleted')
  }

  const togglePin = async (e, job) => {
    e.stopPropagation()
    await updateJob(job._id, { pinned: !job.pinned })
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1

      let valA = a[sortField]
      let valB = b[sortField]

      if (sortField === 'appliedDate') {
        valA = new Date(valA)
        valB = new Date(valB)
      }

      if (typeof valA === 'string') {
        valA = valA.toLowerCase()
        valB = valB.toLowerCase()
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [jobs, sortField, sortOrder])

  const getStatusUI = (status) => {
    switch (status) {
      case 'offer': return 'bg-green-100 text-green-600'
      case 'interview': return 'bg-yellow-100 text-yellow-600'
      case 'applied': return 'bg-blue-100 text-blue-600'
      case 'rejected': return 'bg-red-100 text-red-600'
      case 'wishlist': return 'bg-gray-200 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-semibold">Applications</h1>
          <p className="text-sm text-gray-400 mt-1">{jobs.length} total</p>
        </div>

        <Link to="/jobs/new" className="btn-primary">
          + Add Job
        </Link>
      </div>

      {/* FILTERS CARD */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-3">

        <input
          placeholder="Search..."
          className="input md:w-80"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="input md:w-48"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE HEADER */}
      <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_0.7fr_1fr] px-5 pb-3 text-xs text-gray-400 uppercase border-b">

        <span onClick={() => handleSort('role')} className="cursor-pointer">
          Role {getSortIcon('role')}
        </span>

        <span onClick={() => handleSort('company')} className="cursor-pointer">
          Company {getSortIcon('company')}
        </span>

        <span onClick={() => handleSort('status')} className="cursor-pointer">
          Status {getSortIcon('status')}
        </span>

        <span>Location</span>

        <span onClick={() => handleSort('appliedDate')} className="cursor-pointer">
          Date {getSortIcon('appliedDate')}
        </span>

        <span>AI</span>
        <span className="text-right">Actions</span>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4 mt-4">

          {sortedJobs.map(job => (
            <motion.div
              key={job._id}
              onClick={() => navigate(`/jobs/${job._id}`)}
              whileHover={{ y: -2 }}
              className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition p-5 cursor-pointer"
            >
              <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_0.7fr_1fr] items-center gap-4">

                {/* ROLE + PIN */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => togglePin(e, job)}
                    className={`text-lg ${
                      job.pinned ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    {job.pinned ? '★' : '☆'}
                  </button>

                  <span className="font-semibold">{job.role}</span>
                </div>

                <div className="text-gray-500">{job.company}</div>

                <div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusUI(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                <div>{job.location || 'N/A'}</div>

                <div>{new Date(job.appliedDate).toLocaleDateString()}</div>

                <div>{job.coverLetter ? '✨' : '—'}</div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                  <Link to={`/jobs/${job._id}`} className="text-indigo-600 hover:underline">
                    View
                  </Link>

                  <button
                    onClick={(e) => handleDelete(e, job._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>

              </div>
            </motion.div>
          ))}

        </div>
      )}
    </div>
  )
}