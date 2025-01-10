import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://api.lifemate.ai';
const API_TIMEOUT = Number(Constants.expoConfig?.extra?.API_TIMEOUT) || 30000;
const MAX_RETRIES = Number(Constants.expoConfig?.extra?.MAX_RETRIES) || 3;

interface RetryConfig {
  retry: number;
  delay: number;
}

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private requestCount: number = 0;
  private lastRequestTime: number = Date.now();

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Platform': Platform.OS,
        'App-Version': Constants.expoConfig?.version || '1.0.0',
      },
    });

    this.setupInterceptors();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Rate limiting
        if (this.shouldThrottleRequest()) {
          throw new Error('Rate limit exceeded');
        }

        // Add auth token
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        this.updateRequestMetrics();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & RetryConfig;
        
        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest?.url?.includes('refresh')) {
          try {
            await this.refreshToken();
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            await this.handleAuthError();
            throw refreshError;
          }
        }

        // Handle retries for 5xx errors
        if (error.response?.status && error.response.status >= 500) {
          if (!originalRequest.retry) {
            originalRequest.retry = 0;
          }

          if (originalRequest.retry < MAX_RETRIES) {
            originalRequest.retry += 1;
            originalRequest.delay = Math.pow(2, originalRequest.retry) * 1000;

            await new Promise(resolve => setTimeout(resolve, originalRequest.delay));
            return this.axiosInstance(originalRequest);
          }
        }

        throw error;
      }
    );
  }

  private shouldThrottleRequest(): boolean {
    const now = Date.now();
    const maxRequestsPerMinute = Number(Constants.expoConfig?.extra?.MAX_REQUESTS_PER_MINUTE) || 60;
    
    if (now - this.lastRequestTime >= 60000) {
      this.requestCount = 0;
      this.lastRequestTime = now;
      return false;
    }

    return this.requestCount >= maxRequestsPerMinute;
  }

  private updateRequestMetrics(): void {
    this.requestCount += 1;
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.axiosInstance.post('/auth/refresh', { refreshToken });
      const { accessToken, newRefreshToken } = response.data;

      await AsyncStorage.setItem('authToken', accessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  private async handleAuthError(): Promise<void> {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
    // Trigger auth error event for the app to handle
    // You might want to use an event emitter or similar mechanism
  }

  // Public API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }
}

export default ApiClient.getInstance();
