# Watch Replay - Setup & Implementation Checklist

## Quick Reference

The "Watch Replay" feature is now ready to use. Here's what you need to do to enable replays for your live sessions.

## ✅ What's Already Done

- [x] WatchReplay component created (`components/live/watch-replay.tsx`)
- [x] Component integrated into live page previous sessions grid
- [x] Button displays for previous sessions
- [x] Navigation logic ready for community posts
- [x] Loading states and disabled states handled
- [x] Dark/light mode compatible styling

## 📋 What You Need to Do

### Step 1: Enable Post Creation When Stream Ends

When a live stream completes, you need to create a community post for the recording:

**Recommended Approach:** Create the post in your stream completion handler

```typescript
// In your stream ending logic
const createReplayPost = async (stream: LiveStream) => {
  try {
    // 1. Create the post
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${stream.title} - Recording`,
        content: stream.description || `Recording of ${stream.title}`,
        video_id: stream.video_id, // YouTube video ID
        module_name: stream.module_name,
        year: stream.year,
        semester: stream.semester,
        // Add any other post fields needed
      }),
    })
    
    const post = await response.json()
    
    // 2. Link the post to the stream
    await fetch(`/api/live/${stream.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.id }),
    })
    
    return post
  } catch (error) {
    console.error('Failed to create replay post:', error)
  }
}
```

### Step 2: Update the Endpoint (If Needed)

Check if you have a PATCH endpoint for updating streams with post_id:

**File:** `app/api/live/[id]/route.ts` (or similar)

```typescript
// Example PATCH handler
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { post_id } = body
    
    if (post_id === undefined) {
      return NextResponse.json(
        { error: 'post_id is required' },
        { status: 400 }
      )
    }
    
    // Update live_streams table
    const result = await query(
      'UPDATE live_streams SET post_id = $1 WHERE id = $2 RETURNING *',
      [post_id, params.id]
    )
    
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('PATCH stream error:', error)
    return NextResponse.json(
      { error: 'Failed to update stream' },
      { status: 500 }
    )
  }
}
```

### Step 3: Test It Out

1. Start a live session
2. End the live session
3. Go to `/live` page
4. In "Previous Live Sessions" section, click "Watch Replay"
5. Verify it navigates to the community post with the recording

## 🔄 Complete Workflow

```
┌─────────────────────────────────────────────────────┐
│ STEP 1: Live Session Scheduled                       │
│ (User sets "Set Reminder" for notification)          │
└─────────────────────┬───────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ STEP 2: Live Stream Running                          │
│ (YouTube embed plays live, chat active)              │
└─────────────────────┬───────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ STEP 3: Stream Ends                                  │
│ (Status changes to "completed", timer stops)         │
└─────────────────────┬───────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ STEP 4: CREATE REPLAY POST (YOUR ACTION)             │
│ (Create community post with recording)               │
│ (Update live_streams.post_id)                        │
└─────────────────────┬───────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ STEP 5: Watch Replay Available                       │
│ (Button shows "Watch Replay", post_id is set)        │
│ (Appears in Previous Live Sessions grid)             │
└─────────────────────┬───────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ STEP 6: User Clicks "Watch Replay"                   │
│ (Navigates to /community?post={postId})              │
│ (Displays community post with video recording)       │
└─────────────────────────────────────────────────────┘
```

## 🎨 Features Included

### Button States

**Available Replay (post_id exists)**
- Shows "Watch Replay" with play icon
- Blue/secondary color
- Clickable and functional
- Navigates to community post

**Processing Replay (post_id is null)**
- Shows "Replay Processing" with play icon
- Disabled state (grayed out)
- Not clickable
- Tooltip: "Replay will be available soon"

### Responsive Design
- **Desktop:** Full width button in card (100%)
- **Tablet:** Adapts to 2-3 column grid
- **Mobile:** Single column, full width

### Theme Support
- **Dark Mode:** Contrasted secondary colors
- **Light Mode:** High-contrast readable text
- Seamless switching without reload

## 📊 Database Interaction

### Current State
- Stream record has `post_id` field (nullable)
- `post_id = null` → Replay being prepared
- `post_id = number` → Replay available at that post

### Required Action
After creating community post with recording:
```sql
UPDATE live_streams 
SET post_id = <new_post_id> 
WHERE id = <stream_id>;
```

## 🧪 Example Test Cases

### Test 1: Navigation Works
```
1. Go to /live
2. Find previous session with post_id set
3. Click "Watch Replay"
4. Should navigate to /community?post=<number>
5. Community post with video should load
```

### Test 2: Replay Not Yet Available
```
1. Find session with post_id = null
2. Button shows "Replay Processing"
3. Button is disabled
4. Clicking does nothing
```

### Test 3: Mobile Responsive
```
1. Open on mobile device
2. Scroll to Previous Live Sessions
3. Button should fit in card
4. Touch/click should work smoothly
```

### Test 4: Dark Mode
```
1. Toggle to dark mode
2. "Watch Replay" button visible
3. Colors should be appropriate for dark theme
4. Text should be readable
```

## 🔗 Related Features

The Watch Replay feature works alongside:

1. **Dark Mode** (✅ Implemented)
   - Watch Replay button theme-aware

2. **Set Reminder** (✅ Implemented)
   - For upcoming sessions → notifications → users attend live
   - After stream ends → users find replay with "Watch Replay"

3. **Notifications** (✅ Implemented)
   - Users get notified 30 min before stream starts
   - Can then watch replay if they missed it

## 🚀 Next Steps

1. **Create API endpoint** for creating community posts from streams (if doesn't exist)
2. **Create cron job** to automatically create posts when streams end
3. **Add tests** for navigation flow
4. **Monitor** how users engage with replays
5. **Add analytics** to track replay views vs live views

## 📝 Implementation Notes

- Component is fully client-side (`'use client'`)
- No external dependencies beyond existing ones
- Button styling matches theme system
- Navigation uses Next.js router for smooth experience
- Error handling included for cases where post doesn't exist

## 🐛 Debugging

If "Watch Replay" doesn't work:

1. **Check post_id is set:**
   ```sql
   SELECT id, title, post_id FROM live_streams LIMIT 5;
   ```

2. **Verify post exists:**
   ```sql
   SELECT id, title FROM posts WHERE id = <post_id>;
   ```

3. **Test navigation manually:**
   - Go to `/community?post=<id>` directly in URL
   - Verify it loads the post

4. **Check browser console:**
   - Look for any router/navigation errors
   - Check for missing component errors

## ✨ That's It!

The "Watch Replay" button is ready to use. Once you create community posts for your streams and link them via `post_id`, everything will work automatically.

**Happy streaming! 🎬**
