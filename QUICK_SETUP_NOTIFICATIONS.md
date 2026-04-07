# Quick Setup Guide - 15 Minute Live Stream Notifications

## 🚀 Quick Start (5 minutes)

### Step 1: Verify Database Tables Are Created
Database tables are automatically created when the app starts. No action needed!

### Step 2: Choose How to Run the Notification Check

Pick ONE method:

#### Method A: External Cron Service (Best for Production) ⭐
1. Visit: https://cron-job.org
2. Create account (free)
3. Click "CREATE CRONJOB"
4. Enter:
   - **URL:** `https://yourapp.com/api/notifications/check-streams`
   - **Method:** POST
   - **Schedule:** `*/1 * * * *` (every minute)
5. Click "TEST EXECUTION"
6. Enable the job

**Done!** Notifications will now run every minute.

---

#### Method B: GitHub Actions (Free, Automatic) 
1. Create file: `.github/workflows/check-notifications.yml`
2. Paste this:
```yaml
name: Check Stream Notifications

on:
  schedule:
    - cron: '*/1 * * * *'

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST https://yourapp.com/api/notifications/check-streams
```
3. Commit and push
4. Go to GitHub → Actions tab
5. See it running automatically ✅

---

#### Method C: Local Node Cron (Development Only)
```bash
# Install
npm install node-cron

# Run
node scripts/notification-cron.js
```
Keep this terminal open while testing.

---

### Step 3: Test It

1. **Create a test stream (15 minutes from now):**
```bash
curl -X POST http://localhost:3000/api/live/streams \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Stream",
    "video_id": "dQw4w9WgXcQ",
    "stream_key": "test123",
    "stream_url": "rtmp://test",
    "scheduled_start_time": "'$(date -u -d "+15 minutes" +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

2. **Trigger check:**
```bash
curl -X POST http://localhost:3000/api/notifications/check-streams
```

3. **See notifications in app:**
   - Log in to your app
   - Look for 🔔 bell icon in top-right
   - Click it to see notifications

---

## 🧪 Quick Tests

### Test 1: Create notification manually
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "type": "live_stream_reminder",
    "title": "Test Notification",
    "message": "This is a test!",
    "relatedStreamId": null
  }'
```

### Test 2: Check user notifications
```bash
curl "http://localhost:3000/api/notifications?userId=your-user-id"
```

### Test 3: Mark as read
```bash
curl -X PATCH http://localhost:3000/api/notifications/1 \
  -H "Content-Type: application/json" \
  -d '{"isRead": true}'
```

---

## 📱 How It Works

1. **Every minute** → Cron job calls `/api/notifications/check-streams`
2. **Check finds** → All streams starting in next 15 minutes
3. **Create notifs** → For every user in database
4. **Show on UI** → Bell icon with count in top-bar
5. **User clicks** → See all notifications with details
6. **User can** → Mark as read or delete

```
🕐 Stream scheduled for 10:15 AM
│
├─→ [10:00 AM] Cron job runs
│   └─→ Creates notifications ✅
│
├─→ [10:01 - 10:14] Students see 🔔 badge
│   └─→ Shows "Live stream starts in X minutes"
│
└─→ [10:15 AM] Stream goes live
    └─→ Students can watch
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| No bell showing | Log in to the app, check browser console |
| No notifications appear | Create a stream 15 min from now, manually trigger check |
| Cron not working | Use manual check endpoint to verify API works |
| Duplicate notifications | This shouldn't happen - tables prevent it |
| Notifications old timestamp | Check server timezone settings |

---

## 📊 API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications?userId=X` | Get user notifications |
| POST | `/api/notifications` | Create notification |
| PATCH | `/api/notifications/1` | Mark as read |
| DELETE | `/api/notifications/1` | Delete notification |
| POST | `/api/notifications/check-streams` | **Main: Check & create** |

---

## ✅ Verification Checklist

- [ ] App starts without errors
- [ ] Bell icon shows when logged in
- [ ] Can see notification dropdown
- [ ] Cron job is set up and running
- [ ] Test stream created for 15 min from now
- [ ] Manual check endpoint called
- [ ] Notifications appeared in bell
- [ ] Can mark notifications as read
- [ ] Can delete notifications

---

## 📞 Need Help?

See detailed docs:
- `NOTIFICATIONS_GUIDE.md` - Full reference
- `NOTIFICATIONS_IMPLEMENTATION.md` - Technical details

---

**That's it! 🎉 Your notification system is ready!**
