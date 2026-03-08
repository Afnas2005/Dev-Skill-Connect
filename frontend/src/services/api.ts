import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const client = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.data) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error.message);
    }
);

const api = {
    get: async <T>(url: string, config?: object) => {
        const response = await client.get<T>(url, config);
        return response.data;
    },
    post: async <T>(url: string, body?: unknown, config?: object) => {
        const response = await client.post<T>(url, body, config);
        return response.data;
    },
    put: async <T>(url: string, body?: unknown, config?: object) => {
        const response = await client.put<T>(url, body, config);
        return response.data;
    },
    patch: async <T>(url: string, body?: unknown, config?: object) => {
        const response = await client.patch<T>(url, body, config);
        return response.data;
    },
    delete: async <T>(url: string, config?: object) => {
        const response = await client.delete<T>(url, config);
        return response.data;
    },
};

export default api;
