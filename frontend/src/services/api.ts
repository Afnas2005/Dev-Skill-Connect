import axios, { type InternalAxiosRequestConfig } from "axios";

const getDefaultApiBaseUrl = () => {
    if (typeof window !== "undefined") {
        const { protocol, hostname } = window.location;
        return `${protocol}//${hostname}:5001`;
    }

    return "http://localhost:5001";
};

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.trim() || getDefaultApiBaseUrl();

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const client = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data || error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return error;
};

const shouldSkipRefresh = (url?: string) =>
    !url ||
    url.includes("/auth/login") ||
    url.includes("/auth/google") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout");

const ensureRefreshedSession = async () => {
    if (!refreshPromise) {
        refreshPromise = client
            .post("/auth/refresh")
            .then(() => undefined)
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;
        const status = error.response?.status;

        if (
            status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !shouldSkipRefresh(originalRequest.url)
        ) {
            originalRequest._retry = true;

            try {
                await ensureRefreshedSession();
                const retryResponse = await client(originalRequest);
                return retryResponse;
            } catch (refreshError: unknown) {
                return Promise.reject(getErrorMessage(refreshError));
            }
        }

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

export { client };
export default api;
