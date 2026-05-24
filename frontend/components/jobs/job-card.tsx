import Link from "next/link";
import { ArrowRight, MapPin, Phone, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EmployerJob, WorkerJob } from "@/lib/types";
import { currency, formatDate } from "@/lib/utils";

export function WorkerJobCard({ job }: { job: WorkerJob }) {
  const status = job.application?.phoneRequestStatus;
  return (
    <Card className="transition hover:-translate-y-0.5 hover:bg-white/90">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              {job.category?.name ? <Badge>{job.category.name}</Badge> : null}
              {job.subcategory?.name ? <Badge>{job.subcategory.name}</Badge> : null}
              {status && status !== "NONE" ? <Badge tone={status === "APPROVED" ? "green" : status === "PENDING" ? "amber" : "red"}>{status}</Badge> : null}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-950">{job.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}, {job.state}</span>
              <span className="inline-flex items-center gap-1.5"><Wallet className="h-4 w-4" />{currency(job.wage)} / {job.wageType}</span>
              {job.employer?.employerPhone ? <span className="inline-flex items-center gap-1.5 text-emerald-700"><Phone className="h-4 w-4" />{job.employer.employerPhone}</span> : null}
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/worker/jobs/${job.id}`}>View <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmployerJobCard({ job }: { job: EmployerJob }) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:bg-white/90">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={job.status === "ACTIVE" ? "green" : "neutral"}>{job.status}</Badge>
              <Badge>{job.category?.name}</Badge>
              <Badge>{job.subcategory?.name}</Badge>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-950">{job.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{job.location}, {job.state} · {currency(job.wage)} / {job.wageType}</p>
            <p className="mt-3 text-xs text-slate-500">Published {formatDate(job.createdAt)}</p>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/employer/jobs/${job.id}`}>Manage <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
