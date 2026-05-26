import { ApplicationStatus, JobStatus, NotificationType, PhoneRequestStatus, Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import { HttpError } from "../utils/http-error";
import { serializeJobForWorker } from "./job.serializer";
import { createNotification } from "./notification.service";
import { emitToUser } from "../realtime/socket.server";

const getWorker = async (userId: string) => {
  const worker = await prisma.workerProfile.findUnique({ where: { userId } });
  if (!worker) {
    throw new HttpError(404, "Worker profile not found");
  }
  return worker;
};

export const listActiveJobsForWorker = async (userId: string, search?: string, categoryId?: string, subcategoryId?: string) => {
  const worker = await getWorker(userId);
  
  const where: Prisma.JobWhereInput = { status: JobStatus.ACTIVE };

  if (categoryId && categoryId !== "all") {
    where.categoryId = categoryId;
  }

  if (subcategoryId && subcategoryId !== "all") {
    where.subcategoryId = subcategoryId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
      { category: { name: { contains: search, mode: "insensitive" } } },
      { subcategory: { name: { contains: search, mode: "insensitive" } } }
    ];
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      category: true,
      subcategory: true,
      employer: { include: { user: true } },
      applications: { where: { workerId: worker.id }, take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });

  return jobs.map((job) => serializeJobForWorker(job, job.applications[0]));
};

export const getWorkerJob = async (userId: string, jobId: string) => {
  const worker = await getWorker(userId);
  const job = await prisma.job.findFirst({
    where: { id: jobId, status: JobStatus.ACTIVE },
    include: {
      category: true,
      subcategory: true,
      employer: { include: { user: true } },
      applications: { where: { workerId: worker.id }, take: 1 }
    }
  });

  if (!job) {
    throw new HttpError(404, "Active job not found");
  }

  return serializeJobForWorker(job, job.applications[0]);
};

export const applyToJob = async (userId: string, jobId: string) => {
  const worker = await getWorker(userId);
  const job = await prisma.job.findFirst({ where: { id: jobId, status: JobStatus.ACTIVE } });

  if (!job) {
    throw new HttpError(404, "Active job not found");
  }

  const existing = await prisma.jobApplication.findUnique({
    where: { jobId_workerId: { jobId, workerId: worker.id } }
  });

  if (existing) {
    throw new HttpError(409, "Worker has already applied to this job");
  }

  const application = await prisma.jobApplication.create({
    data: { jobId, workerId: worker.id, status: ApplicationStatus.APPLIED },
    include: {
      worker: { include: { user: true } },
      job: { include: { employer: { include: { user: true } } } }
    }
  });

  const notification = await createNotification({
    userId: application.job.employer.userId,
    type: NotificationType.JOB_APPLICATION_CREATED,
    title: "New Job Application",
    message: `${application.worker.user.name} applied for your job: ${application.job.title}.`,
    metadata: {
      applicationId: application.id,
      jobId: application.jobId
    }
  });

  emitToUser(application.job.employer.userId, "job_application.created", {
    applicationId: application.id,
    jobId: application.jobId,
    jobTitle: application.job.title,
    workerName: application.worker.user.name,
    notification
  });

  return application;
};

export const listWorkerApplications = async (userId: string) => {
  const worker = await getWorker(userId);
  const applications = await prisma.jobApplication.findMany({
    where: { workerId: worker.id },
    include: {
      job: {
        include: {
          category: true,
          subcategory: true,
          employer: { include: { user: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return applications.map((application) => ({
    ...application,
    job: serializeJobForWorker(application.job, application)
  }));
};

export const requestEmployerPhone = async (userId: string, jobId: string) => {
  const worker = await getWorker(userId);
  const application = await prisma.jobApplication.findUnique({
    where: { jobId_workerId: { jobId, workerId: worker.id } },
    include: {
      worker: { include: { user: true } },
      job: { include: { employer: { include: { user: true } } } }
    }
  });

  if (!application) {
    throw new HttpError(404, "Apply to this job before requesting employer phone");
  }

  if (application.status !== ApplicationStatus.APPLIED) {
    throw new HttpError(400, "Worker can request employer phone only for an active application");
  }

  if (application.phoneRequestStatus === PhoneRequestStatus.APPROVED) {
    return application;
  }

  if (application.phoneRequestStatus === PhoneRequestStatus.PENDING) {
    throw new HttpError(409, "Phone request is already pending");
  }

  const updated = await prisma.jobApplication.update({
    where: { id: application.id },
    data: {
      phoneRequestStatus: PhoneRequestStatus.PENDING,
      employerPhoneUnlocked: false
    }
  });

  const notification = await createNotification({
    userId: application.job.employer.userId,
    type: NotificationType.PHONE_REQUEST_CREATED,
    title: "Phone number requested",
    message: `${application.worker.user.name} wants to contact you regarding the ${application.job.title} job.`,
    metadata: {
      applicationId: application.id,
      jobId: application.jobId
    }
  });

  emitToUser(application.job.employer.userId, "phone_request.created", {
    applicationId: application.id,
    jobId: application.jobId,
    jobTitle: application.job.title,
    workerName: application.worker.user.name,
    notification
  });

  return updated;
};

export const listWorkerPhoneRequests = async (userId: string) => {
  const worker = await getWorker(userId);
  const applications = await prisma.jobApplication.findMany({
    where: {
      workerId: worker.id,
      phoneRequestStatus: { not: PhoneRequestStatus.NONE }
    },
    include: {
      job: {
        include: {
          category: true,
          subcategory: true,
          employer: { include: { user: true } }
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return applications.map((application) => ({
    id: application.id,
    status: application.status,
    phoneRequestStatus: application.phoneRequestStatus,
    employerPhoneUnlocked: application.employerPhoneUnlocked,
    job: serializeJobForWorker(application.job, application),
    createdAt: application.createdAt,
    updatedAt: application.updatedAt
  }));
};
