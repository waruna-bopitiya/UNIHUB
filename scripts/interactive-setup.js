#!/usr/bin/env node

/**
 * Interactive setup guide for comments system
 * Run with: node scripts/interactive-setup.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║    UNIHUB Comments System Setup                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Step 1: Check DATABASE_URL
  console.log('📋 Step 1: Check DATABASE_URL Environment Variable');
  console.log('─'.repeat(50));
  
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    console.log('✅ DATABASE_URL is set');
    console.log(`   Host: ${dbUrl.split('@')[1]?.split('/')[0] || 'Unknown'}`);
  } else {
    console.log('❌ DATABASE_URL is NOT set\n');
    console.log('📌 How to set it in PowerShell:');
    console.log('   $env:DATABASE_URL = "postgresql://user:pass@host/db?sslmode=require"\n');
    
    const shouldContinue = await question('Do you have your DATABASE_URL ready? (y/n): ');
    if (shouldContinue.toLowerCase() !== 'y') {
      console.log('\n📍 Get your DATABASE_URL from: https://console.neon.tech');
      console.log('Then set it and run this script again.\n');
      rl.close();
      process.exit(0);
    }
  }

  rl.close();

  // Step 2: Test connection
  console.log('\n📋 Step 2: Test Database Connection');
  console.log('─'.repeat(50));
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not set. Please set it first:\n');
    console.log('$env:DATABASE_URL = "your-connection-string"\n');
    process.exit(1);
  }

  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔐 Connecting...');
    const result = await sql`SELECT NOW() as time`;
    console.log('✅ Connected successfully!\n');

    // Step 3: Check/Create table
    console.log('📋 Step 3: Setup Comments Table');
    console.log('─'.repeat(50));

    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'answer_comments'
      )
    `;

    if (!tableExists[0].exists) {
      console.log('📝 Creating answer_comments table...');
      
      await sql`
        CREATE TABLE answer_comments (
          id SERIAL PRIMARY KEY,
          answer_id INTEGER NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
          user_id VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await sql`CREATE INDEX idx_answer_comments_answer_id ON answer_comments(answer_id)`;
      await sql`CREATE INDEX idx_answer_comments_user_id ON answer_comments(user_id)`;
      
      console.log('✅ Table created successfully!\n');
    } else {
      console.log('✅ Table already exists\n');
    }

    // Step 4: Show summary
    console.log('📋 Step 4: Summary');
    console.log('─'.repeat(50));
    
    const stats = await sql`
      SELECT 
        COUNT(*) as total_comments,
        COUNT(DISTINCT answer_id) as answers_with_comments
      FROM answer_comments
    `;

    console.log('✅ Setup Complete!\n');
    console.log('📊 Database Stats:');
    console.log(`   Total Comments: ${stats[0].total_comments}`);
    console.log(`   Answers with Comments: ${stats[0].answers_with_comments}\n`);
    
    console.log('🎉 Your comment system is ready to use!');
    console.log('\n✨ Features enabled:');
    console.log('   ✓ Create comments');
    console.log('   ✓ Edit comments');
    console.log('   ✓ Delete comments');
    console.log('   ✓ Auto-refresh');
    console.log('   ✓ Toast notifications\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your DATABASE_URL is correct');
    console.error('2. Make sure the database is accessible');
    console.error('3. Verify answers table exists\n');
    process.exit(1);
  }
}

main();
