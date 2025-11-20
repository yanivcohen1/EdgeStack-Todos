"use client";

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { showSnackbar } from "@/lib/ui/snackbar";
import { tokenStorage } from "./token-storage";

const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const baseURL = envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : "";

const api = axios.create({ baseURL });

let refreshPromise: Promise<string | null> | null = null;

type ErrorPayload = { message?: string };
type RetriableRequestConfig = InternalAxiosRequestConfig & { __isRetryRequest?: boolean };

const resolveMessage = (message: unknown, fallback: string) => {
  return typeof message === "string" && message.trim().length > 0 ? message : fallback;
};

const createErrorNotifier = () => {
  let shown = false;

  const notify = (message: unknown, fallback: string) => {
    if (shown) return;
    showSnackbar({
      message: resolveMessage(message, fallback),
      severity: "error"
    });
    shown = true;
  };

  return {
    fromResponse: (response: AxiosResponse<unknown> | undefined, fallback: string) => {
      const data = response?.data as ErrorPayload | undefined;
      notify(data?.message, fallback);
    },
    fromMessage: (message: unknown, fallback: string) => notify(message, fallback)
  };
};

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

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorPayload>) => {
    const { response, config } = error;
    const requestConfig = config as RetriableRequestConfig | undefined;
    const notifier = createErrorNotifier();
    const notifyFromResponse = notifier.fromResponse;
    const notifyFromMessage = notifier.fromMessage;

    const unauthorizedFallback = "Unauthorized request. Please sign in again.";
    const genericFallback = "An error occurred while processing your request.";
    const refreshFallback = "Unable to refresh your session. Please sign in again.";

    if (response?.status === 401) {
      if (!requestConfig || requestConfig.__isRetryRequest) {
        tokenStorage.clear();
        notifyFromResponse(response, unauthorizedFallback);
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
        if (axios.isAxiosError(refreshError)) {
          notifyFromResponse(refreshError.response, refreshFallback);
        } else {
          notifyFromMessage(null, refreshFallback);
        }
      } finally {
        refreshPromise = null;
      }

      tokenStorage.clear();
      notifyFromResponse(response, unauthorizedFallback);
    } else {
      notifyFromResponse(response, genericFallback);
    }

    return Promise.reject(error);
  }
);

export { api };
