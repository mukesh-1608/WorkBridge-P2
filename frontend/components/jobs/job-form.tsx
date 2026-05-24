"use client";

import { FormEvent, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EmployerJob, JobPayload } from "@/lib/types";

type OptionJob = Pick<EmployerJob, "category" | "subcategory">;

export function JobForm({ jobs, initial, onSubmit, pending }: { jobs: OptionJob[]; initial?: Partial<JobPayload>; onSubmit: (payload: JobPayload) => void; pending?: boolean }) {
  const categories = useMemo(() => Array.from(new Map(jobs.filter((job) => job.category).map((job) => [job.category.id, job.category])).values()), [jobs]);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const subcategories = useMemo(() => Array.from(new Map(jobs.filter((job) => job.subcategory && (!categoryId || job.subcategory.categoryId === categoryId)).map((job) => [job.subcategory.id, job.subcategory])).values()), [categoryId, jobs]);
  const [subcategoryId, setSubcategoryId] = useState(initial?.subcategoryId ?? subcategories[0]?.id ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? "Chennai");
  const [state, setState] = useState(initial?.state ?? "Tamil Nadu");
  const [wage, setWage] = useState(String(initial?.wage ?? 850));
  const [wageType, setWageType] = useState(initial?.wageType ?? "daily");
  const [jobType, setJobType] = useState(initial?.jobType ?? "full-time");
  const [status, setStatus] = useState<JobPayload["status"]>(initial?.status ?? "ACTIVE");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ categoryId, subcategoryId, title, description, location, state, wage: Number(wage), wageType, jobType, status });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Category
              {categories.length ? (
                <Select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setSubcategoryId(""); }}>
                  <option value="">Choose category</option>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
              ) : (
                <Input placeholder="Category ID" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required />
              )}
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Subcategory
              {subcategories.length ? (
                <Select value={subcategoryId} onChange={(event) => setSubcategoryId(event.target.value)}>
                  <option value="">Choose subcategory</option>
                  {subcategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
              ) : (
                <Input placeholder="Subcategory ID" value={subcategoryId} onChange={(event) => setSubcategoryId(event.target.value)} required />
              )}
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Job title
            <Input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Description
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} required minLength={10} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Location
              <Input value={location} onChange={(event) => setLocation(event.target.value)} required />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              State
              <Input value={state} onChange={(event) => setState(event.target.value)} required />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Wage
              <Input value={wage} onChange={(event) => setWage(event.target.value)} type="number" min={1} required />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Wage type
              <Input value={wageType} onChange={(event) => setWageType(event.target.value)} required />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Job type
              <Input value={jobType} onChange={(event) => setJobType(event.target.value)} required />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Status
              <Select value={status} onChange={(event) => setStatus(event.target.value as JobPayload["status"])}>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
                <option value="FILLED">Filled</option>
              </Select>
            </label>
          </div>
          <Button className="justify-self-start" disabled={pending || !categoryId || !subcategoryId}>
            <Save className="h-4 w-4" />
            {pending ? "Saving..." : "Save job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
