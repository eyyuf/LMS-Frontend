import axios from 'axios';

const api = axios.create({
    //baseURL: 'https://fm-bls.onrender.com/api',
    baseURL: 'http://localhost:4000/api',
    //baseURL: 'https://fm-bls-1.onrender.com/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
