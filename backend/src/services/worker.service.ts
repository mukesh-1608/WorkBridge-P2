import { ApplicationStatus, JobStatus, PhoneRequestStatus } from "@prisma/client";
import { prisma } from "../prisma/client";
import { HttpError } from "../utils/http-error";
import { serializeJobForWorker } from "./job.serializer";

const getWorker = async (userId: string) => {
  const worker = await prisma.workerProfile.findUnique({ where: { userId } });
  if (!worker) {
    throw new HttpError(404, "Worker profile not found");
  }
  return worker;
};

export const listActiveJobsForWorker = async (userId: string) => {
  const worker = await getWorker(userId);
  const jobs = await prisma.job.findMany({
    where: { status: JobStatus.ACTIVE },
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

  return prisma.jobApplication.create({
    data: { jobId, workerId: worker.id, status: ApplicationStatus.APPLIED }
  });
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
    where: { jobId_workerId: { jobId, workerId: worker.id } }
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

  return prisma.jobApplication.update({
    where: { id: application.id },
    data: {
      phoneRequestStatus: PhoneRequestStatus.PENDING,
      employerPhoneUnlocked: false
    }
  });
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
