# Live Stream Reminder System - Quick Start & Testing Guide

## Quick Start

### 1. **Database Setup** ✅
The reminder tables are automatically created on first app load via `ensureTablesExist()`:
- `live_stream_reminders` - Stores user reminders
- `notifications` - Stores notifications

### 2. **For Users**
1. Go to **Kuppi Live** page
2. Find an upcoming session in the grid
3. Click **"Set Reminder"** button
4. ✅ Button shows "Reminder Set" with filled bell icon
5. Receive notification 30 minutes before stream starts

### 3. **For Administrators**
To manually send reminders for a stream going live:

```bash
curl -X POST http://localhost:3000/api/live/reminders/notify \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": 1,
    "eventType": "live"
  }'
```

Response:
```json
{
  "success": true,
  "notificationsSent": 5,
  "message": "Notifications sent to 5 users"
}
```

## Testing Scenarios

### Scenario 1: Set a Reminder
**Steps:**
1. Log in as a student
2. Navigate to `/live` page
3. Find an upcoming session
4. Click "Set Reminder" button

**Expected Results:**
- ✅ Button changes to "Reminder Set" (blue highlight)
- ✅ Toast notification: "Reminder Set for [Stream Title]"
- ✅ Bell icon fills with color
- ✅ Database entry created in `live_stream_reminders`

**Verify in DB:**
```sql
SELECT * FROM live_stream_reminders 
WHERE user_id = 'student_123' AND stream_id = 1;
```

### Scenario 2: Remove a Reminder
**Steps:**
1. On a session with active reminder
2. Click "Reminder Set" button

**Expected Results:**
- ✅ Button changes back to "Set Reminder" (outline style)
- ✅ Toast notification: "Reminder Removed for [Stream Title]"
- ✅ Database entry deleted from `live_stream_reminders`

### Scenario 3: Send Notifications to All Users with Reminders
**Steps:**
1. Create or select an upcoming live session
2. Call the reminder notification endpoint:

```bash
curl -X POST http://localhost:3000/api/live/reminders/notify \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": 1,
    "eventType": "live"
  }'
```

**Expected Results:**
- ✅ Response shows number of notifications sent
- ✅ Notifications appear in all users' notification panels
- ✅ Unread badge appears on bell icon
- ✅ Database entries created in `notifications` table

**Verify in DB:**
```sql
SELECT COUNT(*) FROM notifications 
WHERE related_stream_id = 1 AND type = 'live_stream_reminder';
```

### Scenario 4: Check Reminder Status
**Steps:**
1. Call GET endpoint to check if user has reminder:

```bash
curl "http://localhost:3000/api/live/reminders?userId=student_123&streamId=1"
```

**Expected Response:**
```json
{
  "hasReminder": true
}
```

### Scenario 5: Get All User's Reminders
**Steps:**
1. Call GET endpoint without streamId:

```bash
curl "http://localhost:3000/api/live/reminders?userId=student_123"
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "stream_id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "title": "Computer Science 101",
    "scheduled_start_time": "2024-01-15T15:00:00Z",
    "status": "scheduled"
  }
]
```

## API Testing with cURL

### Set Reminder
```bash
curl -X POST http://localhost:3000/api/live/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student_123",
    "streamId": 1,
    "action": "set"
  }'
```

### Remove Reminder
```bash
curl -X POST http://localhost:3000/api/live/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student_123",
    "streamId": 1,
    "action": "remove"
  }'
```

### Check Reminder Status
```bash
curl "http://localhost:3000/api/live/reminders?userId=student_123&streamId=1"
```

### Get All Reminders
```bash
curl "http://localhost:3000/api/live/reminders?userId=student_123"
```

### Send Notifications
```bash
curl -X POST http://localhost:3000/api/live/reminders/notify \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": 1,
    "eventType": "live"
  }'
```

## Database Queries for Testing

### Check all reminders for a user
```sql
SELECT 
  lsr.id,
  lsr.stream_id,
  ls.title,
  ls.scheduled_start_time,
  lsr.created_at
FROM live_stream_reminders lsr
JOIN live_streams ls ON lsr.stream_id = ls.id
WHERE lsr.user_id = 'student_123'
ORDER BY ls.scheduled_start_time ASC;
```

### Check all users with reminders for a stream
```sql
SELECT 
  lsr.user_id,
  u.first_name,
  u.email,
  lsr.created_at
FROM live_stream_reminders lsr
JOIN users u ON lsr.user_id = u.id
WHERE lsr.stream_id = 1
ORDER BY lsr.created_at DESC;
```

### Check all notifications from reminders
```sql
SELECT 
  n.id,
  n.user_id,
  n.title,
  n.message,
  n.is_read,
  n.created_at,
  ls.title as stream_title
FROM notifications n
LEFT JOIN live_streams ls ON n.related_stream_id = ls.id
WHERE n.type = 'live_stream_reminder'
ORDER BY n.created_at DESC
LIMIT 50;
```

### Check unread reminder notifications for a user
```sql
SELECT 
  n.id,
  n.title,
  n.message,
  n.created_at
FROM notifications n
WHERE n.user_id = 'student_123'
  AND n.type = 'live_stream_reminder'
  AND n.is_read = false
ORDER BY n.created_at DESC;
```

## Common Issues & Solutions

### Issue: "Set Reminder" button doesn't work
**Solution:**
1. Check if user is logged in: `localStorage.getItem('studentId')`
2. Verify API endpoint: `/api/live/reminders`
3. Check browser console for errors
4. Verify `user_id` and `stream_id` are valid

### Issue: Reminders don't appear in notification panel
**Solution:**
1. Verify notification was created in DB
2. Check `user_id` matches logged-in user
3. Verify `is_read = false`
4. Clear browser cache and refresh

### Issue: API returns 404
**Solution:**
1. Verify stream ID is valid: `SELECT * FROM live_streams WHERE id = 1;`
2. Check endpoint paths are correct
3. Verify tables exist: `\dt live_stream_reminders`

## Performance Tips

- ✅ Reminders are indexed by user_id and stream_id for fast queries
- ✅ Limit returned notifications to 50 per page
- ✅ Use pagination for users with many reminders
- ✅ Cache reminder status in component state
- ✅ Debounce reminder toggle actions

## Next Steps

1. **Setup Cron Job** - Configure automatic 30-min reminders
2. **Add Email Notifications** - Send email alongside in-app notifications
3. **Add Admin Dashboard** - View reminder statistics
4. **Add Reminder Analytics** - Track which sessions get most reminders
5. **Mobile Push Notifications** - Push notifications to mobile users

