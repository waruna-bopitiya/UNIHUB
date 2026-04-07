# Stream Management Page Updates

## Overview
The `/live/create` page has been significantly enhanced to consolidate all stream management features into a single, unified interface. Users can now create new streams AND edit existing ones without navigating to separate pages.

## New Features

### 1. **Stream Key Visibility & Copy** 🔑
- **Browser Tab**: Added stream key display with visibility toggle (Eye/EyeOff icon)
- **How to use**: 
  - Go to "Browser Stream" tab
  - Stream key appears in a secure field (masked by default)
  - Click the eye icon to show/hide the key
  - Click the copy icon to copy to clipboard
- **External Tab**: Stream key was already here, now consistent across both tabs

### 2. **Live Status Checker** 📡
- **Feature**: Check if your stream is currently live on YouTube
- **How to use**:
  - Go to "External Software" tab
  - Click "Check if stream is live" button
  - Shows green confirmation if streaming, or suggests to start OBS
- **Already existed**: Continues to work for verification

### 3. **Edit Stream Details (NEW – Consolidated)** ✏️
- **Location**: Stream info card on the right side of streaming phase
- **When it appears**: When loading a stream for editing (via `?id=streamId` query param)
- **Editable fields**:
  - Title
  - Description
  - Academic Info (Year, Semester, Module)
  - Scheduled Start Time
  - Thumbnail image
- **How to use**:
  1. Navigate to `/live/create?id=STREAM_ID` to edit a stream
  2. Stream data loads automatically into the right card
  3. Click the "Edit" button to show/hide the edit form
  4. Modify any fields you want to change
  5. Click "Save Changes" to update
  6. Success message appears confirming the update

### 4. **Delete Stream** 🗑️
- **Location**: Delete button appears next to Edit button in the stream info card (edit mode only)
- **Behavior**: 
  - Asks for confirmation before deleting
  - Deletes the stream and associated feed post
  - Redirects to `/live` page after successful deletion
  - Prevents accidental data loss

### 5. **Unified Stream Creation & Editing** 🎬
- **Single page for both operations**:
  - **Create mode**: Shows the form with empty fields
  - **Edit mode**: Loads existing stream data and shows edit tools
- **No more separate `/live/edit/[id]` navigation**
- **Query parameter usage**:
  - No param or empty: Create new stream mode
  - `?id=STREAM_ID`: Edit existing stream mode

## How to Use

### Creating a New Stream
1. Navigate to `/live/create` (or `/app/live/create`)
2. Fill in the form (Title, Description, Academic Info, Scheduled Start Time, Thumbnail)
3. Click "Create Live Stream"
4. Choose streaming method (Browser or External)
5. Get your stream key and share code

### Editing an Existing Stream
1. Navigate to `/live/create?id=STREAM_ID` (or use edit link from `/live` page)
2. Stream info loads automatically
3. Click "Edit" button in the stream info card
4. Modify fields in the edit form
5. Upload new thumbnail if needed
6. Click "Save Changes"
7. See confirmation message

### Checking Stream Key
1. After stream creation, go to "Browser Stream" tab
2. Find "Stream Key" section at the bottom
3. Click eye icon to reveal or hide the key
4. Click copy icon to copy to clipboard

### Checking If Live
1. Go to "External Software" tab
2. Scroll to bottom
3. Click "Check if stream is live" button
4. See status: "Stream is live — students can watch now!" or offline

## Technical Details

### State Management
- `streamIdInDb`: Stores the database ID of the stream
- `isEditMode`: Boolean flag indicating edit vs create mode
- `editFormData`: Separate state for edit form fields
- `editFormVisible`: Toggle for showing/hiding edit form

### API Calls
- **Create**: `POST /api/live/streams` (existing)
- **Read**: `GET /api/live/streams/{id}` (new: for loading edit data)
- **Update**: `PUT /api/live/streams/{id}` (existing: enhanced with thumbnail support)
- **Delete**: `DELETE /api/live/streams/{id}` (existing: with post cascade)

### URL Scheme
```
/live/create                    → Create new stream
/live/create?id=12345         → Edit stream with ID 12345
```

## Integration Points

### Connecting from `/live` (Stream List)
When a user clicks "Edit" on a stream from the `/app/live/page.tsx` "My Live Streams" section, they're redirected to:
```
/live/create?id={streamId}
```

### From Other Pages
Any page can link to edit a stream:
```html
<a href="/live/create?id=12345">Edit Stream</a>
```

## File Changes
- **Modified**: `/app/live/create/page.tsx`
  - Added `useSearchParams()` for query parameter handling
  - Added edit state management
  - Added edit form UI and handlers
  - Added stream key display to browser tab
  - Enhanced streaming phase UI

## Future Enhancements
- [ ] Real-time live status updates without manual click
- [ ] Bulk edit for multiple streams
- [ ] Schedule stream start notifications
- [ ] Stream statistics/analytics dashboard
- [ ] Advanced stream settings (bitrate, resolution preferences)

## Notes
- Old separate edit page at `/live/edit/[id]` can be kept for backward compatibility or deprecated
- All edit operations verify ownership (creator_id check at API level)
- Thumbnail uploads use base64 encoding for database storage
- Form validation ensures scheduled time is in the future
