import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    timeout: 60000, // 60 seconds (Wait for Render cold start)
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
