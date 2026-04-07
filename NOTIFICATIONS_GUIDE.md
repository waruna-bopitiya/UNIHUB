# Live Stream Notification System

This system automatically sends notifications to all students 15 minutes before a scheduled live stream starts.

## Features

- ✅ Automatic 15-minute pre-stream notifications
- ✅ Notification bell in top-bar with unread count
- ✅ Mark notifications as read/unread
- ✅ Delete individual notifications  
- ✅ Auto-refresh every 30 seconds
- ✅ Database tracking to prevent duplicate notifications
- ✅ Real-time notification dropdown

## Database Schema

### Tables Created

#### `notifications`
Stores all notifications for users.

```sql
- id (SERIAL PRIMARY KEY)
- user_id (VARCHAR(50), FOREIGN KEY → users)
- type (VARCHAR(50), default: 'live_stream_reminder')
- title (VARCHAR(500))
- message (TEXT)
- related_stream_id (INTEGER, FOREIGN KEY → live_streams)
- is_read (BOOLEAN, default: false)
- read_at (TIMESTAMPTZ, nullable)
- created_at (TIMESTAMPTZ, default: NOW())
```

#### `live_stream_notification_status`
Tracks which streams have already sent 15-minute reminders.

```sql
- id (SERIAL PRIMARY KEY)
- stream_id (INTEGER UNIQUE, FOREIGN KEY → live_streams)
- reminder_sent (BOOLEAN, default: false)
- reminder_sent_at (TIMESTAMPTZ, nullable)
```

## API Endpoints

### 1. Get Notifications
**GET** `/api/notifications?userId=<user_id>&isRead=<boolean>&limit=50`

Fetches notifications for a user.

**Query Parameters:**
- `userId` (required): User ID
- `isRead` (optional): Filter by read status (true/false)
- `limit` (optional): Number of notifications to fetch (default: 50)

**Response:**
```json
[
  {
    "id": 1,
    "user_id": "user123",
    "type": "live_stream_reminder",
    "title": "Live Stream Starting Soon",
    "message": "🔴 Physics Lecture starts in 15 minutes!",
    "related_stream_id": 5,
    "is_read": false,
    "read_at": null,
    "created_at": "2026-04-06T10:00:00Z",
    "stream_title": "Physics Lecture",
    "scheduled_start_time": "2026-04-06T10:15:00Z",
    "module_name": "Physics 101"
  }
]
```

### 2. Create Notification
**POST** `/api/notifications`

Manually create a notification (admin use).

**Request Body:**
```json
{
  "userId": "user123",
  "type": "live_stream_reminder",
  "title": "Live Stream Starting Soon",
  "message": "Physics Lecture starts in 15 minutes!",
  "relatedStreamId": 5
}
```

### 3. Mark as Read/Unread
**PATCH** `/api/notifications/:id`

Mark a notification as read or unread.

**Request Body:**
```json
{
  "isRead": true
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": "user123",
  "is_read": true,
  "read_at": "2026-04-06T10:05:30Z",
  ...
}
```

### 4. Delete Notification
**DELETE** `/api/notifications/:id`

Delete a notification.

**Response:**
```json
{
  "success": true,
  "id": 1
}
```

### 5. Check for Upcoming Streams
**POST** `/api/notifications/check-streams`

Triggers the notification check for all streams starting within the next 15 minutes. This endpoint should be called periodically (every minute).

**Response:**
```json
{
  "success": true,
  "message": "Created 25 notifications for 1 stream(s)",
  "streamsProcessed": 1,
  "notificationsCreated": 25
}
```

## Setup Instructions

### Step 1: Database Migration
The notification tables are automatically created when the app starts. No manual migration needed!

### Step 2: Enable Scheduled Checks

Choose one of the following methods:

#### Option A: External Cron Service (Recommended for Production)

1. **Using cron-job.org:**
   - Visit: https://cron-job.org
   - Click "Create Cronjob"
   - URL: `https://your-domain.com/api/notifications/check-streams`
   - Request method: `POST`
   - Schedule: `*/1 * * * *` (every minute)
   - Click Save

2. **Using EasyCron:**
   - Visit: https://www.easycron.com
   - New Cron Job
   - URL: `https://your-domain.com/api/notifications/check-streams`  
   - Cron Expression: `0 * * * *` (every hour, adjust as needed)

#### Option B: Node Cron (Local Development)

1. Install dependencies:
   ```bash
   npm install node-cron
   ```

2. Run the cron job:
   ```bash
   node scripts/notification-cron.js
   ```

3. Keep this process running alongside your Next.js app

#### Option C: GitHub Actions (Free)

