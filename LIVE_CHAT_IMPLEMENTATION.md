# Live Chat Implementation Guide

## 🎯 Overview

The live chat feature enabled real-time messaging between users during live streaming sessions. The system integrates with the Neon database to store and retrieve messages efficiently.

## ✨ Features

- **Real-time Messaging:** Live polling system updates chat every 2 seconds
- **User Identification:** Shows current user messages with "(You)" label
- **Message Persistence:** All messages stored in Neon database
- **Auto-scroll:** Messages automatically scroll to latest
- **Sending States:** Loading and error handling during message submission
- **User-friendly:** Simple text input with Enter key support

## 🏗️ Architecture

### Database Schema

```sql
CREATE TABLE live_chat_messages (
  id SERIAL PRIMARY KEY,
  stream_id INTEGER NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

CREATE INDEX idx_live_chat_messages_stream_id ON live_chat_messages(stream_id)
CREATE INDEX idx_live_chat_messages_created_at ON live_chat_messages(created_at DESC)
```

### API Endpoints

#### GET `/api/live/messages`
Retrieve chat messages for a stream

**Query Parameters:**
```
streamId: number (required) - Stream ID to fetch messages for
limit: number (optional, default: 50) - Maximum messages to return (max 100)
```

**Response:**
```json
[
  {
    "id": "1",
    "author": "John Doe",
    "message": "Great tutorial!",
    "timestamp": "2:30 PM"
  }
]
```

#### POST `/api/live/messages`
Send a new message to a stream

**Request Body:**
```json
{
  "streamId": 123,
  "authorName": "John Doe",
  "message": "This is helpful!"
}
```

**Response:**
```json
{
  "id": "42",
  "author": "John Doe",
  "message": "This is helpful!",
  "timestamp": "2:35 PM"
}
```

**Status Codes:**
- `201 Created` - Message saved successfully
- `400 Bad Request` - Missing required fields
- `500 Internal Error` - Database error

### Component: ChatPanel

**File:** `components/live/chat-panel.tsx`

#### Props

```typescript
interface ChatPanelProps {
  messages: ChatMessage[]              // Initial messages (can be empty)
  streamId?: number | null             // Stream ID for fetching/sending messages
  currentUserName?: string              // Current user's display name (default: "You")
  currentUserId?: string | null         // Current user's ID (optional)
}
```

#### Features

1. **Real-time Polling**
   - Fetches messages every 2 seconds
   - Automatically updates message list
   - Maintains polling interval until component unmounts

2. **Message Sending**
   - Optimistic UI updates (shows message immediately)
   - Validates message content (must not be empty)
   - Handles sending state with loading indicator
   - Reverts on error

3. **User Experience**
   - Auto-scroll to bottom on new messages
   - Empty state message when no messages
   - Loading state on first load
   - Error messages for failed operations
   - Current user messages highlighted

4. **Styling**
   - Theme-aware (light/dark mode)
   - Smooth fade-in animations
   - Responsive design
   - Touch-friendly buttons

#### State Management

```typescript
const [messages, setMessages] = useState<ChatMessage[]>([])
const [input, setInput] = useState('')
const [sendError, setSendError] = useState('')
const [sending, setSending] = useState(false)
const [loading, setLoading] = useState(false)
```

#### Methods

**fetchMessages()** - Fetches latest messages from database
```typescript
const fetchMessages = async () => {
  // Polls the API for new messages
  // Updates local state with fresh data
}
```

**handleSendMessage()** - Sends user message to database
```typescript
const handleSendMessage = async () => {
  // Validates input
  // Shows optimistic UI update
  // Posts to API
  // Updates on success or reverts on error
}
```

## 📱 Integration

### Live Page Usage

**File:** `app/live/page.tsx`

