'use client'

import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getCoursesForYearSemester, semesterOptions, yearOptions } from '@/lib/course-catalog';

export type AcademicData = {
  year: string;
  semester: string;
  module_name: string;
};

type AcademicSelectorProps = {
  values: AcademicData;
  onChange: (field: keyof AcademicData, value: string) => void;
  disabled?: boolean;
  showErrors?: boolean;
  variant?: 'default' | 'dark'; // For styling variants
};

export function AcademicSelector({ 
  values, 
  onChange, 
  disabled = false,
  showErrors = false,
  variant = 'default'
}: AcademicSelectorProps) {
  const moduleOptions = values.year && values.semester 
    ? getCoursesForYearSemester(values.year, values.semester) 
    : [];

  const isDark = variant === 'dark';
  const errorClass = 'text-xs text-destructive mt-1';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Year Dropdown */}
      <div>
        <label className="block text-xs font-bold uppercase mb-2 text-muted-foreground">
          Year <span className="text-destructive">*</span>
        </label>
        <Select
          value={values.year}
          onValueChange={(val) => onChange('year', val)}
          disabled={disabled}
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
        {showErrors && !values.year && (
          <div className={errorClass}>Year is required</div>
        )}
      </div>

      {/* Semester Dropdown */}
      <div>
        <label className="block text-xs font-bold uppercase mb-2 text-muted-foreground">
          Semester <span className="text-destructive">*</span>
        </label>
        <Select
          value={values.semester}
          onValueChange={(val) => onChange('semester', val)}
          disabled={disabled || !values.year}
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
        {showErrors && !values.semester && (
          <div className={errorClass}>Semester is required</div>
        )}
      </div>

      {/* Module Dropdown */}
      <div>
        <label className="block text-xs font-bold uppercase mb-2 text-muted-foreground">
          Module <span className="text-destructive">*</span>
        </label>
        <Select
          value={values.module_name}
          onValueChange={(val) => onChange('module_name', val)}
          disabled={disabled || !values.year || !values.semester}
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
        {showErrors && !values.module_name && (
          <div className={errorClass}>Module is required</div>
        )}
      </div>
    </div>
  );
}
