export type Role = "WORKER" | "EMPLOYER";

export type User = {
  id: string;
  role: Role;
  name: string;
  phone: string;
  state: string;
  isActive: boolean;
};

export type Category = {
  id: string;
  name: string;
};

export type Subcategory = {
  id: string;
  categoryId: string;
  name: string;
};

export type ApplicationSummary = {
  id: string;
  status: "APPLIED" | "WITHDRAWN";
  phoneRequestStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  employerPhoneUnlocked: boolean;
};

export type WorkerJob = {
  id: string;
  title: string;
  description: string;
  location: string;
  state: string;
  wage: number;
  wageType: string;
  jobType: string;
  status: "ACTIVE" | "CLOSED" | "FILLED";
  category?: Category;
  subcategory?: Subcategory;
  employer?: {
    id: string;
    name: string;
    state: string;
    employerPhone?: string;
  };
  application: ApplicationSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployerJob = Omit<WorkerJob, "employer" | "application"> & {
  category: Category;
  subcategory: Subcategory;
  applications?: ApplicationSummary[];
};

export type JobPayload = {
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string;
  location: string;
  state: string;
  wage: number;
  wageType: string;
  jobType: string;
  status?: "ACTIVE" | "CLOSED" | "FILLED";
};

export type EmployerApplication = {
  id: string;
  status: "APPLIED" | "WITHDRAWN";
  phoneRequestStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  employerPhoneUnlocked: boolean;
  createdAt: string;
  updatedAt: string;
  worker: {
    user: User;
  };
  job: EmployerJob;
};

export type WorkerApplication = ApplicationSummary & {
  createdAt: string;
  updatedAt: string;
  job: WorkerJob;
};

export type WorkerPhoneRequest = ApplicationSummary & {
  job: WorkerJob;
  createdAt: string;
  updatedAt: string;
};

export type NotificationItem = {
  id: string;
  userId: string;
  type: "PHONE_REQUEST_APPROVED" | "PHONE_REQUEST_REJECTED" | "PHONE_REQUEST_CREATED" | "JOB_APPLICATION_CREATED";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  readAt?: string | null;
  createdAt: string;
};

export type SocketPhonePayload = {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  employerName: string;
  employerPhone?: string;
  notification?: NotificationItem;
};
