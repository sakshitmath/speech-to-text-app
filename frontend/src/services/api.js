import axios from 'axios'

const API_BASE_URL = 'http://localhost:8081/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatically add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth APIs
export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)

// Speech APIs
export const transcribeAudio = (formData) => api.post('/speech/transcribe', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const getHistory = () => api.get('/speech/history')
export const getTranscriptionById = (id) => api.get(`/speech/${id}`)

export default api