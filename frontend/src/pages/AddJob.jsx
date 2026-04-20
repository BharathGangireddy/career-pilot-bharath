// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '../utils/api'
// import { getSocket } from '../utils/socket'

// export default function AddJob() {
//   const navigate = useNavigate()

//   const [form, setForm] = useState({
//     company: '',
//     role: '',
//     status: 'applied',
//     jobDescription: ''
//   })

//   const [loading, setLoading] = useState(false)

//   // 🔥 Handle input change
//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value
//     })
//   }

//   // 🔥 Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     try {
//       setLoading(true)

//       const { data } = await api.post('/jobs', form)

//       // ⚡ REAL-TIME EMIT
//       const socket = getSocket()
//       socket?.emit('jobAdded', data)

//       console.log('⚡ Job emitted to socket')

//       navigate('/dashboard')

//     } catch (err) {
//       console.error('❌ Job creation failed:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="max-w-2xl mx-auto p-6">

//       <h1 className="text-2xl font-semibold mb-6">
//         Add New Job
//       </h1>

//       <form onSubmit={handleSubmit} className="card p-6 space-y-5">

//         {/* Company */}
//         <div>
//           <label className="label">Company</label>
//           <input
//             type="text"
//             name="company"
//             value={form.company}
//             onChange={handleChange}
//             className="input"
//             placeholder="Google, Amazon..."
//             required
//           />
//         </div>

//         {/* Role */}
//         <div>
//           <label className="label">Role</label>
//           <input
//             type="text"
//             name="role"
//             value={form.role}
//             onChange={handleChange}
//             className="input"
//             placeholder="Frontend Developer"
//             required
//           />
//         </div>

//         {/* Status */}
//         <div>
//           <label className="label">Status</label>
//           <select
//             name="status"
//             value={form.status}
//             onChange={handleChange}
//             className="input"
//           >
//             <option value="wishlist">Wishlist</option>
//             <option value="applied">Applied</option>
//             <option value="interview">Interview</option>
//             <option value="offer">Offer</option>
//             <option value="rejected">Rejected</option>
//           </select>
//         </div>

//         {/* Description */}
//         <div>
//           <label className="label">Job Description</label>
//           <textarea
//             name="jobDescription"
//             value={form.jobDescription}
//             onChange={handleChange}
//             className="input"
//             rows="4"
//             placeholder="Paste job description..."
//           />
//         </div>

//         {/* Button */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="btn-primary w-full"
//         >
//           {loading ? 'Adding...' : 'Add Job'}
//         </button>
//       </form>
//     </div>
//   )
// }

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { getSocket } from '../utils/socket'

export default function AddJob() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    company: '',
    role: '',
    status: 'applied',
    jobDescription: ''
  })

  const [loading, setLoading] = useState(false)

  // ✨ NEW STATES
  const [jobId, setJobId] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // 🔥 Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // 🔥 Submit form (create job first)
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const { data } = await api.post('/jobs', form)

      // ⚡ socket
      const socket = getSocket()
      socket?.emit('jobAdded', data)

      // ✅ SAVE jobId for AI
      setJobId(data._id)

      console.log('✅ Job created:', data._id)

    } catch (err) {
      console.error('❌ Job creation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✨ AI GENERATE
  const handleGenerate = async () => {
    if (!jobId) {
      return alert("Create job first")
    }

    try {
      setAiLoading(true)

      const { data } = await api.post(`/ai/cover-letter/${jobId}`)

      setCoverLetter(data.text)

    } catch (err) {
      console.error('❌ AI failed:', err)
      alert("AI failed")
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">

      <h1 className="text-2xl font-semibold mb-6">
        Add New Job
      </h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">

        {/* Company */}
        <div>
          <label className="label">Company</label>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        {/* Role */}
        <div>
          <label className="label">Role</label>
          <input
            type="text"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        {/* Status */}
        <div>
          <label className="label">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input"
          >
            <option value="wishlist">Wishlist</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="label">Job Description</label>
          <textarea
            name="jobDescription"
            value={form.jobDescription}
            onChange={handleChange}
            className="input"
            rows="4"
          />
        </div>

        {/* CREATE JOB BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Adding...' : 'Add Job'}
        </button>
      </form>

      {/* ✨ AI BOX (appears AFTER job created) */}
      {jobId && (
        <div className="card p-6 mt-6 space-y-4">
          <h2 className="font-semibold">
            ✨ AI Cover Letter Generator
          </h2>

          <button
            onClick={handleGenerate}
            className="btn-primary"
          >
            {aiLoading ? 'Generating...' : 'Generate Cover Letter'}
          </button>

          {coverLetter && (
            <textarea
              value={coverLetter}
              readOnly
              className="input h-40"
            />
          )}

          {coverLetter && (
            <button
              onClick={() => navigator.clipboard.writeText(coverLetter)}
              className="text-sm text-indigo-600"
            >
              Copy
            </button>
          )}
        </div>
      )}

    </div>
  )
}