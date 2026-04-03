import axios, { type InternalAxiosRequestConfig } from "axios";

const getDefaultApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5001`;
  }

  return "http://localhost:5001";
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || getDefaultApiBaseUrl();

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api = axios.create({
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
    refreshPromise = api
      .post("/auth/refresh")
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.response.use(
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
        return await api(originalRequest);
      } catch (refreshError: unknown) {
        return Promise.reject(getErrorMessage(refreshError));
      }
    }

    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error.message || error);
  }
);
