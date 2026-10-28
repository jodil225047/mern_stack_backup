import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', headers: { 'Content-Type': 'application/json' } });
export const errorMessage = (error) => error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
export const applicationsApi = {
  list: (params = {}) => api.get('/applications', { params }).then(r => r.data.data),
  get: (id) => api.get(`/applications/${encodeURIComponent(id)}`).then(r => r.data.data),
  create: (body) => api.post('/applications', body).then(r => r.data.data),
  update: (id, body) => api.put(`/applications/${encodeURIComponent(id)}`, body).then(r => r.data.data),
  changeStatus: (id, status) => api.patch(`/applications/${encodeURIComponent(id)}/status`, { status }).then(r => r.data.data),
  remove: (id) => api.delete(`/applications/${encodeURIComponent(id)}`).then(r => r.data.data),
  summary: () => api.get('/analytics/summary').then(r => r.data.data),
  health: () => api.get('/health').then(r => r.data.data)
};
export default api;
