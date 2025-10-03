import axios from 'axios';

const API_BASE_URL = '/api';

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
  markApplied: (id) => axios.patch(`${API_BASE_URL}/ai/suggestions/${id}/applied`)
};

// Auth API
export const authAPI = {
  login: (data) => axios.post(`${API_BASE_URL}/auth/login`, data),
  register: (data) => axios.post(`${API_BASE_URL}/auth/register`, data),
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
