"use client";

import { useParams } from "next/navigation";
import { BriefcaseBusiness, MapPin, Phone, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerActions, useWorkerJob } from "@/lib/hooks";
import { currency } from "@/lib/utils";

export default function WorkerJobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const job = useWorkerJob(params.jobId);
  const actions = useWorkerActions();

  if (job.isLoading) return <Skeleton className="h-96" />;
  if (!job.data) return <PageHeader title="Job not found" description="The role may have been closed or removed." />;

  const hasApplied = Boolean(job.data.application);
  const status = job.data.application?.phoneRequestStatus;
  const phone = job.data.employer?.employerPhone;

  return (
    <>
      <PageHeader eyebrow="Job detail" title={job.data.title} description={`${job.data.location}, ${job.data.state}`} />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {job.data.category?.name ? <Badge>{job.data.category.name}</Badge> : null}
              {job.data.subcategory?.name ? <Badge>{job.data.subcategory.name}</Badge> : null}
              <Badge tone="green">{job.data.status}</Badge>
            </div>
            <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">{job.data.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" />{job.data.jobType}</p>
              <p className="flex items-center gap-2"><Wallet className="h-4 w-4" />{currency(job.data.wage)} / {job.data.wageType}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{job.data.location}, {job.data.state}</p>
              {!hasApplied ? (
                <p className="flex items-center gap-2 text-slate-400"><Phone className="h-4 w-4" />+91 •••••••••• (Apply to unlock)</p>
              ) : (
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{phone ?? "Phone hidden until employer approval"}</p>
              )}
            </div>
            {!hasApplied ? (
              <Button className="w-full" onClick={() => actions.apply.mutate(job.data.id)} disabled={actions.apply.isPending}>Apply to job</Button>
            ) : status === "NONE" ? (
              <Button className="w-full" onClick={() => actions.requestPhone.mutate(job.data.id)} disabled={actions.requestPhone.isPending}>Request employer phone</Button>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Phone request status: <span className="font-semibold text-slate-950">{status}</span></div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
