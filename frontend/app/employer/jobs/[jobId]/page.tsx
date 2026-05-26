"use client";

import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { JobForm } from "@/components/jobs/job-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployerActions, useEmployerApplications, useEmployerJob, useEmployerJobs } from "@/lib/hooks";
import type { JobPayload } from "@/lib/types";

export default function EmployerJobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const job = useEmployerJob(params.jobId);
  const applications = useEmployerApplications();
  const actions = useEmployerActions();
  const relevantApplications = applications.data?.filter((item) => item.job.id === params.jobId) ?? [];

  if (job.isLoading) return <Skeleton className="h-96" />;
  if (!job.data) return <PageHeader title="Job not found" description="This job could not be loaded." />;

  const initial: JobPayload = {
    categoryId: job.data.category.id,
    subcategoryId: job.data.subcategory.id,
    title: job.data.title,
    description: job.data.description,
    location: job.data.location,
    state: job.data.state,
    wage: job.data.wage,
    wageType: job.data.wageType,
    jobType: job.data.jobType,
    status: job.data.status
  };

  return (
    <>
      <PageHeader
        eyebrow="Manage job"
        title={job.data.title}
        description="Update role details, review applications, or remove the posting."
        action={<Button variant="destructive" onClick={() => actions.deleteJob.mutate(job.data.id, { onSuccess: () => router.push("/employer/jobs") })}><Trash2 className="h-4 w-4" />Delete</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <JobForm initial={initial} onSubmit={(payload) => actions.updateJob.mutate({ id: job.data.id, body: payload })} pending={actions.updateJob.isPending} />
        <Card>
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-slate-950">Applications</h3>
            <div className="mt-4 space-y-3">
              {relevantApplications.length ? relevantApplications.map((application) => (
                <div key={application.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">{application.worker.user.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{application.worker.user.phone}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="green">{application.status}</Badge>
                    <Badge tone={application.phoneRequestStatus === "PENDING" ? "amber" : application.phoneRequestStatus === "APPROVED" ? "green" : "neutral"}>{application.phoneRequestStatus}</Badge>
                  </div>
                </div>
              )) : <p className="text-sm leading-6 text-slate-600">No worker applications yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
