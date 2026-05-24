"use client";

import Link from "next/link";
import { Bell, BriefcaseBusiness, ClipboardList, PhoneCall } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { WorkerJobCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications, useWorkerApplications, useWorkerJobs, useWorkerPhoneRequests } from "@/lib/hooks";

export default function WorkerDashboardPage() {
  const jobs = useWorkerJobs();
  const applications = useWorkerApplications();
  const phoneRequests = useWorkerPhoneRequests();
  const notifications = useNotifications();

  const unread = notifications.data?.filter((item) => !item.readAt).length ?? 0;
  const approved = phoneRequests.data?.filter((item) => item.phoneRequestStatus === "APPROVED").length ?? 0;

  return (
    <>
      <PageHeader eyebrow="Worker dashboard" title="Find work with less friction" description="Track opportunities, applications, phone approvals, and realtime updates from one quiet workspace." action={<Button asChild><Link href="/worker/jobs">Browse jobs</Link></Button>} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={BriefcaseBusiness} label="Active jobs" value={jobs.data?.length ?? 0} detail="Available now" />
        <StatCard icon={ClipboardList} label="Applications" value={applications.data?.length ?? 0} detail="Submitted roles" />
        <StatCard icon={PhoneCall} label="Approved phones" value={approved} detail="Unlocked contacts" />
        <StatCard icon={Bell} label="Unread" value={unread} detail="Notifications" />
      </div>
      <section className="mt-8">
        <PageHeader title="Recommended jobs" description="Fresh opportunities from employers in your market." />
        {jobs.isLoading ? <div className="grid gap-4"><Skeleton className="h-40" /><Skeleton className="h-40" /></div> : jobs.data?.length ? (
          <div className="grid gap-4">{jobs.data.slice(0, 3).map((job) => <WorkerJobCard key={job.id} job={job} />)}</div>
        ) : (
          <EmptyState icon={BriefcaseBusiness} title="No active jobs" description="New jobs will appear here as employers publish them." />
        )}
      </section>
    </>
  );
}
