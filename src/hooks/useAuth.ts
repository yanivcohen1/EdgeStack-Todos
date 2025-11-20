"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/http/client";
import { tokenStorage } from "@/lib/http/token-storage";
import type { LoginInput, RegisterInput } from "@/lib/validation/auth";
import type { SessionUser } from "@/types/auth";

const persistTokens = (accessToken: string, refreshToken: string) => {
  tokenStorage.setAccessToken(accessToken);
  tokenStorage.setRefreshToken(refreshToken);
};

const clearTokens = () => tokenStorage.clear();

type SessionResponse = {
  user: SessionUser;
};

export const useSession = () =>
  useQuery<SessionResponse>({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await api.get<SessionResponse>("/api/auth/profile");
      return data;
    },
    retry: false,
    enabled: typeof window !== "undefined" && !!tokenStorage.getAccessToken()
  });

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LoginInput) => {
      const { data } = await api.post("/api/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      persistTokens(data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RegisterInput) => {
      const { data } = await api.post("/api/auth/register", payload);
      return data;
    },
    onSuccess: (data) => {
      persistTokens(data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      await api.post("/api/auth/logout", { refreshToken });
    },
    onSettled: () => {
      clearTokens();
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });
};
