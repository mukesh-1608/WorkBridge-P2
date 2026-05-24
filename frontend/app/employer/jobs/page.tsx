"use client";

import Link from "next/link";
import { BriefcaseBusiness, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { EmployerJobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployerJobs } from "@/lib/hooks";

export default function EmployerJobsPage() {
  const jobs = useEmployerJobs();
  return (
    <>
      <PageHeader eyebrow="Jobs" title="Manage job postings" description="Review, edit, and close the roles you have published." action={<Button asChild><Link href="/employer/jobs/new"><Plus className="h-4 w-4" />New job</Link></Button>} />
      {jobs.isLoading ? <Skeleton className="h-44" /> : jobs.data?.length ? (
        <div className="grid gap-4">{jobs.data.map((job) => <EmployerJobCard key={job.id} job={job} />)}</div>
      ) : (
        <EmptyState icon={BriefcaseBusiness} title="No jobs yet" description="Create a role and workers will be able to discover it immediately." action={<Button asChild><Link href="/employer/jobs/new">Create job</Link></Button>} />
      )}
    </>
  );
}
