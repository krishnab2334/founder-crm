import axios from 'axios';

const API_BASE_URL = 'https://founder-crm-1.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Contacts API
export const contactsAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  addInteraction: (contactId, data) => 
    api.post(`/contacts/${contactId}/interactions`, data)
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getMyTasks: (params) => api.get('/tasks/my-tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`)
};

// Deals API
export const dealsAPI = {
  getAll: (params) => api.get('/deals', { params }),
  getPipeline: () => api.get('/deals/pipeline'),
  getById: (id) => api.get(`/deals/${id}`),
  create: (data) => api.post('/deals', data),
  update: (id, data) => api.put(`/deals/${id}`, data),
  updateStage: (id, stage) => 
    api.patch(`/deals/${id}/stage`, { stage }),
  delete: (id) => api.delete(`/deals/${id}`)
};

// Dashboard API
export const dashboardAPI = {
  getFounderDashboard: () => api.get('/dashboard/founder'),
  getTeamMemberDashboard: () => api.get('/dashboard/team-member'),
  getActivityLogs: (params) => api.get('/dashboard/activity', { params })
};

// AI API
export const aiAPI = {
  analyzeNote: (data) => api.post('/ai/analyze-note', data),
  prioritizeTasks: () => api.post('/ai/prioritize-tasks'),
  generateEmail: (data) => api.post('/ai/generate-email', data),
  categorizeContact: (data) => api.post('/ai/categorize-contact', data),
  summarizeNotes: (data) => api.post('/ai/summarize-notes', data),
  predictDeal: (dealId) => api.get(`/ai/predict-deal/${dealId}`),
  getSuggestions: (params) => api.get('/ai/suggestions', { params }),
  markApplied: (id) => api.patch(`/ai/suggestions/${id}/applied`)
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }
      
      // Use the configured api instance
      const response = await api.post('/auth/login', {
        email: credentials.email.trim(),
        password: credentials.password
      });
      
      return response;
    } catch (error) {
      if (error.response) {
        // Server responded with error
        const message = error.response.data.message || 'Login failed';
        console.error('Login error details:', {
          status: error.response.status,
          data: error.response.data
        });
        throw new Error(message);
      } else if (error.request) {
        // Request made but no response
        console.error('No response from server:', error.request);
        throw new Error('Unable to connect to server');
      } else {
        // Request setup error
        console.error('Request setup error:', error.message);
        throw error;
      }
    }
  },
  
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  register: async (userData) => {
    return await api.post('/auth/register', userData);
  }
};

export default {
  contacts: contactsAPI,
  tasks: tasksAPI,
  deals: dealsAPI,
  dashboard: dashboardAPI,
  ai: aiAPI,
  auth: authAPI
};
