const fs = require('fs')
const path = require('path')
const { neon } = require('@neondatabase/serverless')

function loadDatabaseUrl() {
  const envPath = path.join(process.cwd(), '.env.local')
  const envText = fs.readFileSync(envPath, 'utf8')
  const line = envText.split(/\r?\n/).find((entry) => entry.startsWith('DATABASE_URL='))

  if (!line) {
    throw new Error('DATABASE_URL not found in .env.local')
  }

  return line.slice('DATABASE_URL='.length)
}

const rows = [
  { year: 1, semester: 1, subject_code: 'CS1010', subject_name: 'CS1010 - Introduction to Computer Science' },
  { year: 1, semester: 1, subject_code: 'IE1030', subject_name: 'IE1030 - Data Communication and Networks' },
  { year: 1, semester: 1, subject_code: 'IT1010', subject_name: 'IT1010 - Introduction to Information Technology' },
  { year: 1, semester: 1, subject_code: 'IT1120', subject_name: 'IT1120 - Introduction to Programming' },
  { year: 1, semester: 1, subject_code: 'IT1130', subject_name: 'IT1130 - Mathematics for Computing' },
  { year: 1, semester: 1, subject_code: 'IT1140', subject_name: 'IT1140 - Fundamentals of Computing' },
  { year: 1, semester: 1, subject_code: 'IT1180', subject_name: 'IT1180 - Effective Academic Communication' },
  { year: 1, semester: 2, subject_code: 'IE1011', subject_name: 'IE1011 - Information Systems' },
  { year: 1, semester: 2, subject_code: 'IT1150', subject_name: 'IT1150 - Technical Writing' },
  { year: 1, semester: 2, subject_code: 'IT1160', subject_name: 'IT1160 - Discrete Mathematics' },
  { year: 1, semester: 2, subject_code: 'IT1170', subject_name: 'IT1170 - Data Structures and Algorithms' },
  { year: 1, semester: 2, subject_code: 'SE1020', subject_name: 'SE1020 - Object Oriented Programming' },
  { year: 2, semester: 1, subject_code: 'CS2010', subject_name: 'CS2010 - Data Structures and Algorithms' },
  { year: 2, semester: 1, subject_code: 'IT2010', subject_name: 'IT2010 - Computer Architecture' },
  { year: 2, semester: 1, subject_code: 'IT2011', subject_name: 'IT2011 - Artificial Intelligence and Machine Learning' },
  { year: 2, semester: 1, subject_code: 'IT2120', subject_name: 'IT2120 - Probability and Statistics' },
  { year: 2, semester: 1, subject_code: 'IT2140', subject_name: 'IT2140 - Database Design and Development' },
  { year: 2, semester: 1, subject_code: 'SE2030', subject_name: 'SE2030 - Software Engineering' },
  { year: 2, semester: 2, subject_code: 'IT2130', subject_name: 'IT2130 - Operating Systems and System Administration' },
  { year: 2, semester: 2, subject_code: 'IT2150', subject_name: 'IT2150 - IT Project' },
  { year: 2, semester: 2, subject_code: 'IT2160', subject_name: 'IT2160 - Professional Skills' },
  { year: 2, semester: 2, subject_code: 'SE2010', subject_name: 'SE2010 - Software Development Methods' },
  { year: 2, semester: 2, subject_code: 'SE2020', subject_name: 'SE2020 - Web and Mobile Technology' },
  { year: 3, semester: 1, subject_code: 'CS3010', subject_name: 'CS3010 - Algorithm Analysis' },
  { year: 3, semester: 1, subject_code: 'IT3010', subject_name: 'IT3010 - Network Design and Management' },
  { year: 3, semester: 1, subject_code: 'IT3020', subject_name: 'IT3020 - Database Systems' },
  { year: 3, semester: 1, subject_code: 'IT3030', subject_name: 'IT3030 - Programming Applications and Frameworks' },
  { year: 3, semester: 1, subject_code: 'IT3040', subject_name: 'IT3040 - IT Project Management' },
  { year: 3, semester: 1, subject_code: 'IT3050', subject_name: 'IT3050 - Employability Skills Development - Seminar' },
  { year: 3, semester: 2, subject_code: 'AI', subject_name: 'AI - Artificial Intelligence' },
  { year: 3, semester: 2, subject_code: 'CYBER', subject_name: 'CYBER - Cybersecurity' },
  { year: 3, semester: 2, subject_code: 'DB', subject_name: 'DB - Database Systems' },
  { year: 3, semester: 2, subject_code: 'ML', subject_name: 'ML - Machine Learning' },
  { year: 3, semester: 2, subject_code: 'NW', subject_name: 'NW - Computer Networks' },
  { year: 3, semester: 2, subject_code: 'OS', subject_name: 'OS - Operating Systems' },
  { year: 3, semester: 2, subject_code: 'PM', subject_name: 'PM - Project Management' },
  { year: 3, semester: 2, subject_code: 'SE', subject_name: 'SE - Software Engineering' },
  { year: 3, semester: 2, subject_code: 'WEB', subject_name: 'WEB - Web Development' },
  { year: 4, semester: 1, subject_code: 'IT4060', subject_name: 'IT4060 - Machine Learning' },
  { year: 4, semester: 1, subject_code: 'IT4070', subject_name: 'IT4070 - Preparation for the Professional World' },
  { year: 4, semester: 1, subject_code: 'IT4100', subject_name: 'IT4100 - Software Quality Assurance' },
  { year: 4, semester: 1, subject_code: 'IT4110', subject_name: 'IT4110 - Computer Systems and Network Administration' },
  { year: 4, semester: 1, subject_code: 'IT4130', subject_name: 'IT4130 - Image Understanding & Processing' },
  { year: 4, semester: 1, subject_code: 'IT4140', subject_name: 'IT4140 - Industry Placement - 6 Months' },
  { year: 4, semester: 2, subject_code: 'CS4010', subject_name: 'CS4010 - Advanced Algorithms' },
  { year: 4, semester: 2, subject_code: 'IE4040', subject_name: 'IE4040 - Information Assurance and Auditing' },
  { year: 4, semester: 2, subject_code: 'IT4010', subject_name: 'IT4010 - Research Project' },
  { year: 4, semester: 2, subject_code: 'IT4020', subject_name: 'IT4020 - Modern Topics in IT' },
  { year: 4, semester: 2, subject_code: 'IT4030', subject_name: 'IT4030 - Enterprise Systems' },
  { year: 4, semester: 2, subject_code: 'SE4010', subject_name: 'SE4010 - Software Architecture' },
]

function escapeSql(value) {
  return String(value).replace(/'/g, "''")
}

async function main() {
  const databaseUrl = loadDatabaseUrl()
  const sql = neon(databaseUrl)

  const before = await sql.query('SELECT COUNT(*)::int AS count FROM subject4years')

  await sql.query('DELETE FROM subject4years')

  for (const row of rows) {
    const query =
      'INSERT INTO subject4years (year, semester, subject_code, subject_name) VALUES (' +
      row.year +
      ', ' +
      row.semester +
      ", '" +
      escapeSql(row.subject_code) +
      "', '" +
      escapeSql(row.subject_name) +
      "')"

    await sql.query(query)
  }

  const after = await sql.query('SELECT COUNT(*)::int AS count FROM subject4years')

  console.log(
    JSON.stringify(
      {
        before: before[0]?.count ?? null,
        after: after[0]?.count ?? null,
        inserted: rows.length,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
