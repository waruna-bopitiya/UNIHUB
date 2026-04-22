import { sql } from '@/lib/db'

async function testBadgeSystem() {
  try {
    console.log('🧪 Testing Badge System...\n')

    // 1. Check if trigger exists
    const triggerExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_user_badges'
      ) as trigger_exists
    `
    console.log('✅ Trigger exists:', triggerExists[0].trigger_exists)

    // 2. Check if function exists
    const functionExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'update_user_badges'
      ) as function_exists
    `
    console.log('✅ Function exists:', functionExists[0].function_exists)

    // 3. Test with a sample GPA update
    console.log('\n📝 Testing GPA update with trigger...')
    const testUserId = 'TEST_USER_' + Date.now()
    
    // First insert a test user
    await sql`
      INSERT INTO users (id, email, first_name, second_name)
      VALUES (${testUserId}, 'test@example.com', 'Test', 'User')
      ON CONFLICT DO NOTHING
    `
    
    // Update with GPA that should trigger Gold Scholar badge
    const result = await sql`
      UPDATE users
      SET gpa = 4.0
      WHERE id = ${testUserId}
      RETURNING id, gpa, badges
    `

    console.log('📊 Update result:', {
      id: result[0]?.id,
      gpa: result[0]?.gpa,
      badges: result[0]?.badges,
      badgesArray: Array.isArray(result[0]?.badges) ? result[0]?.badges : 'NOT AN ARRAY'
    })

    // 4. Verify by fetching again
    const verify = await sql`
      SELECT id, gpa, badges FROM users WHERE id = ${testUserId}
    `
    console.log('\n✅ Verification fetch:', {
      id: verify[0]?.id,
      gpa: verify[0]?.gpa,
      badges: verify[0]?.badges
    })

    // Clean up
    await sql`DELETE FROM users WHERE id = ${testUserId}`
    console.log('\n✅ Test user cleaned up')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testBadgeSystem()
