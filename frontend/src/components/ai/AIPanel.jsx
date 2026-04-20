import { useState } from 'react'
import useAI from '../../hooks/useAI'
import useJobStore from '../../store/jobStore'
import toast from 'react-hot-toast'

const FEATURES = [
  { key: 'cover-letter', label: 'Cover letter', icon: '✍️', desc: 'AI writes a tailored cover letter for this role' },
  { key: 'resume-tips', label: 'Resume tips', icon: '📄', desc: 'Get specific tips to tailor your resume' },
  { key: 'interview-questions', label: 'Interview prep', icon: '🎯', desc: 'Likely questions + how to answer them' }
]

const FIELD_MAP = {
  'cover-letter': 'coverLetter',
  'resume-tips': 'resumeTips',
  'interview-questions': 'interviewQuestions'
}

export default function AIPanel({ job }) {
  const [activeTab, setActiveTab] = useState('cover-letter')
  const { stream, streaming, text, done, reset } = useAI()
  const { updateJobField } = useJobStore()

  const savedContent = job[FIELD_MAP[activeTab]]

  const handleGenerate = async () => {
    reset()
    try {
      await stream(activeTab, job._id)
      updateJobField(job._id, FIELD_MAP[activeTab], text)
    } catch {
      toast.error('AI generation failed. Check your OpenAI API key.')
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    reset()
  }

  const displayText = streaming || done ? text : savedContent

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl">🤖</span>
        <h2 className="font-semibold">AI Assistant</h2>
        <span className="text-xs bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">Powered by GPT-4o</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {FEATURES.map(f => (
          <button key={f.key} onClick={() => handleTabChange(f.key)}
            className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors ${
              activeTab === f.key
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-4">
        {FEATURES.find(f => f.key === activeTab)?.desc}
      </p>

      {/* Requirement check */}
      {!job.jobDescription && activeTab !== 'interview-questions' && (
        <div className="text-xs bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-3 py-2 rounded-lg mb-4">
          💡 Add a job description to get better AI results
        </div>
      )}

      {/* Generate button */}
      <button onClick={handleGenerate} disabled={streaming}
        className="btn-primary w-full mb-4 flex items-center justify-center gap-2">
        {streaming ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          `Generate ${FEATURES.find(f => f.key === activeTab)?.label}`
        )}
      </button>

      {/* Output */}
      {displayText && (
        <div className="relative">
          <div className="text-xs font-medium text-gray-500 mb-2 flex items-center justify-between">
            <span>{done || savedContent ? 'Generated output' : 'Generating...'}</span>
            {(done || (!streaming && savedContent)) && (
              <button onClick={() => { navigator.clipboard.writeText(displayText); toast.success('Copied!') }}
                className="text-brand-600 hover:underline">
                Copy
              </button>
            )}
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm streaming-text text-gray-700 dark:text-gray-300 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700">
            {displayText}
            {streaming && <span className="inline-block w-1 h-4 bg-brand-600 animate-pulse ml-0.5 align-middle" />}
          </div>
        </div>
      )}
    </div>
  )
}
