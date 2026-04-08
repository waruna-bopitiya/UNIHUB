# Live Stream Reminder System - Implementation Guide

## Overview
Users can now set reminders for upcoming live sessions. When a reminder is set, they'll receive notifications 30 minutes before the session starts and immediately when it goes live.

## Features

✅ **Set/Remove Reminders** - Users can easily toggle reminders on upcoming sessions  
✅ **Automatic Notifications** - Notifications sent 30 minutes before stream starts  
✅ **Live Notifications** - Manual notifications when stream goes live  
✅ **Unread Tracking** - Notifications remain unread until user views them  
✅ **Notification History** - All reminders stored in user's notification panel  

## User Journey

### 1. Setting a Reminder
- User navigates to **Kuppi Live** page
- Finds an **upcoming live session** in the grid
- Clicks **"Set Reminder"** button
- Confirmation toast appears: "Reminder set for [Stream Title]"
- Button changes to show active state with filled bell icon

### 2. Receiving Notifications
- 30 minutes before stream starts: Automated notification
- When stream goes live: Manual notification (via API)
- User sees notification in bell icon (red badge with count)
- Notifications appear in notification panel

### 3. Managing Reminders
- User can view all set reminders via their profile
- Click reminder to jump to live session
- Remove reminders individually from live page
- Clear notifications from notification panel

## API Endpoints

### 1. **POST /api/live/reminders**
Set or remove a reminder for a user

**Request:**
```json
{
  "userId": "student_123",
  "streamId": 5,
  "action": "set" // or "remove"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reminder set successfully"
}
```

### 2. **GET /api/live/reminders**
Check if user has reminder for a stream

**Query Parameters:**
- `userId` (required): The student's ID
- `streamId` (optional): Check specific stream reminder status

**Response:**
```json
{
  "hasReminder": true
}
```

### 3. **POST /api/live/reminders/notify**
Send notifications to all users with reminders for a stream

**Request:**
```json
{
  "streamId": 5,
  "eventType": "live" // or "starting_soon"
}
```

**Response:**
```json
{
  "success": true,
  "notificationsSent": 12,
  "message": "Notifications sent to 12 users"
}
```

### 4. **GET /api/live/reminders/notify**
Cron job - automatically send reminders 30 minutes before streams start

**Query Parameters:**
- `key`: CRON_SECRET environment variable (for authentication)

## Integration Points

### On Upcoming Sessions Grid
```tsx
<SetReminder
  streamId={session.id}
  streamTitle={session.title}
  size="md"
  variant="outline"
  showLabel={true}
/>
```

### On Featured Stream Player
```tsx
{featuredStream.status !== 'live' && (
  <SetReminder
    streamId={featuredStream.id}
    streamTitle={featuredStream.title}
    size="md"
    variant="outline"
    showLabel={true}
  />
)}
```

## Database Schema

### Table: `live_stream_reminders`
```sql
CREATE TABLE live_stream_reminders (
  id              SERIAL PRIMARY KEY,
  user_id         VARCHAR(50)   NOT NULL,
  stream_id       INTEGER       NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, stream_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (stream_id) REFERENCES live_streams(id) ON DELETE CASCADE
)
```

### Indexes
- `idx_live_stream_reminders_user_id` - Fast lookup of user reminders
- `idx_live_stream_reminders_stream_id` - Fast lookup of stream reminders
- `idx_live_stream_reminders_created_at` - Sort by creation date

## Setting Up Automatic Reminders

### Option 1: Cron Job (Recommended for Production)
Set up a scheduled task to call the reminder endpoint every 5 minutes:

```bash
# Every 5 minutes
*/5 * * * * curl "https://yourdomain.com/api/live/reminders/notify?key=YOUR_CRON_SECRET"
```

**Environment Variable:**
```env
CRON_SECRET=your_secure_random_key
```

### Option 2: Manual Trigger (Development)
When stream goes live, manually call:

```bash
curl -X POST https://yourdomain.com/api/live/reminders/notify \
  -H "Content-Type: application/json" \
  -d '{"streamId": 5, "eventType": "live"}'
```

## Notification Types

### Type: `live_stream_reminder`
Used for all reminder notifications

**Example Notifications:**
1. **30-minute reminder**: "Your class Computer Science 101 starts in 30 minutes!"
2. **Live notification**: "Computer Science 101 is now live! Click to watch."
3. **Generic reminder**: "Don't miss Computer Science 101!"

## User Experience

### Visual States

**Button States:**
- **Inactive** 🔔 Off - "Set Reminder"
- **Active** 🔔 Filled - "Reminder Set" (blue highlight)

**Notification Badge:**
- Shows count of unread notifications
- Red badge: `bg-destructive` / `text-destructive-foreground`

## Best Practices

✅ **Always check user is logged in** before setting reminder  
✅ **Show confirmation toast** after reminder action  
✅ **Handle network errors gracefully** with user feedback  
✅ **Disable button during loading** to prevent duplicate requests  
✅ **Update UI immediately** for perceived performance  
✅ **Cache reminder state** in component to avoid duplicate API calls  

## Example: Full Implementation

### 1. User clicks "Set Reminder"
```tsx
const handleSetReminder = async () => {
  if (!userId) {
    toast({ title: 'Please log in' })
    return
  }
  
  setLoading(true)
  try {
    const response = await fetch('/api/live/reminders', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        streamId,
        action: hasReminder ? 'remove' : 'set'
      })
    })
    
    if (response.ok) {
      setHasReminder(!hasReminder)
      toast({ title: 'Reminder ' + (hasReminder ? 'removed' : 'set') })
    }
  } finally {
    setLoading(false)
  }
}
```

### 2. System sends automatic notification
```
30 minutes before stream start time
➜ Cron triggers /api/live/reminders/notify?key=SECRET
➜ Finds all streams starting in next 5-minute window
➜ Creates notification for each user with reminder
➜ User sees unread notification in bell icon
```

### 3. User views notification
```
User clicks notification
➜ Mark as read
➜ Navigate to live session
➜ Can watch stream or manage reminder
```

## Troubleshooting

### Reminders not sending
1. Check `CRON_SECRET` is set in environment
2. Verify cron job is running: `GET /api/live/reminders/notify?key=...`
3. Check database: `SELECT COUNT(*) FROM live_stream_reminders`
4. Check notifications table for created records

### User doesn't see reminder
1. Verify notification was created: `SELECT * FROM notifications`
2. Check notification's `user_id` matches logged-in user
3. Verify notification is marked `is_read = false`
4. Clear browser cache and refresh

### Button state incorrect
1. Re-check reminder status: `GET /api/live/reminders?userId=...&streamId=...`
2. Verify component mounted state
3. Check localStorage for userId

## Future Enhancements

- 🔔 Add email notifications for reminders
- ⏰ Allow users to customize notification time (15/30/60 min before)
- 📧 Digest notifications for multiple reminders
- 🔔 Push notifications for mobile users
- 👥 Group reminders by module/instructor
- 📊 Analytics on reminder usage

