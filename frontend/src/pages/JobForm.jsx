import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useJobStore from '../store/jobStore'
import { STATUSES, STATUS_CONFIG } from '../utils/status'
import toast from 'react-hot-toast'

const EMPTY = {
  company: '', role: '', location: '', jobUrl: '', salary: '',
  status: 'applied', jobDescription: '', appliedDate: new Date().toISOString().split('T')[0]
}

export default function JobForm() {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchJob, createJob, updateJob } = useJobStore()
  const isEdit = Boolean(id)

  useEffect(() => {
    if (isEdit) {
      fetchJob(id).then(job => {
        if (job) setForm({
          ...job,
          appliedDate: new Date(job.appliedDate).toISOString().split('T')[0]
        })
      })
    }
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company || !form.role) return toast.error('Company and role are required')
    setSaving(true)
    try {
      if (isEdit) {
        await updateJob(id, form)
        toast.success('Updated!')
        navigate(`/jobs/${id}`)
      } else {
        const job = await createJob(form)
        toast.success('Application added!')
        navigate(`/jobs/${job._id}`)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit application' : 'Add new application'}</h1>
      </div>
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Company *</label>
              <input className="input" placeholder="Google" value={form.company}
                onChange={e => set('company', e.target.value)} required />
            </div>
            <div>
              <label className="label">Role *</label>
              <input className="input" placeholder="Frontend Engineer" value={form.role}
                onChange={e => set('role', e.target.value)} required />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Location</label>
              <input className="input" placeholder="Hyderabad / Remote" value={form.location}
                onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="label">Salary (optional)</label>
              <input className="input" placeholder="₹18–22 LPA" value={form.salary}
                onChange={e => set('salary', e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Applied date</label>
              <input type="date" className="input" value={form.appliedDate}
                onChange={e => set('appliedDate', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Job URL</label>
            <input className="input" placeholder="https://jobs.example.com/..." value={form.jobUrl}
              onChange={e => set('jobUrl', e.target.value)} />
          </div>

          <div>
            <label className="label">Job description</label>
            <textarea className="input min-h-[140px] resize-y" placeholder="Paste the full job description here — used by AI to generate cover letters and resume tips..."
              value={form.jobDescription} onChange={e => set('jobDescription', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add application'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
