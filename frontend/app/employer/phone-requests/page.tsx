"use client";

import { PhoneCall } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployerActions, useEmployerPhoneRequests } from "@/lib/hooks";

export default function EmployerPhoneRequestsPage() {
  const requests = useEmployerPhoneRequests();
  const actions = useEmployerActions();
  return (
    <>
      <PageHeader eyebrow="Phone requests" title="Approve worker phone access" description="Review requests from workers who have applied to your jobs." />
      {requests.isLoading ? <Skeleton className="h-44" /> : requests.data?.length ? (
        <div className="grid gap-4">
          {requests.data.map((request) => (
            <Card key={request.id}>
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <Badge tone={request.phoneRequestStatus === "PENDING" ? "amber" : request.phoneRequestStatus === "APPROVED" ? "green" : "red"}>{request.phoneRequestStatus}</Badge>
                  <h3 className="mt-3 text-base font-semibold text-slate-950">{request.worker.user.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{request.job.title} · {request.worker.user.phone}</p>
                </div>
                {request.phoneRequestStatus === "PENDING" ? (
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => actions.rejectPhone.mutate(request.id)} disabled={actions.rejectPhone.isPending}>Reject</Button>
                    <Button onClick={() => actions.approvePhone.mutate(request.id)} disabled={actions.approvePhone.isPending}>Approve</Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={PhoneCall} title="No phone requests" description="Requests appear after workers apply and ask for employer contact access." />
      )}
    </>
  );
}
