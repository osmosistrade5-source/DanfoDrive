import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('danfodrive_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('danfodrive_token');
      localStorage.removeItem('danfodrive_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