```tsx
import { ChatPanel } from '@/components/live/chat-panel'

export default function LivePage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string>('Anonymous')
  const [featuredStream, setFeaturedStream] = useState<LiveStream | null>(null)

  // Fetch current user details
  useEffect(() => {
    const userId = localStorage.getItem('studentId')
    if (userId) {
      fetch(`/api/user/profile?id=${userId}`)
        .then(res => res.json())
        .then(data => setCurrentUserName(data.first_name))
    }
  }, [])

  return (
    <>
      {featuredStream && (
        <ChatPanel
          messages={[]}
          streamId={featuredStream.id}
          currentUserName={currentUserName}
          currentUserId={currentUserId}
        />
      )}
    </>
  )
}
```

**Key Points:**
1. Initialize with empty `messages` array (ChatPanel fetches on mount)
2. Pass `streamId` from featured stream
3. Pass current user's name for proper attribution
4. ChatPanel handles all message fetching/polling internally

## 🔄 Message Flow

```
┌─────────────────────────────────────┐
│    User Opens /live Page            │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   Load Current User Profile         │
│   (from localStorage + API)         │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   Render ChatPanel Component        │
│   (with currentUserName)            │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   ChatPanel Mounts                  │
│   - Fetches initial messages        │
│   - Sets up polling interval        │
└────────────────┬────────────────────┘
                 │
        ┌────────▼────────┐
        │  Every 2 secs   │
        │  Poll for new   │
        │  messages       │
        └────────┬────────┘
                 │
┌────────────────▼────────────────────┐
│   User Types Message                │
│   (in input field)                  │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   User Presses Enter or Clicks Send │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   Optimistic UI Update              │
│   - Show message immediately        │
│   - Clear input field               │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   POST to /api/live/messages        │
│   (Save to database)                │
└────────────────┬────────────────────┘
                 │
         ┌───────▼─────────┐
         │   Success?      │
         └────────┬────────┘
            ┌────┴────┐
           YES        NO
            │          │
       ┌────▼──┐  ┌───▼────┐
       │Update │  │Revert  │
       │with   │  │message │
       │server │  │& show  │
       │ID     │  │error   │
       └───────┘  └────────┘

┌─────────────────────────────────────┐
│   Message Appears in Chat Panel     │
│   (after polling or immediate)      │
└─────────────────────────────────────┘
```

## 🔧 Configuration

### Polling Interval
Change message polling frequency (default: 2 seconds):

**In `chat-panel.tsx`:**
```typescript
// Currently: 2000ms interval
pollIntervalRef.current = setInterval(() => {
  fetchMessages()
}, 2000)  // Change this value

// Recommended values:
// 1000 = 1 second (frequent, more server load)
// 2000 = 2 seconds (balanced, default)
// 5000 = 5 seconds (less frequent, lower server load)
```

### Message Limit
Change max messages fetched per request:

**In `chat-panel.tsx`:**
```typescript
// Currently: 100 messages
const response = await fetch(
  `/api/live/messages?streamId=${streamId}&limit=100`,
  { cache: 'no-store' }
)
```

### Default User Name
When user profile can't be loaded:

**In `live/page.tsx`:**
```typescript
// Currently: 'Anonymous'
setCurrentUserName('Anonymous')
```

## 🧪 Testing

### Manual Testing

1. **Start a Live Stream**
   - Navigate to `/live`
   - Find or create a live stream

2. **Send a Message**
   - Type in chat input field
   - Press Enter or click Send button
   - Message should appear immediately

3. **Check Persistence**
   - Refresh the page
   - Messages should still be visible
   - Use browser DevTools (Network tab) to verify API calls

4. **Multiple Users**
   - Open `/live` in two browser tabs/windows
   - Send message in one tab
   - Verify it appears in the other tab within 2 seconds

### Database Testing

Check stored messages:
```sql
SELECT * FROM live_chat_messages 
WHERE stream_id = <stream_id>
ORDER BY created_at DESC
LIMIT 20;
```

