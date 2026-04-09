const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_uyD6fYP8pxcz@ep-lucky-fog-adx4lmgy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function verify() {
  try {
    console.log('Verifying tutors table...');
    const tables = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tutors'
      ) as exists;
    `;
    
    if (tables[0]?.exists) {
      console.log('✅ SUCCESS! Tutors table exists in Neon database');
      console.log('');
      console.log('Table is ready for:');
      console.log('  • Storing tutor applications');
      console.log('  • Auto-filling user data (fullName, email)');
      console.log('  • Saving degree program, CGPA, experience, bio, expertise areas');
    } else {
      console.log('❌ Table not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verify();
