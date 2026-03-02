import axios from 'axios';

const api = axios.create({
    baseURL: process.env.VITE_API_URL || 'http://localhost:8001/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const userData = localStorage.getItem('finanza_user');
    if (userData) {
        const { token } = JSON.parse(userData);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
