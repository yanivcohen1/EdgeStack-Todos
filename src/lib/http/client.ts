"use client";

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { showSnackbar } from "@/lib/ui/snackbar";
import { loadingBarController } from "@/lib/ui/loading-bar";
import { tokenStorage } from "./token-storage";

const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const baseURL = envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : "";

const api = axios.create({ baseURL });

let refreshPromise: Promise<string | null> | null = null;

type ErrorPayload = { message?: string; error?: string };
type RetriableRequestConfig = InternalAxiosRequestConfig & { __isRetryRequest?: boolean };

const resolveMessage = (message: unknown, fallback: string) => {
  return typeof message === "string" && message.trim().length > 0 ? message : fallback;
};

const notifyFromError = (error: AxiosError<ErrorPayload> | unknown, fallback: string) => {
  let message: string;
  if (axios.isAxiosError(error)) {
    message = error.response?.data?.message || error.response?.data?.error || error.message
  } else {
    message = fallback || 'Something went wrong';
  }
  showSnackbar({
    message: message,
    severity: "error"
  });
}

const refreshTokens = async () => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  const refreshEndpoint = baseURL ? `${baseURL}/api/auth/refresh` : "/api/auth/refresh";

  const response = await axios.post(refreshEndpoint, {
    refreshToken
  });

  const { accessToken, refreshToken: nextRefresh } = response.data;
  tokenStorage.setAccessToken(accessToken);
  tokenStorage.setRefreshToken(nextRefresh);
  return accessToken;
};

api.interceptors.request.use(
  (config) => {
    loadingBarController.startRequest();
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (requestError: AxiosError) => {
    loadingBarController.finishRequest();
    return Promise.reject(requestError);
  }
);

api.interceptors.response.use(
  (response) => {
    loadingBarController.finishRequest();
    return response;
  },
  async (error: AxiosError<ErrorPayload>) => {
    loadingBarController.finishRequest();
    const { response, config } = error;
    const requestConfig = config as RetriableRequestConfig | undefined;
    const unauthorizedFallback = "Unauthorized request. Please sign in again.";
    const genericFallback = "An error occurred while processing your request.";
    const refreshFallback = "Unable to refresh your session. Please sign in again.";

    if (response?.status === 401) {
      if (!requestConfig || requestConfig.__isRetryRequest) {
        tokenStorage.clear();
        notifyFromError(error, unauthorizedFallback);
        return Promise.reject(error);
      }

      requestConfig.__isRetryRequest = true;

      try {
        refreshPromise = refreshPromise ?? refreshTokens();
        const newToken = await refreshPromise;
        if (newToken) {
          requestConfig.headers = requestConfig.headers ?? {};
          requestConfig.headers.Authorization = `Bearer ${newToken}`;
          return api(requestConfig);
        }
      } catch (refreshError) {
        // Redirect to login on refresh failure
        // window.location.href = '/login';
      } finally {
        refreshPromise = null;
      }

      tokenStorage.clear();
      // Redirect to login on unauthorized
      window.location.href = '/login';
    } else {
      notifyFromError(error, genericFallback);
    }

    return Promise.reject(error);
  }
);

export { api };
