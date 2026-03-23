'use client'

import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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

// Academic structure data
export const yearOptions = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
];

export const semesterOptions = [
  { value: '1', label: '1st Semester' },
  { value: '2', label: '2nd Semester' },
];

export const modulesByYearSemester: Record<string, Record<string, { value: string; label: string }[]>> = {
  '1': {
    '1': [
      { value: 'IT1180', label: 'IT1180 - Effective Academic Communication' },
      { value: 'IT1140', label: 'IT1140 - Fundamentals of Computing' },
      { value: 'IT1130', label: 'IT1130 - Mathematics for Computing' },
      { value: 'IT1120', label: 'IT1120 - Introduction to Programming' },
      { value: 'IE1030', label: 'IE1030 - Data Communication and Networks' },
    ],
    '2': [
      { value: 'SE1020', label: 'SE1020 - Object Oriented Programming' },
      { value: 'IE1011', label: 'IE1011 - Information Systems' },
      { value: 'IT1170', label: 'IT1170 - Data Structures and Algorithms' },
      { value: 'IT1160', label: 'IT1160 - Discrete Mathematics' },
      { value: 'IT1150', label: 'IT1150 - Technical Writing' },
    ],
  },
  '2': {
    '1': [
      { value: 'SE2030', label: 'SE2030 - Software Engineering' },
      { value: 'IT2140', label: 'IT2140 - Database Design and Development' },
      { value: 'IT2120', label: 'IT2120 - Probability and Statistics' },
      { value: 'IT2011', label: 'IT2011 - Artificial Intelligence and Machine Learning' },
    ],
    '2': [
      { value: 'SE2020', label: 'SE2020 - Web and Mobile Technology' },
      { value: 'IT2160', label: 'IT2160 - Professional Skills' },
      { value: 'IT2150', label: 'IT2150 - IT Project' },
      { value: 'IT2130', label: 'IT2130 - Operating Systems and System Administration' },
    ],
  },
  '3': {
    '1': [
      { value: 'IT3050', label: 'IT3050 - Employability Skills Development - Seminar' },
      { value: 'IT3040', label: 'IT3040 - IT Project Management' },
      { value: 'IT3030', label: 'IT3030 - Programming Applications and Frameworks' },
      { value: 'IT3020', label: 'IT3020 - Database Systems' },
      { value: 'IT3010', label: 'IT3010 - Network Design and Management' },
    ],
    '2': [
      { value: 'IT3050', label: 'IT3050 - Employability Skills Development - Seminar' },
      { value: 'IT3040', label: 'IT3040 - IT Project Management' },
      { value: 'IT3030', label: 'IT3030 - Programming Applications and Frameworks' },
      { value: 'IT3020', label: 'IT3020 - Database Systems' },
      { value: 'IT3010', label: 'IT3010 - Network Design and Management' },
    ],
  },
  '4': {
    '1': [
      { value: 'IT4140', label: 'IT4140 - Industry Placement - 6 Months' },
      { value: 'IT4130', label: 'IT4130 - Image Understanding & Processing' },
      { value: 'IT4110', label: 'IT4110 - Computer Systems and Network Administration' },
      { value: 'IT4100', label: 'IT4100 - Software Quality Assurance' },
      { value: 'IT4070', label: 'IT4070 - Preparation for the Professional World' },
      { value: 'IT4060', label: 'IT4060 - Machine Learning' },
      { value: 'IT4020', label: 'IT4020 - Modern Topics in IT' },
      { value: 'IT4010', label: 'IT4010 - Research Project' },
      { value: 'IE4040', label: 'IE4040 - Information Assurance and Auditing' },
    ],
    '2': [
      { value: 'IT4140', label: 'IT4140 - Industry Placement - 6 Months' },
      { value: 'IT4130', label: 'IT4130 - Image Understanding & Processing' },
      { value: 'IT4110', label: 'IT4110 - Computer Systems and Network Administration' },
      { value: 'IT4100', label: 'IT4100 - Software Quality Assurance' },
      { value: 'IT4070', label: 'IT4070 - Preparation for the Professional World' },
      { value: 'IT4060', label: 'IT4060 - Machine Learning' },
      { value: 'IT4020', label: 'IT4020 - Modern Topics in IT' },
      { value: 'IT4010', label: 'IT4010 - Research Project' },
      { value: 'IE4040', label: 'IE4040 - Information Assurance and Auditing' },
    ],
  },
};

export function AcademicSelector({ 
  values, 
  onChange, 
  disabled = false,
  showErrors = false,
  variant = 'default'
}: AcademicSelectorProps) {
  const moduleOptions = values.year && values.semester 
    ? modulesByYearSemester[values.year]?.[values.semester] || [] 
    : [];

  const isDark = variant === 'dark';
  const errorClass = isDark ? 'text-xs text-red-500 mt-1' : 'text-xs text-destructive mt-1';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Year Dropdown */}
      <div>
        <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
          Year <span className="text-red-500">*</span>
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
        <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
          Semester <span className="text-red-500">*</span>
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
        <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
          Module <span className="text-red-500">*</span>
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
