import { ApiKey } from "@/app/admin/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useApiKeys() {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const response = await fetch("/api/api-keys");
      if (!response.ok) throw new Error("Failed to fetch API keys");
      return response.json();
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<ApiKey, "id" | "createdAt">) => {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create API key");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApiKey) => {
      const response = await fetch(`/api/api-keys/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update API key");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete API key");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}
