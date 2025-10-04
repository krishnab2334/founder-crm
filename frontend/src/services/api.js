import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL.replace('/api', '');
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Contacts API
export const contactsAPI = {
  getAll: (params) => axios.get(`${API_BASE_URL}/contacts`, { params }),
  getById: (id) => axios.get(`${API_BASE_URL}/contacts/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/contacts`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/contacts/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/contacts/${id}`),
  addInteraction: (contactId, data) => 
    axios.post(`${API_BASE_URL}/contacts/${contactId}/interactions`, data)
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => axios.get(`${API_BASE_URL}/tasks`, { params }),
  getMyTasks: (params) => axios.get(`${API_BASE_URL}/tasks/my-tasks`, { params }),
  getById: (id) => axios.get(`${API_BASE_URL}/tasks/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/tasks`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/tasks/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/tasks/${id}`)
};

// Deals API
export const dealsAPI = {
  getAll: (params) => axios.get(`${API_BASE_URL}/deals`, { params }),
  getPipeline: () => axios.get(`${API_BASE_URL}/deals/pipeline`),
  getById: (id) => axios.get(`${API_BASE_URL}/deals/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/deals`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/deals/${id}`, data),
  updateStage: (id, stage) => 
    axios.patch(`${API_BASE_URL}/deals/${id}/stage`, { stage }),
  delete: (id) => axios.delete(`${API_BASE_URL}/deals/${id}`)
};

// Dashboard API
export const dashboardAPI = {
  getFounderDashboard: () => axios.get(`${API_BASE_URL}/dashboard/founder`),
  getTeamMemberDashboard: () => axios.get(`${API_BASE_URL}/dashboard/team-member`),
  getActivityLogs: (params) => axios.get(`${API_BASE_URL}/dashboard/activity`, { params })
};

// AI API
export const aiAPI = {
  analyzeNote: (data) => axios.post(`${API_BASE_URL}/ai/analyze-note`, data),
  prioritizeTasks: () => axios.post(`${API_BASE_URL}/ai/prioritize-tasks`),
  generateEmail: (data) => axios.post(`${API_BASE_URL}/ai/generate-email`, data),
  categorizeContact: (data) => axios.post(`${API_BASE_URL}/ai/categorize-contact`, data),
  summarizeNotes: (data) => axios.post(`${API_BASE_URL}/ai/summarize-notes`, data),
  predictDeal: (dealId) => axios.get(`${API_BASE_URL}/ai/predict-deal/${dealId}`),
  getSuggestions: (params) => axios.get(`${API_BASE_URL}/ai/suggestions`, { params }),
  markApplied: (id) => axios.patch(`${API_BASE_URL}/ai/suggestions/${id}/applied`),
  beautifyTaskStatus: (data) => axios.post(`${API_BASE_URL}/ai/beautify-task-status`, data),
  getTaskStatusSuggestions: (taskId) => axios.get(`${API_BASE_URL}/ai/task-status-suggestions/${taskId}`)
};

// Auth API
export const authAPI = {
  login: (data) => axios.post(`${API_BASE_URL}/auth/login`, data),
  register: (data) => axios.post(`${API_BASE_URL}/auth/register`, data),
  registerTeamMember: (data) => axios.post(`${API_BASE_URL}/auth/register-team-member`, data),
  getMe: () => axios.get(`${API_BASE_URL}/auth/me`),
  inviteTeamMember: (data) => axios.post(`${API_BASE_URL}/auth/invite`, data),
  acceptInvitation: (data) => axios.post(`${API_BASE_URL}/auth/accept-invitation`, data)
};

export default {
  contacts: contactsAPI,
  tasks: tasksAPI,
  deals: dealsAPI,
  dashboard: dashboardAPI,
  ai: aiAPI,
  auth: authAPI
};
