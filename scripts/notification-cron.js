/**
 * Local Cron Job for Notification Checking
 * 
 * Installation: npm install node-cron
 * Usage: node scripts/notification-cron.js
 * 
 * This script will check for upcoming streams every minute and create notifications
 */

const cron = require('node-cron')

const NEXT_APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const CHECK_INTERVAL = '* * * * *' // Every minute

console.log(`🔔 Notification Cron Job Started`)
console.log(`📍 Target URL: ${NEXT_APP_URL}/api/notifications/check-streams`)
console.log(`⏱️  Check interval: Every minute`)
console.log(`-------------------------------------------`)

// Run every minute
cron.schedule(CHECK_INTERVAL, async () => {
  const timestamp = new Date().toISOString()
  
  try {
    console.log(`\n[${timestamp}] 🔍 Checking for upcoming streams...`)
    
    const response = await fetch(`${NEXT_APP_URL}/api/notifications/check-streams`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`❌ Error: HTTP ${response.status}`)
      return
    }

    const data = await response.json()
    
    if (data.success) {
      console.log(`✅ Success:`)
      console.log(`   📊 Streams processed: ${data.streamsProcessed}`)
      console.log(`   📧 Notifications created: ${data.notificationsCreated}`)
      console.log(`   💬 Message: ${data.message}`)
    } else {
      console.error(`❌ Error: ${data.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error(`❌ Error checking streams: ${error.message}`)
  }
})

console.log(`✨ Cron job is now running. Press Ctrl+C to stop.`)
