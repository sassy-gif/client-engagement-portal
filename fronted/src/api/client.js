import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Attach the current access token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('origami_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a request fails with 401 (expired access token), try refreshing
// it once silently, then retry the original request.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('origami_refresh_token');
      if (!refreshToken) {
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post('http://localhost:5000/api/auth/refresh', { refreshToken });
        localStorage.setItem('origami_access_token', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function redirectToLogin() {
  localStorage.removeItem('origami_access_token');
  localStorage.removeItem('origami_refresh_token');
  localStorage.removeItem('origami_user');
  window.location.href = '/login';
}

export default apiClient;