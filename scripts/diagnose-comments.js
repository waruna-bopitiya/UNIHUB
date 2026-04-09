const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function diagnose() {
  try {
    console.log('🔍 Diagnosing Comments System\n');
    console.log('═'.repeat(60));

    // 1. Check connection
    console.log('\n1️⃣  Testing Database Connection');
    console.log('─'.repeat(60));
    try {
      const connTest = await sql`SELECT NOW() as time`;
      console.log('✅ Database connected');
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      process.exit(1);
    }

    // 2. Check if tables exist
    console.log('\n2️⃣  Checking Table Existence');
    console.log('─'.repeat(60));

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tableNames = tables.map((t: any) => t.table_name);
    console.log('Tables in database:', tableNames.join(', '));

    const hasAnswers = tableNames.includes('answers');
    const hasStudents = tableNames.includes('students');
    const hasComments = tableNames.includes('answer_comments');

    console.log(`answers table: ${hasAnswers ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`students table: ${hasStudents ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`answer_comments table: ${hasComments ? '✅ EXISTS' : '❌ MISSING'}`);

    if (!hasComments) {
      console.log('\n⚠️  answer_comments table does NOT exist!');
      console.log('Run: node scripts/setup-comments-db.js');
      process.exit(1);
    }

    // 3. Check data in tables
    console.log('\n3️⃣  Checking Data in Tables');
    console.log('─'.repeat(60));

    const answerCount = await sql`SELECT COUNT(*) as count FROM answers`;
    const studentCount = await sql`SELECT COUNT(*) as count FROM students`;
    const commentCount = await sql`SELECT COUNT(*) as count FROM answer_comments`;

    console.log(`Answers: ${answerCount[0].count}`);
    console.log(`Students: ${studentCount[0].count}`);
    console.log(`Comments: ${commentCount[0].count}`);

    // 4. Check table structure
    console.log('\n4️⃣  answer_comments Table Structure');
    console.log('─'.repeat(60));

    const columns = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'answer_comments'
      ORDER BY ordinal_position
    `;

    if (columns.length === 0) {
      console.log('❌ No columns found!');
      process.exit(1);
    }

    console.table(columns);

    // 5. Test the query
    console.log('\n5️⃣  Testing Comments Query');
    console.log('─'.repeat(60));

    if (answerCount[0].count === 0) {
      console.log('⚠️  No answers in database - cannot test query');
    } else {
      // Get first answer ID
      const firstAnswer = await sql`SELECT id FROM answers LIMIT 1`;
      const answerId = firstAnswer[0].id;
      
      console.log(`Testing with answer ID: ${answerId}`);

      const testResult = await sql`
        SELECT 
          ac.id, 
          ac.content, 
          ac.user_id, 
          ac.created_at,
          ac.updated_at,
          s.first_name,
          s.avatar_url
        FROM answer_comments ac
        LEFT JOIN students s ON ac.user_id = s.id
        WHERE ac.answer_id = ${answerId}
        ORDER BY ac.created_at ASC
      `;

      console.log(`✅ Query successful - found ${testResult.length} comments`);
      
      if (testResult.length > 0) {
        console.log('\nFirst comment sample:');
        console.log(JSON.stringify(testResult[0], null, 2));
      }
    }

    // 6. Check foreign key constraints
    console.log('\n6️⃣  Checking Foreign Key Constraints');
    console.log('─'.repeat(60));

    const constraints = await sql`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'answer_comments'
    `;

    if (constraints.length === 0) {
      console.log('❌ No constraints found');
    } else {
      console.table(constraints);
    }

    // 7. Check indexes
    console.log('\n7️⃣  Checking Indexes');
    console.log('─'.repeat(60));

    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'answer_comments'
    `;

    if (indexes.length === 0) {
      console.log('⚠️  No indexes found');
    } else {
      indexes.forEach((idx: any) => {
        console.log(`✅ ${idx.indexname}`);
      });
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Diagnosis Complete!\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('\n📝 The answer_comments table needs to be created.');
      console.log('Run: node scripts/setup-comments-db.js');
    }
    process.exit(1);
  }
}

diagnose();
