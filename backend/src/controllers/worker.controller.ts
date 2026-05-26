import { UserRole } from "@prisma/client";
import type { Request, Response } from "express";
import * as profileService from "../services/profile.service";
import * as workerService from "../services/worker.service";

const userId = (req: Request) => req.user!.id;
const param = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

export const getProfile = async (req: Request, res: Response) => {
  const profile = await profileService.getUserProfile(userId(req), UserRole.WORKER);
  res.json({ success: true, data: profile });
};

export const updateProfile = async (req: Request, res: Response) => {
  const profile = await profileService.updateUserProfile(userId(req), UserRole.WORKER, req.body);
  res.json({ success: true, data: profile });
};

export const listJobs = async (req: Request, res: Response) => {
  const jobs = await workerService.listActiveJobsForWorker(
    userId(req),
    req.query.search as string | undefined,
    req.query.categoryId as string | undefined,
    req.query.subcategoryId as string | undefined
  );
  res.json({ success: true, data: jobs });
};

export const getJob = async (req: Request, res: Response) => {
  const job = await workerService.getWorkerJob(userId(req), param(req.params.jobId));
  res.json({ success: true, data: job });
};

export const applyToJob = async (req: Request, res: Response) => {
  const application = await workerService.applyToJob(userId(req), param(req.params.jobId));
  res.status(201).json({ success: true, data: application });
};

export const listApplications = async (req: Request, res: Response) => {
  const applications = await workerService.listWorkerApplications(userId(req));
  res.json({ success: true, data: applications });
};

export const requestPhone = async (req: Request, res: Response) => {
  const application = await workerService.requestEmployerPhone(userId(req), param(req.params.jobId));
  res.json({ success: true, data: application });
};

export const listPhoneRequests = async (req: Request, res: Response) => {
  const requests = await workerService.listWorkerPhoneRequests(userId(req));
  res.json({ success: true, data: requests });
};
