# Watch Replay Feature Implementation Guide

## Overview
The Watch Replay feature allows users to access previous live session recordings from the **Previous Live Sessions** section on the live page. Clicking "Watch Replay" navigates users to the community section where the recorded session is stored.

## Components

### 1. WatchReplay Component
**File:** `components/live/watch-replay.tsx`

#### Purpose
Provides a button component that navigates users to the replay video for a previous live session.

#### Features
- **Post Linking:** Navigates to community posts linked via `post_id`
- **Graceful Degradation:** Shows "Replay Processing" if `post_id` is unavailable (video still being processed)
- **Loading State:** Displays loading state while navigation is in progress
- **Customizable UI:** Supports different sizes (sm, md, lg) and variants
- **Accessible:** Includes title tooltips and disabled states

#### Props Interface
```typescript
interface WatchReplayProps {
  streamId: number           // Unique identifier for the live stream
  postId: number | null      // ID of the community post with the replay
  streamTitle: string        // Title of the stream (used for tooltips)
  size?: 'sm' | 'md' | 'lg' // Button size (default: 'md')
  variant?: 'default' | 'outline' | 'secondary' // Button style (default: 'secondary')
  showLabel?: boolean        // Show/hide button text (default: true)
  className?: string         // Additional CSS classes
}
```

#### Example Usage
```tsx
<WatchReplay
  streamId={session.id}
  postId={session.post_id}
  streamTitle={session.title}
  size="md"
  variant="secondary"
  showLabel={true}
  className="w-full mt-4"
/>
```

### 2. Integration in Live Page
**File:** `app/live/page.tsx`

#### Changes
1. Added import for WatchReplay component
2. Replaced static button with dynamic `<WatchReplay>` component in Previous Live Sessions section
3. Passes stream properties (`id`, `post_id`, `title`) to component

#### Previous Sessions Display
```tsx
{previousSessionList.map((session) => (
  <div key={session.id} className="...">
    {/* Session card content */}
    <WatchReplay
      streamId={session.id}
      postId={session.post_id}
      streamTitle={session.title}
      className="w-full mt-4"
    />
  </div>
))}
```

## How It Works

1. **Session Recording Flow:**
   - When a live stream ends, video is uploaded to community
   - Community post is created with the recording
   - Post ID is linked to the original live stream record in database

2. **User Navigation Flow:**
   ```
   User on Live Page
        ↓
   Clicks "Watch Replay" button
        ↓
   WatchReplay component checks post_id exists
        ↓
   Navigates to /community?post={postId}
        ↓
   Community page displays the recorded video
   ```

3. **Unavailable Replays:**
   - If `post_id` is null, button shows "Replay Processing" and is disabled
   - Video might still be uploading/processing
   - Button will become functional once post is available and `post_id` is populated

## Database Schema

The feature relies on existing stream properties:

```sql
-- Relevant columns in live_streams table
- id (integer)              -- Stream identifier
- post_id (integer/null)    -- Reference to community post with recording
- title (text)              -- Stream title
- status (text)             -- Stream status (online, offline, completed)
- scheduled_start_time      -- When stream was scheduled
```

When a stream recording is available:
1. Create community post with video
2. Update `live_streams.post_id` with the post ID
3. "Watch Replay" button becomes active automatically

## User Experience

### Available Replay
- Button shows "Watch Replay" with play icon
- Button is enabled and clickable
- Clicking navigates to community post with video player

### Processing Replay
- Button shows "Replay Processing" with play icon
- Button is disabled (grayed out)
- Tooltip explains "Replay will be available soon"

### Mobile Responsive
- Button adapts to card width
- Sizes available: sm (8px), md (9px), lg (10px)
- Full-width on mobile cards

## Configuration

### Styling
The component uses default button styling from `Button` component which respects theme:
- **Light Mode:** Secondary color with dark text
- **Dark Mode:** Secondary color adapted for dark backgrounds
- Hover effects and transitions included

### Navigation Target
Currently navigates to `/community?post={postId}`

To modify the navigation target, edit line in `watch-replay.tsx`:
```tsx
router.push(`/community?post=${postId}`)
```

## Setting up Post Creation Workflow

To complete the replay feature, you need to:

1. **When Stream Ends:**
   - Download/receive the YouTube recording (if YouTube Live)
   - Or access the recording from your streaming service

2. **Create Community Post:**
   ```tsx
   const post = await createPost({
     title: stream.title,
     content: stream.description,
     video_id: stream.video_id, // YouTube ID
     creator_id: stream.creator_id,
     module_name: stream.module_name,
     year: stream.year,
     semester: stream.semester,
   })
   ```

3. **Link to Stream:**
   ```sql
   UPDATE live_streams 
   SET post_id = ${post.id}
   WHERE id = ${stream.id}
   ```

4. **Verify:**
   - Previous session now shows enabled "Watch Replay" button
   - Clicking navigates to community post

## Testing

1. **View Live Page:**
   - Navigate to `/live`
   - Scroll to "Previous Live Sessions"

2. **Test Unavailable Replay:**
   - Session with `post_id = null` shows "Replay Processing"
   - Button is disabled

3. **Test Available Replay:**
   - Session with `post_id` set shows "Watch Replay"
   - Clicking navigates to `/community?post={postId}`

4. **Test Navigation:**
   - Verify community post loads with video player
   - Check that video displays correctly

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Replay Processing" always showing | post_id not being set | Check if community post is created and linked |
| Navigation doesn't work | Router not initialized | Ensure component runs in client context ('use client') |
| Button styling incorrect | CSS variables not loaded | Check theme is initialized |
| Missing play icon | Lucide React not installed | Verify dependencies: `npm install lucide-react` |

## Future Enhancements

1. **Automatic Post Creation:** Create community post automatically when stream ends
2. **Upload Progress:** Show upload percentage while video is being processed
3. **Direct Video Display:** Show preview thumbnail of replay in previous sessions
4. **Notifications:** Notify creator when replay is ready to share
5. **Analytics:** Track how many users watch replays

## Files Modified

- `components/live/watch-replay.tsx` - NEW
- `app/live/page.tsx` - Updated to use WatchReplay component

## Related Components

- `components/live/set-reminder.tsx` - Set reminders for upcoming sessions
- `components/live/stream-player.tsx` - Main stream player
- `components/live/chat-panel.tsx` - Live chat during sessions
