"use client";

import { BriefcaseBusiness, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { WorkerJobCard } from "@/components/jobs/job-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerJobs } from "@/lib/hooks";

export default function WorkerJobsPage() {
  const jobs = useWorkerJobs();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [subcategory, setSubcategory] = useState("all");

  const categories = useMemo(() => Array.from(new Map((jobs.data ?? []).filter((job) => job.category).map((job) => [job.category!.id, job.category!])).values()), [jobs.data]);
  const subcategories = useMemo(() => Array.from(new Map((jobs.data ?? []).filter((job) => job.subcategory && (category === "all" || job.category?.id === category)).map((job) => [job.subcategory!.id, job.subcategory!])).values()), [category, jobs.data]);
  const filtered = useMemo(() => (jobs.data ?? []).filter((job) => {
    const text = `${job.title} ${job.description} ${job.location} ${job.category?.name ?? ""} ${job.subcategory?.name ?? ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (category === "all" || job.category?.id === category) && (subcategory === "all" || job.subcategory?.id === subcategory);
  }), [category, jobs.data, search, subcategory]);

  return (
    <>
      <PageHeader eyebrow="Job market" title="Browse active jobs" description="Search by role, location, category, and subcategory." />
      <div className="mb-5 grid gap-3 rounded-3xl border border-white/70 bg-white/62 p-3 shadow-sm backdrop-blur md:grid-cols-[1fr_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search jobs, skills, locations" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Select value={category} onChange={(event) => { setCategory(event.target.value); setSubcategory("all"); }}>
          <option value="all">All categories</option>
          {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select value={subcategory} onChange={(event) => setSubcategory(event.target.value)}>
          <option value="all">All subcategories</option>
          {subcategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
      </div>
      {jobs.isLoading ? <div className="grid gap-4"><Skeleton className="h-40" /><Skeleton className="h-40" /></div> : filtered.length ? (
        <div className="grid gap-4">{filtered.map((job) => <WorkerJobCard key={job.id} job={job} />)}</div>
      ) : (
        <EmptyState icon={BriefcaseBusiness} title="No matching jobs" description="Adjust filters or clear search to see more opportunities." />
      )}
    </>
  );
}
