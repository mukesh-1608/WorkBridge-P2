import type {
  Category,
  Subcategory,
  EmployerApplication,
  EmployerJob,
  JobPayload,
  NotificationItem,
  Role,
  User,
  WorkerApplication,
  WorkerJob,
  WorkerPhoneRequest
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function api<T>(path: string, options: RequestInit & { token?: string } = {}) {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? "Request failed");
  }

  return payload as ApiEnvelope<T>;
}

export const apiClient = {
  login: (body: { role: Role; phone: string; otp: string; name?: string; state?: string }) =>
    api<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  workerJobs: (token: string, search?: string, categoryId?: string, subcategoryId?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId) params.set("categoryId", categoryId);
    if (subcategoryId) params.set("subcategoryId", subcategoryId);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return api<WorkerJob[]>(`/api/worker/jobs${qs}`, { token });
  },
  categories: () => api<Category[]>("/api/categories"),
  subcategories: () => api<Subcategory[]>("/api/subcategories"),
  workerJob: (token: string, id: string) => api<WorkerJob>(`/api/worker/jobs/${id}`, { token }),
  apply: (token: string, id: string) =>
    api<{ id: string }>(`/api/worker/jobs/${id}/apply`, { method: "POST", token }),
  requestPhone: (token: string, id: string) =>
    api<EmployerApplication>(`/api/worker/jobs/${id}/request-phone`, { method: "POST", token }),
  workerApplications: (token: string) => api<WorkerApplication[]>("/api/worker/applications", { token }),
  workerPhoneRequests: (token: string) => api<WorkerPhoneRequest[]>("/api/worker/phone-requests", { token }),
  employerJobs: (token: string) => api<EmployerJob[]>("/api/employer/jobs", { token }),
  employerJob: (token: string, id: string) => api<EmployerJob>(`/api/employer/jobs/${id}`, { token }),
  createJob: (token: string, body: JobPayload) =>
    api<EmployerJob>("/api/employer/jobs", { method: "POST", token, body: JSON.stringify(body) }),
  updateJob: (token: string, id: string, body: Partial<JobPayload>) =>
    api<EmployerJob>(`/api/employer/jobs/${id}`, { method: "PUT", token, body: JSON.stringify(body) }),
  deleteJob: (token: string, id: string) =>
    api<void>(`/api/employer/jobs/${id}`, { method: "DELETE", token }),
  employerApplications: (token: string) => api<EmployerApplication[]>("/api/employer/applications", { token }),
  employerPhoneRequests: (token: string) => api<EmployerApplication[]>("/api/employer/phone-requests", { token }),
  approvePhoneRequest: (token: string, id: string) =>
    api<EmployerApplication>(`/api/employer/phone-requests/${id}/approve`, { method: "POST", token }),
  rejectPhoneRequest: (token: string, id: string) =>
    api<EmployerApplication>(`/api/employer/phone-requests/${id}/reject`, { method: "POST", token }),
  notifications: (token: string) => api<NotificationItem[]>("/api/notifications", { token }),
  markNotificationRead: (token: string, id: string) =>
    api<NotificationItem>(`/api/notifications/${id}/read`, { method: "POST", token }),
  markAllRead: (token: string) => api<NotificationItem[]>("/api/notifications/read-all", { method: "POST", token })
};
