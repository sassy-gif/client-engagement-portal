import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Attach JWT token to every outgoing request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('origami_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;