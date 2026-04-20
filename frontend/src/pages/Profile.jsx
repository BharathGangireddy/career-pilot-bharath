import { useState, useEffect, useRef } from 'react'
import useAuthStore from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateResume } = useAuthStore()

  const [resume, setResume] = useState('')
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const [score, setScore] = useState(null)
  const [skills, setSkills] = useState([])
  const [suggestions, setSuggestions] = useState([])

  const debounceRef = useRef(null)

  // Load resume
  useEffect(() => {
    setResume(user?.resumeText || '')
  }, [user])

  // 🔥 AUTO SAVE
  useEffect(() => {
    if (!resume) return

    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        setSaving(true)
        await updateResume(resume)

        setJustSaved(true)
        setTimeout(() => setJustSaved(false), 2000)

        generateInsights(resume)
      } catch {
        toast.error('Auto-save failed')
      } finally {
        setSaving(false)
      }
    }, 1000)

    return () => clearTimeout(debounceRef.current)
  }, [resume])

  // 🧠 SMART AI INSIGHTS
  const generateInsights = (text) => {
    if (!text) return

    const lower = text.toLowerCase()

    const SKILLS_DB = [
      'react', 'node', 'express', 'mongodb', 'mysql', 'postgresql',
      'javascript', 'typescript', 'python', 'java', 'c++',
      'html', 'css', 'tailwind', 'bootstrap',
      'aws', 'docker', 'kubernetes',
      'git', 'github',
      'rest', 'api', 'redux',
      'next.js', 'vite',
      'sql', 'excel', 'power bi'
    ]

    const detected = SKILLS_DB.filter(skill =>
      lower.includes(skill)
    )

    const formattedSkills = [...new Set(detected)].map(s =>
      s.charAt(0).toUpperCase() + s.slice(1)
    )

    setSkills(formattedSkills)

    // 📊 Score logic
    let scoreValue = 0
    scoreValue += Math.min(40, text.length / 50)
    scoreValue += formattedSkills.length * 5

    if (lower.includes('experience')) scoreValue += 10
    if (lower.includes('project')) scoreValue += 10
    if (lower.includes('%')) scoreValue += 10

    setScore(Math.min(100, Math.floor(scoreValue)))

    // 💡 Suggestions
    const tips = []

    if (formattedSkills.length < 5)
      tips.push('Add more technical skills')

    if (!lower.includes('project'))
      tips.push('Add project section with impact')

    if (!lower.includes('experience'))
      tips.push('Include work experience')

    if (!lower.includes('%'))
      tips.push('Add measurable achievements (e.g., improved performance by 30%)')

    setSuggestions(tips)
  }

  // ✨ AI IMPROVE
  const handleImprove = async () => {
    if (!resume.trim()) {
      toast.error('Add resume first')
      return
    }

    try {
      setAiLoading(true)

      const { data } = await api.post('/ai/improve-resume', { resume })

      setResume(data.text)
      toast.success('Resume improved 🚀')

    } catch {
      toast.error('AI failed')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">

      {/* LEFT */}
      <div className="md:col-span-2">

        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        <div className="card p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Your resume</h2>

            <button
              onClick={handleImprove}
              className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={aiLoading}
            >
              {aiLoading ? 'Improving...' : '✨ Improve'}
            </button>
          </div>

          <textarea
            className="input min-h-[320px] font-mono text-sm focus:ring-2 focus:ring-indigo-500"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume here..."
          />

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 text-xs">

            <span>{resume.length} characters</span>

            {/* 🔥 Save Status */}
            <div className="flex items-center gap-2">
              {saving ? (
                <>
                  <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                  <span className="text-indigo-600">Saving...</span>
                </>
              ) : justSaved ? (
                <span className="text-green-500">Saved</span>
              ) : (
                <span className="text-gray-400">Auto-save</span>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* RIGHT AI PANEL */}
      <div className="card p-5 h-fit">

        <h3 className="font-semibold mb-4">🧠 AI Insights</h3>

        {score !== null && (
          <p className="text-sm mb-3">
            Score: <span className="font-bold">{score}/100</span>
          </p>
        )}

        {skills.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Skills</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Suggestions</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {suggestions.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

    </div>
  )
}