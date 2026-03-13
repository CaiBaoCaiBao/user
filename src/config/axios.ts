
import axios, { 
    AxiosError, 
    AxiosRequestConfig, 
    InternalAxiosRequestConfig,
    AxiosResponse 
} from "axios";
import { toast } from "sonner";

// ==================== 类型定义 ====================

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

// ==================== Token 存储 Key ====================

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// ==================== Token 服务 ====================

export const tokenService = {
    getAccessToken: () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    setAccessToken: (token: string) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    },

    removeAccessToken: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken: () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setRefreshToken: (token: string) => {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    removeRefreshToken: () => {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    // 清除所有 Token
    clearAll: () => {
        tokenService.removeAccessToken();
        tokenService.removeRefreshToken();
    }
};

// ==================== 创建 Axios 实例 ====================

export const request = axios.create({
    baseURL: process.env.NEXT_PUBLIC_URL || 'http://localhost:2001',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ==================== 刷新 Token 状态管理 ====================

let isRefreshing = false;                    // 是否正在刷新
let refreshPromise: Promise<string | null> | null = null;  // 刷新 Promise
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];                                     // 请求队列

// 处理队列
const processQueue = (token: string | null, error?: any) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token as string);
        }
    });
    failedQueue = [];
};

// ==================== 刷新 Token 接口 ====================

const refreshToken = async (): Promise<string | null> => {
    const refreshToken = tokenService.getRefreshToken();
    
    if (!refreshToken) {
        return null;
    }

    try {
        // 调用刷新接口（需根据实际后端接口调整）
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_URL || 'http://localhost:2001'}/auth/api/refresh`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            }
        );

        const { accessToken } = response.data.data;
        
        // 保存新 Token
        tokenService.setAccessToken(accessToken);
        
        return accessToken;
    } catch (error) {
        // 刷新失败，清除所有 Token
        tokenService.clearAll();
        return null;
    }
};

// ==================== 请求拦截器 ====================

request.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // 登录/注册接口不需要 token
        const noAuthUrls = ['/auth/api/login', '/auth/api/register', '/auth/api/refresh', '/file/trip-api/upload-img'];
        const url = config.url || '';
        
        if (noAuthUrls.some(u => url.includes(u))) {
            return config;
        }

        const token = tokenService.getAccessToken();
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==================== 响应拦截器 ====================

request.interceptors.response.use(
    (response: AxiosResponse) => {
        // 检查后端返回的业务状态码
        const data = response.data as any;

        // 如果后端返回 success: false，视为业务错误
        if (data && data.success === false) {
            const message = data.message || '请求失败';
            toast.error(message);
            return Promise.reject(new Error(message));
        }

        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 无响应（网络错误）
        if (!error.response) {
            toast.error('网络连接失败，请检查网络');
            return Promise.reject(error);
        }

        // 401 处理
        if (error.response.status === 401) {
            // 如果是刷新 token 请求失败
            if (originalRequest.url?.includes('/auth/api/refresh')) {
                tokenService.clearAll();
                toast.error('登录已过期，请重新登录');
                // 跳转登录页
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            // 防止重复刷新
            if (isRefreshing) {
                // 将请求加入队列，等待刷新完成后重发
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return request(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            // 开始刷新
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshToken();

                if (newToken) {
                    processQueue(newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return request(originalRequest);
                } else {
                    processQueue(null, error);
                    toast.error('登录已过期，请重新登录');
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(error);
                }
            } catch (err) {
                processQueue(null, err);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // 其他错误统一处理
        const responseData = error.response.data as any;
        const message = responseData?.message || '请求失败';
        toast.error(message);

        return Promise.reject(error);
    }
);

// ==================== 请求重试（可选）====================

// 如果需要重试功能，可以这样使用：
// request.get('/api', { retry: true, retryCount: 3 })

export default request;