Create `.github/workflows/notification-cron.yml`:

```yaml
name: Live Stream Notifications

on:
  schedule:
    - cron: '*/1 * * * *'  # Every minute
  workflow_dispatch:

jobs:
  check-streams:
    runs-on: ubuntu-latest
    steps:
      - name: Check for upcoming streams
        run: |
          curl -X POST https://your-domain.com/api/notifications/check-streams \
            -H "Content-Type: application/json"
```

### Step 3: Frontend Setup
The `NotificationBell` component is already integrated in the top-bar. It will:
- Show unread notification count
- Auto-refresh every 30 seconds
- Display all notifications with timestamps
- Allow marking as read and deletion

## Usage Example

### Testing the System

1. **Create a live stream scheduled for 15 minutes from now:**
   ```bash
   curl -X POST http://localhost:3000/api/live/streams \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Stream",
       "video_id": "dQw4w9WgXcQ",
       "stream_key": "test-key",
       "stream_url": "rtmp://test",
       "scheduled_start_time": "'$(date -u -d "+15 minutes" +%Y-%m-%dT%H:%M:%SZ)'"
     }'
   ```

2. **Manually trigger notification check:**
   ```bash
   curl -X POST http://localhost:3000/api/notifications/check-streams
   ```

3. **Verify notifications were created:**
   ```bash
   curl "http://localhost:3000/api/notifications?userId=your-user-id"
   ```

4. Open the app and check the notification bell - should show notifications!

### Notification Message Format

Notifications are created with:
- **Title:** "Live Stream Starting Soon"
- **Message:** "🔴 [Stream Title] starts in 15 minutes!"
- **Type:** live_stream_reminder
- **Related Stream ID:** Link to the affected stream

## How It Works

```
┌─────────────────────────────────────────────┐
│  Scheduled Cron Job (Every Minute)          │
│  POST /api/notifications/check-streams      │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  Check for Streams in Next 15 Minutes       │
│  - Query live_streams table                 │
│  - Filter: scheduled_start_time IN          │
│    (NOW, NOW + 15 minutes)                  │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  Check Status Table                         │
│  - Has reminder already been sent?          │
│  - Prevent duplicate notifications          │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  Create Notifications                       │
│  - For each user in database                │
│  - For each upcoming stream                 │
│  - Insert into notifications table          │
│  - Mark status as reminder_sent             │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  Frontend Display                           │
│  - Notification bell with count             │
│  - Dropdown with all notifications          │
│  - Auto-refresh every 30 seconds            │
└─────────────────────────────────────────────┘
```

## Troubleshooting

### Notifications not appearing

1. **Check the cron job is running:**
   ```bash
   # For GitHub Actions: check Actions tab
   # For Node Cron: check console output
   # For external service: check their dashboard
   ```

2. **Verify database tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name = 'notifications';
   ```

3. **Check for upcoming streams:**
   ```sql
   SELECT id, title, scheduled_start_time FROM live_streams 
   WHERE scheduled_start_time > NOW() 
   AND scheduled_start_time < NOW() + INTERVAL '20 minutes';
   ```

4. **Test the API manually:**
   ```bash
   curl -X POST http://localhost:3000/api/notifications/check-streams -v
   ```

### Duplicate notifications
- The system uses `live_stream_notification_status` to prevents duplicates
- Each stream can only trigger one 15-minute reminder batch

### Notifications showing as old
- Check that `read_at` timestamp is being set correctly
- Ensure timezone handling is correct in your server

## Performance Notes

- ✅ Indexed on `user_id` for fast user notification queries
- ✅ Indexed on `is_read` for filtering unread notifications
- ✅ Indexed on `created_at DESC` for chronological ordering
- ✅ Indexed on `related_stream_id` for stream lookups
- ⚠️ For 1000+ users, consider pagination or batch processing

## Future Enhancements

- [ ] Email notifications
- [ ] Push notifications (Web Push API)
- [ ] SMS notifications
- [ ] Notification preferences (on/off toggle per stream type)
- [ ] Notification categories/filters
- [ ] Archive old notifications
- [ ] Custom notification sounds
- [ ] Notification scheduling (quiet hours)

## API Rate Limiting

Currently no rate limiting on notification endpoints. Consider adding:
- Rate limit the `/api/notifications/check-streams` endpoint
- Limit to 1 call per minute per IP to prevent abuse

## Security Considerations

- ✅ User can only see their own notifications
- ✅ Notifications are created for all users (broadcast)
- ⚠️ Add authentication check if restricted to specific users
- ⚠️ Validate stream_id existence before creating notifications
