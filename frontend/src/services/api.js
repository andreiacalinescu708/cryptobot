import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Strategii API
export const strategiesApi = {
  getAvailable: () => api.get('/strategies/available'),
  getInfo: (strategyId) => api.get(`/strategies/${strategyId}/info`),
  testStrategy: (strategyId, data) => api.post(`/strategies/${strategyId}/test`, data),
}

export default api
