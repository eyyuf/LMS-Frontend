import axios from 'axios';

const api = axios.create({
    baseURL: 'https://fm-bls.onrender.com/api',
    //baseURL: 'http://localhost:4000/api',
    withCredentials: true, // Important for HttpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
