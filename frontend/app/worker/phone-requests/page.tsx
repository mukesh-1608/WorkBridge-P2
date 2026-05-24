"use client";

import { PhoneCall } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerPhoneRequests } from "@/lib/hooks";

export default function WorkerPhoneRequestsPage() {
  const requests = useWorkerPhoneRequests();
  return (
    <>
      <PageHeader eyebrow="Phone access" title="Employer phone requests" description="Approved contacts unlock instantly here and in the job detail page." />
      {requests.isLoading ? <Skeleton className="h-44" /> : requests.data?.length ? (
        <div className="grid gap-4">
          {requests.data.map((request) => (
            <Card key={request.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Badge tone={request.phoneRequestStatus === "APPROVED" ? "green" : request.phoneRequestStatus === "PENDING" ? "amber" : "red"}>{request.phoneRequestStatus}</Badge>
                  <h3 className="mt-3 text-base font-semibold text-slate-950">{request.job.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{request.job.employer?.name} · {request.job.employer?.employerPhone ?? "Phone hidden"}</p>
                </div>
                <p className="text-sm text-slate-500">{request.employerPhoneUnlocked ? "Unlocked" : "Awaiting employer"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={PhoneCall} title="No phone requests" description="Request employer phone access after applying to a job." />
      )}
    </>
  );
}
