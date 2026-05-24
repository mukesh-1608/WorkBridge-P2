"use client";

import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerApplications } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";

export default function WorkerApplicationsPage() {
  const applications = useWorkerApplications();
  return (
    <>
      <PageHeader eyebrow="Applications" title="Submitted roles" description="Follow every application and its phone access status." />
      {applications.isLoading ? <Skeleton className="h-44" /> : applications.data?.length ? (
        <div className="grid gap-4">
          {applications.data.map((application) => (
            <Card key={application.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="green">{application.status}</Badge>
                    <Badge tone={application.phoneRequestStatus === "APPROVED" ? "green" : application.phoneRequestStatus === "PENDING" ? "amber" : "neutral"}>{application.phoneRequestStatus}</Badge>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-950">{application.job.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{application.job.location}, {application.job.state}</p>
                </div>
                <p className="text-sm text-slate-500">{formatDate(application.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={ClipboardList} title="No applications yet" description="Apply to a job and it will appear here." />
      )}
    </>
  );
}
