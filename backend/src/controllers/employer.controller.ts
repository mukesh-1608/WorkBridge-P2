import { UserRole } from "@prisma/client";
import type { Request, Response } from "express";
import * as employerService from "../services/employer.service";
import * as profileService from "../services/profile.service";

const userId = (req: Request) => req.user!.id;
const param = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

export const getProfile = async (req: Request, res: Response) => {
  const profile = await profileService.getUserProfile(userId(req), UserRole.EMPLOYER);
  res.json({ success: true, data: profile });
};

export const updateProfile = async (req: Request, res: Response) => {
  const profile = await profileService.updateUserProfile(userId(req), UserRole.EMPLOYER, req.body);
  res.json({ success: true, data: profile });
};

export const createJob = async (req: Request, res: Response) => {
  const job = await employerService.createJob(userId(req), req.body);
  res.status(201).json({ success: true, data: job });
};

export const listJobs = async (req: Request, res: Response) => {
  const jobs = await employerService.listEmployerJobs(userId(req));
  res.json({ success: true, data: jobs });
};

export const getJob = async (req: Request, res: Response) => {
  const job = await employerService.getEmployerJob(userId(req), param(req.params.jobId));
  res.json({ success: true, data: job });
};

export const updateJob = async (req: Request, res: Response) => {
  const job = await employerService.updateJob(userId(req), param(req.params.jobId), req.body);
  res.json({ success: true, data: job });
};

export const deleteJob = async (req: Request, res: Response) => {
  await employerService.deleteJob(userId(req), param(req.params.jobId));
  res.status(204).send();
};

export const listApplications = async (req: Request, res: Response) => {
  const applications = await employerService.listEmployerApplications(userId(req));
  res.json({ success: true, data: applications });
};

export const listPhoneRequests = async (req: Request, res: Response) => {
  const requests = await employerService.listEmployerPhoneRequests(userId(req));
  res.json({ success: true, data: requests });
};

export const approvePhoneRequest = async (req: Request, res: Response) => {
  const application = await employerService.approvePhoneRequest(userId(req), param(req.params.applicationId));
  res.json({ success: true, data: application });
};

export const rejectPhoneRequest = async (req: Request, res: Response) => {
  const application = await employerService.rejectPhoneRequest(userId(req), param(req.params.applicationId));
  res.json({ success: true, data: application });
};
