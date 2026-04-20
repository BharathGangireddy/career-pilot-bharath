import { create } from 'zustand'
import api from '../utils/api'

const useJobStore = create((set, get) => ({
  jobs: [],
  currentJob: null,
  stats: null,
  loading: false,
  error: null,

  fetchJobs: async (filters = {}) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams(filters).toString()
      const { data } = await api.get(`/jobs?${params}`)
      set({ jobs: data, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch jobs', loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get('/jobs/stats')
      set({ stats: data })
    } catch (err) {
      console.error(err)
    }
  },

  fetchJob: async (id) => {
    set({ loading: true })
    try {
      const { data } = await api.get(`/jobs/${id}`)
      set({ currentJob: data, loading: false })
      return data
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false })
    }
  },

  createJob: async (jobData) => {
    try {
      const { data } = await api.post('/jobs', jobData)
      set({ jobs: [data, ...get().jobs] })
      return data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create job')
    }
  },

  updateJob: async (id, updates) => {
    try {
      const { data } = await api.put(`/jobs/${id}`, updates)
      set({
        jobs: get().jobs.map(j => j._id === id ? data : j),
        currentJob: get().currentJob?._id === id ? data : get().currentJob
      })
      return data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update job')
    }
  },

  deleteJob: async (id) => {
    try {
      await api.delete(`/jobs/${id}`)
      set({ jobs: get().jobs.filter(j => j._id !== id) })
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete job')
    }
  },

  addNote: async (id, text) => {
    try {
      const { data } = await api.post(`/jobs/${id}/notes`, { text })
      set({
        jobs: get().jobs.map(j => j._id === id ? data : j),
        currentJob: get().currentJob?._id === id ? data : get().currentJob
      })
      return data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add note')
    }
  },

  updateJobField: (id, field, value) => {
    set({
      currentJob: get().currentJob?._id === id
        ? { ...get().currentJob, [field]: value }
        : get().currentJob
    })
  },

  clearCurrent: () => set({ currentJob: null })
}))

export default useJobStore
