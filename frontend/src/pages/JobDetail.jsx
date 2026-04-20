import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useJobStore from '../store/jobStore'
import { STATUSES, STATUS_CONFIG } from '../utils/status'
import AIPanel from '../components/ai/AIPanel'
import toast from 'react-hot-toast'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    currentJob,
    fetchJob,
    updateJob,
    addNote,
    deleteJob,
    loading
  } = useJobStore()

  const [note, setNote] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchJob(id)
  }, [id])

  const job = currentJob

  const handleDelete = async () => {
    await deleteJob(id)
    navigate('/jobs')
  }

  if (loading || !job) {
    return <div className="p-10 text-center text-gray-400">Loading...</div>
  }

  const statusColor = {
    offer: 'bg-green-100 text-green-600',
    interview: 'bg-yellow-100 text-yellow-600',
    applied: 'bg-blue-100 text-blue-600',
    rejected: 'bg-red-100 text-red-600',
    wishlist: 'bg-gray-200 text-gray-600'
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-start mb-6">

        <div>

          {/* TITLE ROW */}
          <div className="flex items-center gap-3">

            <h1 className="text-2xl font-bold">{job.role}</h1>

            {/* STATUS */}
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[job.status]}`}>
              {job.status}
            </span>

            {/* PIN */}
            <button
              onClick={() => updateJob(id, { pinned: !job.pinned })}
              className="text-yellow-400 text-lg"
            >
              {job.pinned ? '★' : '☆'}
            </button>

          </div>

          {/* META */}
          <div className="text-sm text-gray-500 mt-1">
            {job.company} • 📍 {job.location || 'N/A'} • 💰 {job.salary || 'N/A'}
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">

          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noreferrer"
              className="icon-btn"
              title="View posting"
            >
              👁️
            </a>
          )}

          <Link to={`/jobs/${id}/edit`} className="icon-btn" title="Edit">
            ✏️
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="icon-btn text-red-500 hover:bg-red-500 hover:text-white"
            title="Delete"
          >
            🗑️
          </button>

        </div>

      </div>

      {/* 🔥 TABS (ANIMATED STYLE) */}
      <div className="flex gap-8 border-b mb-8 text-sm tracking-wide uppercase">

        {['overview', 'ai', 'notes'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 relative transition-all
              ${
                activeTab === tab
                  ? 'text-indigo-600 font-semibold'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
          >
            {tab}

            {/* Animated underline */}
            {activeTab === tab && (
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-indigo-600 rounded" />
            )}
          </button>
        ))}

      </div>

      {/* 🔥 CONTENT */}

      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* STATUS SELECTOR */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Status</h2>

            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => updateJob(id, { status: s })}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition
                    ${
                      job.status === s
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          {job.jobDescription && (
            <div className="card p-6">
              <h2 className="font-semibold mb-3">Job description</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {job.jobDescription}
              </p>
            </div>
          )}

        </div>
      )}

      {/* AI */}
      {activeTab === 'ai' && (
        <div className="card p-6">
          <AIPanel job={job} />
        </div>
      )}

      {/* NOTES */}
      {activeTab === 'notes' && (
        <div className="card p-6">

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              await addNote(id, note)
              setNote('')
            }}
            className="flex gap-2 mb-4"
          >
            <input
              className="input flex-1"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add note..."
            />

            <button className="btn-primary">Add</button>
          </form>

          {job.notes?.length > 0 ? (
            <div className="space-y-2">
              {[...job.notes].reverse().map(n => (
                <div key={n._id} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  {n.text}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No notes yet</p>
          )}

        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg shadow-lg w-80">

            <h2 className="font-semibold mb-4">Delete this job?</h2>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}