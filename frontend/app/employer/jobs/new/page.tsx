"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { JobForm } from "@/components/jobs/job-form";
import { useEmployerActions, useEmployerJobs } from "@/lib/hooks";
import type { JobPayload } from "@/lib/types";

export default function NewEmployerJobPage() {
  const router = useRouter();
  const actions = useEmployerActions();
  const create = (payload: JobPayload) => {
    actions.createJob.mutate(payload, {
      onSuccess: ({ data }) => router.push(`/employer/jobs/${data.id}`)
    });
  };

  return (
    <>
      <PageHeader eyebrow="New job" title="Publish a polished role" description="Create a clear posting with wage, location, category, and status." />
      <JobForm onSubmit={create} pending={actions.createJob.isPending} />
    </>
  );
}
