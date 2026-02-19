import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    timeout: 60000, // 60 seconds (Wait for Render cold start)
    headers: {
        'Content-Type': 'application/json',
    },
});

const cache = {};
const CACHE_TTL = 30 * 1000; // Reduce TTL for authenticated session freshness

// Request interceptor: add token and serve from cache
api.interceptors.request.use((config) => {
    // Add token to headers
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Only fetch from cache if it's a GET request
    if (config.method === 'get') {
        const cached = cache[config.url];
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            config.adapter = () => {
                return Promise.resolve({
                    data: cached.data,
                    status: 200,
                    statusText: 'OK (from cache)',
                    headers: config.headers,
                    config: config,
                });
            };
        }
    }
    return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401 and store cache
api.interceptors.response.use((response) => {
    const { config } = response;

    if (config.method === 'get' && !response.statusText?.includes('from cache')) {
        cache[config.url] = {
            data: response.data,
            timestamp: Date.now()
        };
    } else if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
        Object.keys(cache).forEach(key => delete cache[key]);
    }

    return response;
}, (error) => {
    // If 401, token is invalid or expired
    if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

export default api;
