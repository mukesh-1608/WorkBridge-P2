import { NotificationType, PhoneRequestStatus } from "@prisma/client";
import { prisma } from "../prisma/client";
import { emitToUser } from "../realtime/socket.server";
import { HttpError } from "../utils/http-error";
import { createNotification } from "./notification.service";

const getEmployer = async (userId: string) => {
  const employer = await prisma.employerProfile.findUnique({ where: { userId } });
  if (!employer) {
    throw new HttpError(404, "Employer profile not found");
  }
  return employer;
};

export const createJob = async (
  userId: string,
  input: {
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
  }
) => {
  const employer = await getEmployer(userId);
  const subcategory = await prisma.subcategory.findFirst({
    where: { id: input.subcategoryId, categoryId: input.categoryId }
  });

  if (!subcategory) {
    throw new HttpError(400, "Subcategory must belong to the selected category");
  }

  return prisma.job.create({
    data: {
      ...input,
      employerId: employer.id
    },
    include: { category: true, subcategory: true }
  });
};

export const listEmployerJobs = async (userId: string) => {
  const employer = await getEmployer(userId);
  return prisma.job.findMany({
    where: { employerId: employer.id },
    include: { category: true, subcategory: true, applications: true },
    orderBy: { createdAt: "desc" }
  });
};

export const getEmployerJob = async (userId: string, jobId: string) => {
  const employer = await getEmployer(userId);
  const job = await prisma.job.findFirst({
    where: { id: jobId, employerId: employer.id },
    include: { category: true, subcategory: true, applications: true }
  });

  if (!job) {
    throw new HttpError(404, "Job not found");
  }

  return job;
};

export const updateJob = async (
  userId: string,
  jobId: string,
  input: Partial<Parameters<typeof createJob>[1]>
) => {
  await getEmployerJob(userId, jobId);

  if (input.categoryId || input.subcategoryId) {
    const existing = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
    const categoryId = input.categoryId ?? existing.categoryId;
    const subcategoryId = input.subcategoryId ?? existing.subcategoryId;
    const subcategory = await prisma.subcategory.findFirst({
      where: { id: subcategoryId, categoryId }
    });

    if (!subcategory) {
      throw new HttpError(400, "Subcategory must belong to the selected category");
    }
  }

  return prisma.job.update({
    where: { id: jobId },
    data: input,
    include: { category: true, subcategory: true }
  });
};

export const deleteJob = async (userId: string, jobId: string) => {
  await getEmployerJob(userId, jobId);
  return prisma.job.delete({ where: { id: jobId } });
};

export const listEmployerApplications = async (userId: string) => {
  const employer = await getEmployer(userId);
  return prisma.jobApplication.findMany({
    where: { job: { employerId: employer.id } },
    include: {
      worker: { include: { user: true } },
      job: { include: { category: true, subcategory: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};

export const listEmployerPhoneRequests = async (userId: string) => {
  const employer = await getEmployer(userId);
  return prisma.jobApplication.findMany({
    where: {
      job: { employerId: employer.id },
      phoneRequestStatus: { not: PhoneRequestStatus.NONE }
    },
    include: {
      worker: { include: { user: true } },
      job: { include: { category: true, subcategory: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
};

const findOwnedPhoneRequest = async (userId: string, applicationId: string) => {
  const employer = await getEmployer(userId);
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      job: { employerId: employer.id }
    },
    include: {
      worker: { include: { user: true } },
      job: { include: { employer: { include: { user: true } } } }
    }
  });

  if (!application) {
    throw new HttpError(404, "Phone request not found");
  }

  if (application.phoneRequestStatus !== PhoneRequestStatus.PENDING) {
    throw new HttpError(400, "Only pending phone requests can be changed");
  }

  return application;
};

export const approvePhoneRequest = async (userId: string, applicationId: string) => {
  const application = await findOwnedPhoneRequest(userId, applicationId);

  const updated = await prisma.jobApplication.update({
    where: { id: application.id },
    data: {
      phoneRequestStatus: PhoneRequestStatus.APPROVED,
      employerPhoneUnlocked: true
    },
    include: {
      worker: { include: { user: true } },
      job: { include: { employer: { include: { user: true } } } }
    }
  });

  const notification = await createNotification({
    userId: updated.worker.userId,
    type: NotificationType.PHONE_REQUEST_APPROVED,
    title: "Phone number request approved",
    message: `${updated.job.employer.user.name} approved your phone number request for ${updated.job.title}.`,
    metadata: {
      applicationId: updated.id,
      jobId: updated.jobId,
      employerPhone: updated.job.employer.user.phone
    }
  });

  emitToUser(updated.worker.userId, "phone_request.approved", {
    applicationId: updated.id,
    jobId: updated.jobId,
    jobTitle: updated.job.title,
    employerName: updated.job.employer.user.name,
    employerPhone: updated.job.employer.user.phone,
    notification
  });

  return updated;
};

export const rejectPhoneRequest = async (userId: string, applicationId: string) => {
  const application = await findOwnedPhoneRequest(userId, applicationId);

  const updated = await prisma.jobApplication.update({
    where: { id: application.id },
    data: {
      phoneRequestStatus: PhoneRequestStatus.REJECTED,
      employerPhoneUnlocked: false
    },
    include: {
      worker: { include: { user: true } },
      job: { include: { employer: { include: { user: true } } } }
    }
  });

  const notification = await createNotification({
    userId: updated.worker.userId,
    type: NotificationType.PHONE_REQUEST_REJECTED,
    title: "Phone number request rejected",
    message: `${updated.job.employer.user.name} rejected your phone number request for ${updated.job.title}.`,
    metadata: {
      applicationId: updated.id,
      jobId: updated.jobId
    }
  });

  emitToUser(updated.worker.userId, "phone_request.rejected", {
    applicationId: updated.id,
    jobId: updated.jobId,
    jobTitle: updated.job.title,
    employerName: updated.job.employer.user.name,
    notification
  });

  return updated;
};
