"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { JobPayload } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/components/ui/toast";

function useToken() {
  const token = useAuthStore((state) => state.token);
  if (!token) throw new Error("Missing session token");
  return token;
}

export function useWorkerJobs(search?: string, categoryId?: string, subcategoryId?: string) {
  const token = useToken();
  return useQuery({ queryKey: ["worker", "jobs", search, categoryId, subcategoryId], queryFn: () => apiClient.workerJobs(token, search, categoryId, subcategoryId).then((r) => r.data) });
}

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: () => apiClient.categories().then((r) => r.data) });
}

export function useSubcategories() {
  return useQuery({ queryKey: ["subcategories"], queryFn: () => apiClient.subcategories().then((r) => r.data) });
}

export function useWorkerJob(id: string) {
  const token = useToken();
  return useQuery({ queryKey: ["worker", "jobs", id], queryFn: () => apiClient.workerJob(token, id).then((r) => r.data), enabled: Boolean(id) });
}

export function useWorkerApplications() {
  const token = useToken();
  return useQuery({ queryKey: ["worker", "applications"], queryFn: () => apiClient.workerApplications(token).then((r) => r.data) });
}

export function useWorkerPhoneRequests() {
  const token = useToken();
  return useQuery({ queryKey: ["worker", "phone-requests"], queryFn: () => apiClient.workerPhoneRequests(token).then((r) => r.data) });
}

export function useEmployerJobs() {
  const token = useToken();
  return useQuery({ queryKey: ["employer", "jobs"], queryFn: () => apiClient.employerJobs(token).then((r) => r.data) });
}

export function useEmployerJob(id: string) {
  const token = useToken();
  return useQuery({ queryKey: ["employer", "jobs", id], queryFn: () => apiClient.employerJob(token, id).then((r) => r.data), enabled: Boolean(id) });
}

export function useEmployerApplications() {
  const token = useToken();
  return useQuery({ queryKey: ["employer", "applications"], queryFn: () => apiClient.employerApplications(token).then((r) => r.data) });
}

export function useEmployerPhoneRequests() {
  const token = useToken();
  return useQuery({ queryKey: ["employer", "phone-requests"], queryFn: () => apiClient.employerPhoneRequests(token).then((r) => r.data) });
}

export function useNotifications() {
  const token = useToken();
  return useQuery({ queryKey: ["notifications"], queryFn: () => apiClient.notifications(token).then((r) => r.data) });
}

export function useWorkerActions() {
  const token = useToken();
  const queryClient = useQueryClient();
  const push = useToast((state) => state.push);
  return {
    apply: useMutation({
      mutationFn: (id: string) => apiClient.apply(token, id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["worker"] });
        push({ tone: "success", title: "Application sent", description: "Your application is now with the employer." });
      },
      onError: (error) => push({ tone: "error", title: "Could not apply", description: error.message })
    }),
    requestPhone: useMutation({
      mutationFn: (id: string) => apiClient.requestPhone(token, id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["worker"] });
        push({ tone: "success", title: "Phone request sent", description: "The employer can now review your request." });
      },
      onError: (error) => push({ tone: "error", title: "Request failed", description: error.message })
    })
  };
}

export function useEmployerActions() {
  const token = useToken();
  const queryClient = useQueryClient();
  const push = useToast((state) => state.push);
  return {
    createJob: useMutation({
      mutationFn: (body: JobPayload) => apiClient.createJob(token, body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employer"] });
        push({ tone: "success", title: "Job published", description: "Workers can now discover this role." });
      },
      onError: (error) => push({ tone: "error", title: "Could not publish job", description: error.message })
    }),
    updateJob: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Partial<JobPayload> }) => apiClient.updateJob(token, id, body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employer"] });
        push({ tone: "success", title: "Job updated" });
      },
      onError: (error) => push({ tone: "error", title: "Could not update job", description: error.message })
    }),
    deleteJob: useMutation({
      mutationFn: (id: string) => apiClient.deleteJob(token, id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employer"] });
        push({ tone: "success", title: "Job deleted" });
      },
      onError: (error) => push({ tone: "error", title: "Could not delete job", description: error.message })
    }),
    approvePhone: useMutation({
      mutationFn: (id: string) => apiClient.approvePhoneRequest(token, id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employer"] });
        push({ tone: "success", title: "Phone request approved" });
      },
      onError: (error) => push({ tone: "error", title: "Approval failed", description: error.message })
    }),
    rejectPhone: useMutation({
      mutationFn: (id: string) => apiClient.rejectPhoneRequest(token, id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employer"] });
        push({ tone: "success", title: "Phone request rejected" });
      },
      onError: (error) => push({ tone: "error", title: "Rejection failed", description: error.message })
    }),
    markRead: useMutation({
      mutationFn: (id: string) => apiClient.markNotificationRead(token, id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
    }),
    markAllRead: useMutation({
      mutationFn: () => apiClient.markAllRead(token),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
    })
  };
}
