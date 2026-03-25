'use client'


import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { yearOptions, semesterOptions, modulesByYearSemester } from '@/components/shared/academic-selector';


type CmpYesSemMod = {
  year: string;
  semester: string;
  module_name: string;
};


const resourceSchema = z.object({
  year: z.string().min(1, 'Year is required'),
  semester: z.string().min(1, 'Semester is required'),
  module_name: z.string().min(1, 'Module is required'),
  name: z.string().min(1, 'Resource name is required'),
  resourceType: z.enum(['file', 'link']),
  file: z.any().optional(),
  link: z.string().url('Enter a valid URL').optional(),
}).refine((data) => (data.resourceType === 'file' ? data.file instanceof File : !!data.link), {
  message: 'File or link is required',
  path: ['file'],
});

type Resource = z.infer<typeof resourceSchema> & { ratings: number[]; review?: string };

// Dummy data for cmp_yes_sem_mod (replace with real data or fetch from backend)
const cmpYesSemMod: CmpYesSemMod[] = [
  
];

const initialResources: Resource[] = [];


export default function ResourcesPage() {

  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [filter, setFilter] = useState<{ year: string; semester: string; module_name: string }>({ year: '', semester: '', module_name: '' });
  const [showForm, setShowForm] = useState(false);
  const [resourceType, setResourceType] = useState<'file' | 'link'>('file');

  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      year: '',
      semester: '',
      module_name: '',
      name: '',
      resourceType: 'file',
      file: undefined,
      link: '',
    },
  });

  function onSubmit(values: z.infer<typeof resourceSchema>) {
    setResources((prev) => [
      ...prev,
      { ...values, ratings: [] },
    ]);
    form.reset();
    setResourceType('file');
    setShowForm(false);
  }

  // Handle rating
  const handleRate = (idx: number, rating: number) => {
    setResources((prev) =>
      prev.map((res, i) =>
        i === idx ? { ...res, ratings: [...res.ratings, rating] } : res
      )
    );
  };

  // Filtered resources
  // Categorize resources by module_name
  const categorized = resources.reduce((acc: Record<string, Resource[]>, res) => {
    if (!acc[res.module_name]) acc[res.module_name] = [];
    acc[res.module_name].push(res);
    return acc;
  }, {});

  const filtered = resources.filter(
    (r) =>
      (!filter.year || r.year === filter.year) &&
      (!filter.semester || r.semester === filter.semester) &&
      (!filter.module_name || r.module_name === filter.module_name)
  );

  // Top resource (highest avg rating)
  const topResource = filtered.length
    ? [...filtered].sort((a, b) => {
        const avgA = a.ratings.length ? a.ratings.reduce((x, y) => x + y, 0) / a.ratings.length : 0;
        const avgB = b.ratings.length ? b.ratings.reduce((x, y) => x + y, 0) / b.ratings.length : 0;
        return avgB - avgA;
      })[0]
    : null;

  // Helper to render stars
  function renderStars(avg: number, onRate?: (rating: number) => void) {
    return (
      <span className="flex items-center gap-1">
        {[1,2,3,4,5].map((star) => (
          <Star
            key={star}
            size={20}
            className={
              (avg >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300') +
              (onRate ? ' cursor-pointer hover:scale-110 transition-transform' : '')
            }
            fill={avg >= star ? '#facc15' : 'none'}
            strokeWidth={1.5}
            onClick={onRate ? () => onRate(star) : undefined}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{avg ? avg.toFixed(2) : 'N/A'}</span>
      </span>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-primary">Resources</h1>
        {/* Add Resource Button and Form */}
        {!showForm && (
          <div className="flex justify-end mb-8">
            <Button size="lg" onClick={() => setShowForm(true)}>
              Add Resource
            </Button>
          </div>
        )}
        {showForm && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 bg-card border rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Add Resource</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Year Dropdown */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue('semester', '');
                          form.setValue('module_name', '');
                        }}
                        value={field.value}
                        defaultValue=""
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((y) => (
                            <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Semester Dropdown */}
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue('module_name', '');
                        }}
                        value={field.value}
                        defaultValue=""
                        disabled={!form.watch('year')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesterOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Module Dropdown (depends on year and semester) */}
                <FormField
                  control={form.control}
                  name="module_name"
                  render={({ field }) => {
                    const year = form.watch('year');
                    const semester = form.watch('semester');
                    const moduleOptions = year && semester ? modulesByYearSemester[year]?.[semester] || [] : [];
                    return (
                      <FormItem>
                        <FormLabel>Module</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue=""
                          disabled={!year || !semester}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Module" />
                          </SelectTrigger>
                          <SelectContent>
                            {moduleOptions.map((m) => (
                              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Resource Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Resource Type Switch */}
                <div className="col-span-1 md:col-span-2 flex gap-6 items-center mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resourceType"
                      value="file"
                      checked={resourceType === 'file'}
                      onChange={() => {
                        setResourceType('file');
                        form.setValue('resourceType', 'file');
                      }}
                    />
                    <span>Upload File</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resourceType"
                      value="link"
                      checked={resourceType === 'link'}
                      onChange={() => {
                        setResourceType('link');
                        form.setValue('resourceType', 'link');
                      }}
                    />
                    <span>Resource Link</span>
                  </label>
                </div>
                {/* File or Link Input */}
                {resourceType === 'file' ? (
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload Resource</FormLabel>
                        <FormControl>
                          <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/resource" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="w-50% md:w-auto" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Adding...' : 'Add Resource'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Form>
        )}

        {/* Filter Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Filter Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="mb-1 block">Year</Label>
              <select className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary transition" value={filter.year} onChange={(e) => setFilter({ year: e.target.value, semester: '', module_name: '' })}>
                <option value="">Select Year</option>
                {yearOptions.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1 block">Semester</Label>
                <select className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary transition" value={filter.semester} onChange={(e) => setFilter((f) => ({ ...f, semester: e.target.value, module_name: '' }))} disabled={!filter.year}>
                  <option value="">Select Semester</option>
                  {semesterOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
            </div>
            <div>
              <Label className="mb-1 block">Module</Label>
                <select className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary transition" value={filter.module_name} onChange={(e) => setFilter((f) => ({ ...f, module_name: e.target.value }))} disabled={!filter.year || !filter.semester}>
                  <option value="">Select Module</option>
                  {(filter.year && filter.semester ? (modulesByYearSemester[filter.year]?.[filter.semester] || []) : []).map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
            </div>
          </div>
        </div>

        {/* Top Resource */}
        {topResource && (
          <div className="border-2 border-primary rounded-xl p-6 mb-10 bg-card shadow-lg">
            <div className="font-bold text-xl mb-2 text-primary">Top Resource: {topResource.name}</div>
            <div className="text-sm mb-2 text-muted-foreground">Year: {topResource.year}, Semester: {topResource.semester}, Module: {topResource.module_name}</div>
            <div className="mb-3">{renderStars(
              topResource.ratings.length ? topResource.ratings.reduce((a: number, b: number) => a + b, 0) / topResource.ratings.length : 0
            )}</div>
            {topResource.review && <div className="italic text-base mb-2 text-gray-700">Review: {topResource.review}</div>}
            {topResource.file && <div><a className="text-primary underline font-medium" href={URL.createObjectURL(topResource.file)} download={topResource.name}>Download</a></div>}
          </div>
        )}

        {/* All Resources in a Single Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Resources List</h2>
          {filtered.length === 0 && <p className="text-muted-foreground">No resources found.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((res, idx) => {
              const avg = res.ratings.length ? res.ratings.reduce((a: number, b: number) => a + b, 0) / res.ratings.length : 0;
              return (
                <div key={res.name + idx} className="border rounded-xl p-6 bg-card flex flex-col justify-between h-full shadow-sm hover:shadow-lg transition-shadow">
                  <div>
                    <div className="font-semibold text-lg mb-2 text-primary truncate" title={res.name}>{res.name}</div>
                    <div className="text-sm mb-2 text-muted-foreground">Year: {res.year}, Semester: {res.semester}, Module: {res.module_name}</div>
                    <div className="mb-3">{renderStars(avg, (rating) => handleRate(resources.indexOf(res), rating))}</div>
                    {res.review && <div className="italic text-base mb-2 text-gray-700">Review: {res.review}</div>}
                  </div>
                  {res.resourceType === 'file' && res.file && (
                    <div><a className="text-primary underline font-medium" href={URL.createObjectURL(res.file)} download={res.name}>Download</a></div>
                  )}
                  {res.resourceType === 'link' && res.link && (
                    <div><a className="text-primary underline font-medium" href={res.link} target="_blank" rel="noopener noreferrer">Visit Link</a></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
