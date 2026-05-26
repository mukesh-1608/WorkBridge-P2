"use client";

import { BriefcaseBusiness, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { WorkerJobCard } from "@/components/jobs/job-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerJobs, useCategories, useSubcategories } from "@/lib/hooks";

export default function WorkerJobsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("categoryId") || "all";
  const urlSubcategory = searchParams.get("subcategoryId") || "all";

  const [search, setSearch] = useState(urlSearch);
  const [category, setCategory] = useState(urlCategory);
  const [subcategory, setSubcategory] = useState(urlSubcategory);

  const { data: categories = [] } = useCategories();
  const { data: allSubcategories = [] } = useSubcategories();

  const jobs = useWorkerJobs(
    urlSearch || undefined,
    urlCategory !== "all" ? urlCategory : undefined,
    urlSubcategory !== "all" ? urlSubcategory : undefined
  );

  const subcategories = useMemo(
    () => allSubcategories.filter((sub) => sub.categoryId === category),
    [allSubcategories, category]
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    if (search) params.set("search", search);
    else params.delete("search");

    if (category !== "all") params.set("categoryId", category);
    else params.delete("categoryId");

    if (subcategory !== "all") params.set("subcategoryId", subcategory);
    else params.delete("subcategoryId");

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSubcategory("all");
    router.push(pathname);
  };

  return (
    <>
      <PageHeader eyebrow="Job market" title="Browse active jobs" description="Search by role, location, category, and subcategory." />
      <div className="mb-5 grid gap-3 rounded-3xl border border-white/70 bg-white/62 p-3 shadow-sm backdrop-blur md:grid-cols-[1fr_220px_220px_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search jobs, skills, locations" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
        </div>
        <Select value={category} onChange={(event) => { setCategory(event.target.value); setSubcategory("all"); }}>
          <option value="all">All categories</option>
          {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select value={subcategory} onChange={(event) => setSubcategory(event.target.value)} disabled={category === "all"}>
          <option value="all">All subcategories</option>
          {subcategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Button onClick={applyFilters}>Apply Filters</Button>
        <Button variant="outline" onClick={clearFilters} className="bg-white/50">Clear</Button>
      </div>
      {jobs.isLoading ? <div className="grid gap-4"><Skeleton className="h-40" /><Skeleton className="h-40" /></div> : jobs.data?.length ? (
        <div className="grid gap-4">{jobs.data.map((job) => <WorkerJobCard key={job.id} job={job} />)}</div>
      ) : (
        <EmptyState icon={BriefcaseBusiness} title="No matching jobs" description="Adjust filters or clear search to see more opportunities." />
      )}
    </>
  );
}
