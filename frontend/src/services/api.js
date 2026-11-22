import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('notesguru_student_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for SINGLE DEVICE LOGIN detection
let sessionInvalidatedCallback = null;

export const setSessionInvalidatedCallback = (cb) => {
  sessionInvalidatedCallback = cb;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle single-device login invalidation
      if (status === 401 && data?.code === 'SESSION_INVALIDATED') {
        localStorage.removeItem('notesguru_student_token');
        localStorage.removeItem('notesguru_student_user');
        if (sessionInvalidatedCallback) {
          sessionInvalidatedCallback(data.message);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
