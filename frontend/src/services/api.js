import axios from 'axios';

// Create a centralized Axios instance
const api = axios.create({
    baseURL: 'https://tsec-hacks26-ar9u.onrender.com/api', // Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Interceptor to attach Supabase Token to every request
api.interceptors.request.use(async (config) => {
    // We will implement token attachment here later if needed
    // const { data } = await supabase.auth.getSession();
    // if (data.session) {
    //     config.headers.Authorization = `Bearer ${data.session.access_token}`;
    // }
    return config;
});

export default api;
