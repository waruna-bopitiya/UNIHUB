#!/usr/bin/env node

/**
 * List all tables in the database
 */

const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('\n❌ DATABASE_URL is not set!');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function listTables() {
  try {
    console.log('\n📊 Database Tables\n');
    console.log('═'.repeat(50));

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('\nPublic tables:');
    tables.forEach(t => {
      console.log(`  ✓ ${t.table_name}`);
    });

    console.log(`\nTotal tables: ${tables.length}\n`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

listTables();
