#!/usr/bin/env node

/**
 * Verify users and answers exist in the database
 */

const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('\n❌ DATABASE_URL is not set!');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function verify() {
  try {
    console.log('\n🔍 Database Verification\n');
    console.log('═'.repeat(50));

    // Check students table
    console.log('\n📌 STUDENTS TABLE:');
    const students = await sql`SELECT COUNT(*) as total FROM students`;
    console.log(`   Total students: ${students[0].total}`);

    if (students[0].total > 0) {
      const first5 = await sql`SELECT id, first_name, email FROM students LIMIT 5`;
      console.log('\n   First 5 students:');
      first5.forEach(s => {
        console.log(`     • ${s.id} - ${s.first_name} (${s.email})`);
      });
    }

    // Check answers table
    console.log('\n📌 ANSWERS TABLE:');
    const answers = await sql`SELECT COUNT(*) as total FROM answers`;
    console.log(`   Total answers: ${answers[0].total}`);

    if (answers[0].total > 0) {
      const first5 = await sql`SELECT id, created_by, content FROM answers LIMIT 5`;
      console.log('\n   First 5 answers:');
      first5.forEach(a => {
        console.log(`     • ID: ${a.id}, By: ${a.created_by}`);
        console.log(`       Content: ${a.content.substring(0, 50)}...`);
      });
    }

    // Check comments table
    console.log('\n📌 COMMENTS TABLE:');
    const comments = await sql`SELECT COUNT(*) as total FROM answer_comments`;
    console.log(`   Total comments: ${comments[0].total}`);

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('✅ Database looks good!\n');

    if (students[0].total === 0) {
      console.log('⚠️  IMPORTANT: No students in database!');
      console.log('   Make sure you sign up and create an account first.\n');
    }

    if (answers[0].total === 0) {
      console.log('⚠️  IMPORTANT: No answers in database!');
      console.log('   Make sure you create an answer to a question first.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

verify();
