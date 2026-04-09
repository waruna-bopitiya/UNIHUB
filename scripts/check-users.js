#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('\n❌ DATABASE_URL is not set!');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function checkTables() {
  try {
    console.log('\n📋 Users Table Schema\n');

    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;

    console.log('Columns:');
    columns.forEach(col => {
      console.log(`  • ${col.column_name}: ${col.data_type}`);
    });

    // Sample users
    const users = await sql`SELECT id, email FROM users LIMIT 3`;
    console.log('\nSample users:');
    users.forEach(u => {
      console.log(`  • ${u.id} - ${u.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

checkTables();
