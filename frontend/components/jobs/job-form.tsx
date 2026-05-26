"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { JobPayload } from "@/lib/types";
import { useCategories, useSubcategories } from "@/lib/hooks";

export function JobForm({ initial, onSubmit, pending }: { initial?: Partial<JobPayload>; onSubmit: (payload: JobPayload) => void; pending?: boolean }) {
  const { data: categories = [] } = useCategories();
  const { data: allSubcategories = [] } = useSubcategories();

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [subcategoryId, setSubcategoryId] = useState(initial?.subcategoryId ?? "");

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categoryId, categories]);

  const subcategories = useMemo(() => allSubcategories.filter((sub) => sub.categoryId === categoryId), [allSubcategories, categoryId]);

  useEffect(() => {
    if (subcategories.length > 0) {
      if (!subcategoryId || !subcategories.find(sub => sub.id === subcategoryId)) {
        setSubcategoryId(subcategories[0].id);
      }
    } else {
      if (!initial?.subcategoryId) {
        setSubcategoryId("");
      }
    }
  }, [subcategories, subcategoryId, initial?.subcategoryId]);

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
              <Select value={wageType} onChange={(event) => setWageType(event.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Job type
              <Select value={jobType} onChange={(event) => setJobType(event.target.value)}>
                <option value="full-time">Full-time</option>
                <option value="half-time">Half-time</option>
              </Select>
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
