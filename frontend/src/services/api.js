import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'

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

// Auto logout only on auth endpoints 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)

// Speech APIs
export const transcribeAudio = (formData, language = 'auto') => 
  api.post(`/speech/transcribe?language=${language}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
export const getHistory = () => api.get('/speech/history')
export const getTranscriptionById = (id) => api.get(`/speech/${id}`)

export default api