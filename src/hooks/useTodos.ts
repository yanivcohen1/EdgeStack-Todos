"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/http/client";
import { tokenStorage } from "@/lib/http/token-storage";
import type { TodoFilterInput, UpsertTodoInput } from "@/lib/validation/todo";
import type { TodoDTO } from "@/types/todo";

type TodosResponse = {
  todos: TodoDTO[];
  total: number;
};

export const useTodos = (filters: Partial<TodoFilterInput>) =>
  useQuery<TodosResponse>({
    queryKey: ["todos", filters],
    queryFn: async () => {
      const { data } = await api.get("/api/auth/todos", { params: filters });
      return data;
    },
    enabled: typeof window !== "undefined" && !!tokenStorage.getAccessToken()
  });

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertTodoInput) => {
      const { data } = await api.post("/api/auth/todos", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertTodoInput) => {
      const { id, ...rest } = payload;
      const { data } = await api.put(`/api/auth/todos/${id}`, { ...rest, id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/auth/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });
};
