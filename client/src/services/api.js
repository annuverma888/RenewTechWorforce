import axios from 'axios';

// Environment-based API base URL configuration (VITE_API_URL for production e.g. Render, fallback to /api for dev proxy)
const rawApiUrl = import.meta.env.VITE_API_URL;

const getBaseURL = () => {
  if (!rawApiUrl) {
    return '/api';
  }
  const trimmed = rawApiUrl.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('renewtech_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('renewtech_token');
      // localStorage.removeItem('renewtech_user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleAuth: (data) => api.post('/auth/google', data),
  selectRole: (data) => api.post('/auth/select-role', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

export const technicianAPI = {
  getAll: (params) => api.get('/technicians', { params }),
  getById: (id) => api.get(`/technicians/${id}`),
  updateProfile: (data) => api.put('/technicians/profile', data),
  updateAvailability: (availability) => api.put('/technicians/availability', { availability }),
  getSkills: (id) => api.get(`/technicians/${id}/skills`),
  getMyCertificates: () => api.get('/technicians/my-certificates'),
  uploadCertificate: (data) => api.post('/technicians/certificates', data),
  getDigitalPassport: (id) => api.get(`/technicians/${id}/passport`),
};

export const assessmentAPI = {
  getAll: (params) => api.get('/assessments', { params }),
  getById: (id) => api.get(`/assessments/${id}`),
  submit: (data) => api.post('/assessments/submit', data),
  getMyResults: () => api.get('/assessments/my-results'),
};

export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const matchingAPI = {
  matchForProject: (projectId) => api.get(`/matching/project/${projectId}`),
  getRecommendedForTechnician: () => api.get('/matching/technician/recommended'),
};

export const applicationAPI = {
  apply: (data) => api.post('/applications', data),
  getAll: (params) => api.get('/applications', { params }),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
};

export const workforceAPI = {
  assign: (data) => api.post('/workforce', data),
  getAll: (params) => api.get('/workforce', { params }),
  getByProject: (projectId) => api.get(`/workforce/project/${projectId}`),
  updateAssignment: (id, data) => api.put(`/workforce/${id}`, data),
  updateProgress: (projectId, data) => api.put(`/workforce/project/${projectId}/progress`, data),
};

export const reviewAPI = {
  submit: (data) => api.post('/reviews', data),
  getByTechnician: (technicianId) => api.get(`/reviews/${technicianId}`),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const adminAPI = {
  getStatistics: () => api.get('/admin/statistics'),
  getAnalytics: () => api.get('/admin/analytics'),
  getTechnicians: () => api.get('/admin/technicians'),
  getCompanies: () => api.get('/admin/companies'),
  toggleUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  getCertificates: (params) => api.get('/admin/certificates', { params }),
  verifyCertificate: (id, data) => api.put(`/admin/certificates/${id}/verify`, data),
};

export default api;
