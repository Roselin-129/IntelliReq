import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('intellireq_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalise error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Unable to connect to the backend. Make sure the server is running.'));
    }

    const status = error.response.status as number;
    const data = error.response.data;

    let message: string;

    switch (status) {
      case 401:
        message = data?.message ?? 'Unauthorized access or expired session.';
        localStorage.removeItem('intellireq_token');
        break;
      case 400:
        message = data?.message ?? data ?? 'Invalid request.';
        break;
      case 404:
        message = data?.message ?? 'Resource not found.';
        break;
      case 422:
        message = data?.message ?? 'Validation error.';
        break;
      case 500:
        message = 'An internal server error occurred.';
        break;
      case 502:
        message = data?.error ?? 'The AI service is unavailable. Make sure FastAPI is running.';
        break;
      default:
        message = data?.message ?? `Unexpected error (${status}).`;
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