Check message count:
```sql
SELECT 
  stream_id, 
  COUNT(*) as message_count,
  MAX(created_at) as last_message
FROM live_chat_messages
GROUP BY stream_id
ORDER BY message_count DESC;
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Messages not appearing | Check polling is enabled, verify streamId is passed |
| Old messages not showing | May need to increase `limit` parameter in API call |
| Send button disabled | Input field is empty, chat not ready, streamId missing |
| Loading shows forever | Check network tab for API errors |
| User name shows as "Anonymous" | Check user profile API is responding correctly |
| Polling too frequent | Increase interval from 2000ms to 5000ms |

## 🔐 Security Considerations

1. **Input Validation**
   - Messages validated on server (not empty)
   - Length limits could be added: `MAX(1000)` characters

2. **XSS Protection**
   - Messages displayed as text content, not HTML
   - No unsanitized HTML rendering

3. **Authentication**
   - User name from current user profile
   - Could add user_id to messages table for better tracking

4. **Rate Limiting**
   - Could add rate limiting to prevent spam
   - Example: 1 message per 1 second per user

## 📊 Performance

### Database Optimization

Current indexes:
```sql
idx_live_chat_messages_stream_id -- Fast filtering by stream
idx_live_chat_messages_created_at -- Fast sorting by time
```

### Polling Optimization

- **Interval:** 2 seconds (balance between responsiveness and server load)
- **Limit:** 100 messages max per fetch
- **Query:** Efficient filtering by stream_id + ordering

### Potential Improvements

1. **Pagination:** Implement cursor-based pagination
2. **Incremental Fetch:** Only fetch messages since last fetch
3. **WebSockets:** Replace polling with WebSocket for true real-time
4. **Message Compression:** Compress old messages
5. **Archive:** Move old messages to archive table

## 📝 API Response Examples

### Successful Send
```
POST /api/live/messages
Status: 201 Created

Response:
{
  "id": "42",
  "author": "John Doe",
  "message": "Hello everyone!",
  "timestamp": "2:30 PM"
}
```

### Fetch Messages
```
GET /api/live/messages?streamId=1&limit=50
Status: 200 OK

Response:
[
  {
    "id": "1",
    "author": "Alice",
    "message": "Hello!",
    "timestamp": "2:25 PM"
  },
  {
    "id": "2",
    "author": "Bob",
    "message": "Hi Alice!",
    "timestamp": "2:26 PM"
  }
]
```

### Error - Missing Stream ID
```
GET /api/live/messages
Status: 400 Bad Request (API returns empty array)

Response: []
```

### Error - Server Issue
```
POST /api/live/messages
Status: 500 Internal Server Error

Response:
{
  "error": "Failed to save message"
}
```

## 🚀 Future Enhancements

1. **Reactions**
   - Add emoji reactions to messages
   - Like/dislike buttons

2. **Mentions**
   - Tag specific users with @username
   - Notify mentioned users

3. **File Sharing**
   - Upload images/documents
   - Link preview cards

4. **Message Editing**
   - Edit sent messages
   - Show "edited" indicator

5. **Message Search**
   - Find messages by keyword
   - Filter by date range

6. **User Presence**
   - Show who's typing
   - Online user list

7. **Moderation**
   - Delete inappropriate messages
   - Ban users from chat

8. **Analytics**
   - Track most active chats
   - Message volume reporting

## 📞 Files Modified

- `components/live/chat-panel.tsx` - Updated with polling and user awareness
- `app/live/page.tsx` - Updated to pass current user name, removed old message fetching
- `app/globals.css` - Added fadeIn animation
- `app/api/live/messages/route.ts` - Already existed, API endpoints working
- `app/api/user/profile/route.ts` - Already existed, returns user details

## ✅ Implementation Checklist

- [x] Database table exists (`live_chat_messages`)
- [x] API endpoints functional (GET/POST `/api/live/messages`)
- [x] ChatPanel component created with polling
- [x] Real-time updates every 2 seconds
- [x] User identification working
- [x] Optimistic UI updates
- [x] Error handling
- [x] Auto-scroll on new messages
- [x] Theme-aware styling
- [x] Integration in live page
- [x] Current user name fetching
- [x] Animation effects added

## 🎯 Status

✅ **Live chat is fully functional with in-database persistence and real-time polling updates!**

Try it now:
1. Go to `/live`
2. Select a stream
3. Start typing in the chat
4. Messages persist and update in real-time
