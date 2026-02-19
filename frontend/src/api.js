import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    timeout: 60000, // 60 seconds (Wait for Render cold start)
    headers: {
        'Content-Type': 'application/json',
    },
});

const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Request interceptor to serve from cache
api.interceptors.request.use((config) => {
    // Only fetch from cache if it's a GET request
    if (config.method === 'get') {
        const cached = cache[config.url];
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            // Inject an adapter to return cached data without hitting the network
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

// Response interceptor to store in cache or invalidate
api.interceptors.response.use((response) => {
    const { config } = response;

    if (config.method === 'get' && !response.statusText?.includes('from cache')) {
        // Store the fresh data in cache
        cache[config.url] = {
            data: response.data,
            timestamp: Date.now()
        };
    } else if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
        // Invalidate the entire cache if data is modified
        Object.keys(cache).forEach(key => delete cache[key]);
    }

    return response;
}, (error) => {
    return Promise.reject(error);
});

export default api;
