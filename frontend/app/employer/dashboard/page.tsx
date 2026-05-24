"use client";

import Link from "next/link";
import { Bell, BriefcaseBusiness, ClipboardList, PhoneCall, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { EmployerJobCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployerApplications, useEmployerJobs, useEmployerPhoneRequests, useNotifications } from "@/lib/hooks";

export default function EmployerDashboardPage() {
  const jobs = useEmployerJobs();
  const applications = useEmployerApplications();
  const phoneRequests = useEmployerPhoneRequests();
  const notifications = useNotifications();
  const pending = phoneRequests.data?.filter((item) => item.phoneRequestStatus === "PENDING").length ?? 0;
  const unread = notifications.data?.filter((item) => !item.readAt).length ?? 0;

  return (
    <>
      <PageHeader eyebrow="Employer dashboard" title="Hiring operations, refined" description="Publish roles, review workers, and unlock phone access from one polished control room." action={<Button asChild><Link href="/employer/jobs/new"><Plus className="h-4 w-4" />New job</Link></Button>} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={BriefcaseBusiness} label="Jobs" value={jobs.data?.length ?? 0} detail="Owned postings" />
        <StatCard icon={ClipboardList} label="Applications" value={applications.data?.length ?? 0} detail="Worker responses" />
        <StatCard icon={PhoneCall} label="Phone requests" value={pending} detail="Pending approval" />
        <StatCard icon={Bell} label="Unread" value={unread} detail="Notifications" />
      </div>
      <section className="mt-8">
        <PageHeader title="Recent jobs" description="Manage your newest postings." />
        {jobs.isLoading ? <Skeleton className="h-44" /> : jobs.data?.length ? <div className="grid gap-4">{jobs.data.slice(0, 3).map((job) => <EmployerJobCard key={job.id} job={job} />)}</div> : <EmptyState icon={BriefcaseBusiness} title="No jobs yet" description="Create your first job to start receiving applications." action={<Button asChild><Link href="/employer/jobs/new">Create job</Link></Button>} />}
      </section>
    </>
  );
}
