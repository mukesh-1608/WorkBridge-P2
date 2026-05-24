import type { Job, JobApplication, EmployerProfile, User, Category, Subcategory } from "@prisma/client";

type JobWithDetails = Job & {
  category?: Category | null;
  subcategory?: Subcategory | null;
  employer?: (EmployerProfile & { user: User }) | null;
  applications?: JobApplication[];
};

export const serializeJobForWorker = (
  job: JobWithDetails,
  application?: JobApplication | null
) => {
  const employerPhone =
    application?.employerPhoneUnlocked && job.employer?.user.phone
      ? job.employer.user.phone
      : undefined;

  return {
    id: job.id,
    title: job.title,
    description: job.description,
    location: job.location,
    state: job.state,
    wage: job.wage,
    wageType: job.wageType,
    jobType: job.jobType,
    status: job.status,
    category: job.category,
    subcategory: job.subcategory,
    employer: job.employer
      ? {
          id: job.employer.id,
          name: job.employer.user.name,
          state: job.employer.user.state,
          employerPhone
        }
      : undefined,
    application: application
      ? {
          id: application.id,
          status: application.status,
          phoneRequestStatus: application.phoneRequestStatus,
          employerPhoneUnlocked: application.employerPhoneUnlocked
        }
      : null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  };
};
