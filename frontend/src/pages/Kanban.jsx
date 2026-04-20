import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import useJobStore from '../store/jobStore'
import { STATUS_CONFIG, STATUSES } from '../utils/status'
import { getSocket } from '../utils/socket'
import toast from 'react-hot-toast'

// 🔥 Job Card
function JobCard({ job }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job._id })

const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.4 : 1,
  zIndex: isDragging ? 1000 : 'auto'
}

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.97 }}
      className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
      border border-gray-200/60 dark:border-gray-700/60
      rounded-xl p-3 cursor-grab active:cursor-grabbing
      shadow-sm hover:shadow-xl hover:ring-2 hover:ring-indigo-400
      transition-all duration-300"
    >
      <div className="absolute top-0 left-0 w-full h-1 
        bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl" />

      <p className="font-medium text-sm">{job.role}</p>
      <p className="text-xs text-gray-500">{job.company}</p>

      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>{new Date(job.appliedDate).toLocaleDateString()}</span>
        <Link to={`/jobs/${job._id}`} className="opacity-0 group-hover:opacity-100 text-indigo-600">
          View →
        </Link>
      </div>
    </motion.div>
  )
}

// 🔥 Column
function Column({ status, jobs, activeJob }) {
  const cfg = STATUS_CONFIG[status]
  const { setNodeRef } = useSortable({ id: status })

  const isActive = activeJob !== null

  return (
    <motion.div ref={setNodeRef} className="flex flex-col min-w-[260px] flex-1">

      <div className="flex justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className="font-semibold text-sm">{cfg.label}</span>
        </div>

        <span className="text-xs bg-gray-200 dark:bg-gray-800 px-2 rounded">
          {jobs.length}
        </span>
      </div>

      <div className={`rounded-2xl p-3 flex-1 min-h-[420px] transition-all
        ${isActive
          ? 'border-indigo-400 shadow-lg scale-[1.02]'
          : 'border-gray-200/60 dark:border-gray-700/60'}
        border bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg`}>

        <SortableContext items={jobs.map(j => j._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {jobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </SortableContext>

        {jobs.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-8 animate-pulse">
            Drop here
          </p>
        )}
      </div>
    </motion.div>
  )
}

// 🔥 MAIN
export default function Kanban() {
  const { jobs, fetchJobs, updateJob } = useJobStore()

  const [activeJob, setActiveJob] = useState(null)
  const [notify, setNotify] = useState('')
  const [activities, setActivities] = useState([])

  const socket = getSocket()

  useEffect(() => {
    fetchJobs()

    socket?.on('jobUpdated', () => {
      fetchJobs()
    })

    return () => socket?.off('jobUpdated')
  }, [])

  const sensors = useSensors(useSensor(PointerSensor))

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = jobs.filter(j => j.status === s)
    return acc
  }, {})

  const handleDragStart = ({ active }) => {
    setActiveJob(jobs.find(j => j._id === active.id))
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveJob(null)
    if (!over) return

    const targetStatus =
      STATUSES.find(s => s === over.id) ||
      jobs.find(j => j._id === over.id)?.status

    const job = jobs.find(j => j._id === active.id)
    if (!job || job.status === targetStatus) return

    try {
      await updateJob(active.id, { status: targetStatus })

      // 🔥 REALTIME
      // socket?.emit('jobUpdated', { ...job, status: targetStatus })

      // 🔔 Notification
      setNotify(`Moved to ${STATUS_CONFIG[targetStatus].label}`)
      setTimeout(() => setNotify(''), 2000)

      // 🟢 Activity
      setActivities(prev => [
        {
          text: `${job.role} → ${STATUS_CONFIG[targetStatus].label}`,
          time: 'now'
        },
        ...prev.slice(0, 5)
      ])

      toast.success('Updated')
    } catch {
      toast.error('Error')
    }
  }

  return (
    <div className="max-w-full px-4 py-8">

      {/* 🔔 Notification */}
      {notify && (
        <div className="fixed top-5 right-5 bg-white dark:bg-gray-900 shadow-lg px-4 py-2 rounded-lg z-50 animate-bounce">
          {notify}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Kanban board</h1>
          <p className="text-gray-500 text-sm">Drag cards to update status</p>
        </div>

        <Link to="/jobs/new" className="btn-primary text-sm">
          + Add job
        </Link>
      </div>

      {/* Board */}
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-5 min-w-max">
            {STATUSES.map(s => (
              <Column key={s} status={s} jobs={grouped[s]} activeJob={activeJob} />
            ))}
          </div>

          {/* 🔥 Drag Overlay */}
          <DragOverlay>
            {activeJob && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="bg-white dark:bg-gray-900 border border-indigo-400
                rounded-xl p-3 shadow-2xl"
              >
                <p className="font-medium text-sm">{activeJob.role}</p>
                <p className="text-xs text-gray-500">{activeJob.company}</p>
              </motion.div>
            )}
          </DragOverlay>

        </DndContext>
      </div>

      {/* 🟢 Activity Feed */}
      <div className="mt-10 card p-5 max-w-md">
        <h3 className="font-semibold mb-3">Live Activity</h3>

        <div className="space-y-2 text-sm">
          {activities.map((a, i) => (
            <div key={i} className="flex justify-between">
              <span>{a.text}</span>
              <span className="text-gray-400 text-xs">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}