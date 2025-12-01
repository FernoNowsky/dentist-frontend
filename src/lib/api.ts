import axios, { type AxiosRequestConfig } from 'axios';
import { User } from 'oidc-client-ts';

const API_URL = 'http://localhost:3000';

const $axios = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
$axios.interceptors.request.use(
    (config) => {
        // Check if the request requires auth (default true, but can be overridden via headers or config)

        const requiresAuth = config.headers['X-Requires-Auth'] !== 'false';

        if (requiresAuth) {
            const oidcStorage = sessionStorage.getItem(`oidc.user:http://localhost:5000/realms/dentist:dentist-frontend`);
            if (oidcStorage) {
                const user = User.fromStorageString(oidcStorage);
                if (user && user.access_token) {
                    config.headers.Authorization = `Bearer ${user.access_token}`;
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

interface ApiRequestOptions {
    params?: Record<string, any>;
    method?: "get" | "post" | "put" | "delete" | "patch";
    data?: any;
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
}

export async function apiRequest<T = unknown>(
    path: string,
    { params = {}, method = "get", data, requiresAuth = true, requiresAdmin = false, responseType = 'json' }: ApiRequestOptions = {}
): Promise<T> {
    const baseUrl = API_URL;

    const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const config: AxiosRequestConfig = {
        url,
        method,
        params,
        data,
        responseType,
        headers: {
            ...($axios.defaults.headers.common),
            'X-Requires-Auth': requiresAuth.toString(),
            'X-Requires-Admin': requiresAdmin.toString()
        }
    };

    const response = await $axios.request<T>(config);
    return response.data;
}
