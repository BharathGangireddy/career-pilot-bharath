import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const useAI = () => {
  const [streaming, setStreaming] = useState(false)
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)

  const stream = async (endpoint, jobId) => {
    setStreaming(true)
    setText('')
    setDone(false)

    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE}/ai/${endpoint}/${jobId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      setStreaming(false)
      throw new Error('AI request failed')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done: readerDone } = await reader.read()
      if (readerDone) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const parsed = JSON.parse(line.slice(6))
          if (parsed.done) {
            setDone(true)
          } else if (parsed.text) {
            setText(prev => prev + parsed.text)
          }
        } catch {}
      }
    }

    setStreaming(false)
  }

  const reset = () => { setText(''); setDone(false) }

  return { stream, streaming, text, done, reset }
}

export default useAI
