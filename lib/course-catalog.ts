export type CourseOption = {
  value: string
  label: string
}

export type CourseCatalog = Record<string, Record<string, CourseOption[]>>

export const yearOptions = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
]

export const semesterOptions = [
  { value: '1', label: '1st Semester' },
  { value: '2', label: '2nd Semester' },
]

export const courseCatalogByYearSemester: CourseCatalog = {
  '1': {
    '1': [
      { value: 'CS1010', label: 'CS1010 - Introduction to Computer Science' },
      { value: 'IE1030', label: 'IE1030 - Data Communication and Networks' },
      { value: 'IT1010', label: 'IT1010 - Introduction to Information Technology' },
      { value: 'IT1120', label: 'IT1120 - Introduction to Programming' },
      { value: 'IT1130', label: 'IT1130 - Mathematics for Computing' },
      { value: 'IT1140', label: 'IT1140 - Fundamentals of Computing' },
      { value: 'IT1180', label: 'IT1180 - Effective Academic Communication' },
    ],
    '2': [
      { value: 'IE1011', label: 'IE1011 - Information Systems' },
      { value: 'IT1150', label: 'IT1150 - Technical Writing' },
      { value: 'IT1160', label: 'IT1160 - Discrete Mathematics' },
      { value: 'IT1170', label: 'IT1170 - Data Structures and Algorithms' },
      { value: 'SE1020', label: 'SE1020 - Object Oriented Programming' },
    ],
  },
  '2': {
    '1': [
      { value: 'CS2010', label: 'CS2010 - Data Structures and Algorithms' },
      { value: 'IT2010', label: 'IT2010 - Computer Architecture' },
      { value: 'IT2011', label: 'IT2011 - Artificial Intelligence and Machine Learning' },
      { value: 'IT2120', label: 'IT2120 - Probability and Statistics' },
      { value: 'IT2140', label: 'IT2140 - Database Design and Development' },
      { value: 'SE2030', label: 'SE2030 - Software Engineering' },
    ],
    '2': [
      { value: 'IT2130', label: 'IT2130 - Operating Systems and System Administration' },
      { value: 'IT2150', label: 'IT2150 - IT Project' },
      { value: 'IT2160', label: 'IT2160 - Professional Skills' },
      { value: 'SE2010', label: 'SE2010 - Software Development Methods' },
      { value: 'SE2020', label: 'SE2020 - Web and Mobile Technology' },
    ],
  },
  '3': {
    '1': [
      { value: 'CS3010', label: 'CS3010 - Algorithm Analysis' },
      { value: 'IT3010', label: 'IT3010 - Network Design and Management' },
      { value: 'IT3020', label: 'IT3020 - Database Systems' },
      { value: 'IT3030', label: 'IT3030 - Programming Applications and Frameworks' },
      { value: 'IT3040', label: 'IT3040 - IT Project Management' },
      { value: 'IT3050', label: 'IT3050 - Employability Skills Development - Seminar' },
    ],
    '2': [
      { value: 'AI', label: 'AI - Artificial Intelligence' },
      { value: 'CYBER', label: 'CYBER - Cybersecurity' },
      { value: 'DB', label: 'DB - Database Systems' },
      { value: 'ML', label: 'ML - Machine Learning' },
      { value: 'NW', label: 'NW - Computer Networks' },
      { value: 'OS', label: 'OS - Operating Systems' },
      { value: 'PM', label: 'PM - Project Management' },
      { value: 'SE', label: 'SE - Software Engineering' },
      { value: 'WEB', label: 'WEB - Web Development' },
    ],
  },
  '4': {
    '1': [
      { value: 'IT4060', label: 'IT4060 - Machine Learning' },
      { value: 'IT4070', label: 'IT4070 - Preparation for the Professional World' },
      { value: 'IT4100', label: 'IT4100 - Software Quality Assurance' },
      { value: 'IT4110', label: 'IT4110 - Computer Systems and Network Administration' },
      { value: 'IT4130', label: 'IT4130 - Image Understanding & Processing' },
      { value: 'IT4140', label: 'IT4140 - Industry Placement - 6 Months' },
    ],
    '2': [
      { value: 'CS4010', label: 'CS4010 - Advanced Algorithms' },
      { value: 'IE4040', label: 'IE4040 - Information Assurance and Auditing' },
      { value: 'IT4010', label: 'IT4010 - Research Project' },
      { value: 'IT4020', label: 'IT4020 - Modern Topics in IT' },
      { value: 'IT4030', label: 'IT4030 - Enterprise Systems' },
      { value: 'SE4010', label: 'SE4010 - Software Architecture' },
    ],
  },
}

export type CourseRow = {
  year: number
  semester: number
  subject_code: string
  subject_name: string
}

export const canonicalCourseRows: CourseRow[] = Object.entries(courseCatalogByYearSemester).flatMap(
  ([year, semesters]) =>
    Object.entries(semesters).flatMap(([semester, courses]) =>
      courses.map((course) => ({
        year: Number(year),
        semester: Number(semester),
        subject_code: course.value,
        subject_name: course.label,
      }))
    )
)

export const canonicalCourseKeys = new Set(
  canonicalCourseRows.map((course) => `${course.year}-${course.semester}-${course.subject_code}`)
)

export function getCoursesForYearSemester(year: string, semester: string) {
  return courseCatalogByYearSemester[year]?.[semester] ?? []
}
