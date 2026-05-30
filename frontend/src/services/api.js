import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cmp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cmp_token');
      localStorage.removeItem('cmp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Projects
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  toggleFavorite: (id) => api.patch(`/projects/${id}/favorite`),
  archive: (id) => api.patch(`/projects/${id}/archive`),
};

// Snippets
export const snippetsAPI = {
  getAll: (params) => api.get('/snippets', { params }),
  getOne: (id) => api.get(`/snippets/${id}`),
  create: (data) => api.post('/snippets', data),
  update: (id, data) => api.put(`/snippets/${id}`, data),
  delete: (id) => api.delete(`/snippets/${id}`),
  toggleFavorite: (id) => api.patch(`/snippets/${id}/favorite`),
  trackCopy: (id) => api.patch(`/snippets/${id}/copy`),
  getVersions: (id) => api.get(`/snippets/${id}/versions`),
  restoreVersion: (id, version) => api.post(`/snippets/${id}/restore/${version}`),
};

// Notes
export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getOne: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  toggleFavorite: (id) => api.patch(`/notes/${id}/favorite`),
};

// Stats
export const statsAPI = {
  getDashboard: () => api.get('/stats'),
};

// Search
export const searchAPI = {
  global: (params) => api.get('/search', { params }),
};

// Activity
export const activityAPI = {
  getAll: (params) => api.get('/activity', { params }),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/password', data),
};
