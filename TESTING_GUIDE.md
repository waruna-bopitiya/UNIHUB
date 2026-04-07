# Testing Guide - Stream Management Enhancements

## Quick Start Testing

### Test 1: Create a New Stream (Existing Functionality - Verified Still Works)
1. Go to `http://localhost:3000/app/live/create`
2. Fill in all required fields:
   - Select Year, Semester, Module
   - Enter Title (e.g., "Test Stream")
   - Enter Description
   - Set Scheduled Start Time (must be in future)
   - (Optional) Upload thumbnail
3. Click "Create Live Stream"
4. You should see the streaming dashboard with two tabs: "Browser Stream" and "External Software"
5. Verify stream key is visible in External Software tab

### Test 2: View Stream Key in Browser Tab (NEW ✨)
1. After creating a stream, click on "Browser Stream" tab
2. Scroll down to find the "Stream Key (for backup)" section
3. **Test visibility toggle**:
   - Key should show as `●●●●●●●●` (masked by default)
   - Click the eye icon to reveal the actual key
   - Click again to hide it
4. **Test copy button**:
   - Click the copy icon
   - Open DevTools console or paste somewhere to verify the key was copied
   - Should see your actual stream key

### Test 3: Edit an Existing Stream (NEW ✨)
1. First, create a stream and note its ID from the database or console logs
2. Navigate to: `http://localhost:3000/app/live/create?id=STREAM_ID`
   - Replace `STREAM_ID` with the actual stream ID (e.g., `?id=123`)
3. **Verify stream loads**:
   - Stream info card appears on the right with current stream data
   - Thumbnail displays
   - Status shows
   - Title and description show current values
4. **Test Edit button**:
   - Click "Edit" button in the stream info card
   - Edit form should appear below the stream card
   - Form should be pre-populated with current values
5. **Test editing fields**:
   - Change the Title
   - Change the Description
   - Change Academic Info (Year/Semester/Module)
   - Upload a new thumbnail (optional)
   - Change Scheduled Start Time
6. **Test Save**:
   - Click "Save Changes"
   - Should see success message: "✅ Stream updated successfully!"
   - Form should hide
   - Verify changes are reflected in the stream info card above

### Test 4: Delete a Stream (NEW ✨)
1. In edit mode (with `?id=STREAM_ID` in URL):
2. Scroll down to find the "Delete" button (appears next to Edit button)
3. Click "Delete"
4. Confirm deletion when prompted
5. Should redirect to `/app/live` page
6. Verify stream is no longer in the list

### Test 5: Check Live Status (Already Existed - Still Works)
1. Create a stream and go to "External Software" tab
2. Scroll to bottom
3. Click "Check if stream is live" button
4. Should show one of:
   - Status connecting (loading indicator)
   - ✅ "Stream is live — students can watch now!" (if actually streaming)
   - ⚫ Offline status

### Test 6: Integration with /live Page (Verify Links Still Work)
1. Go to `/app/live` (main live streams page)
2. In your "My Live Streams" section, find a stream you created
3. Click the "Edit" button on a stream card
4. Should navigate to `/app/live/create?id=STREAM_ID`
5. Verify stream loads in edit mode

## Expected Behaviors

### Create Mode (`/app/live/create` with no query param)
- ✅ Shows creation form with empty fields
- ✅ Can create new stream
- ✅ After creation, shows streaming dashboard
- ✅ No Edit/Delete buttons (not in edit mode)
- ✅ Share in Feed button available

### Edit Mode (`/app/live/create?id=123`)
- ✅ Loads stream data automatically
- ✅ Shows stream info card with current data
- ✅ Shows Edit and Delete buttons
- ✅ Edit form appears when Edit button clicked
- ✅ Form pre-populated with current values
- ✅ Share in Feed button is hidden (not needed in edit mode)
- ✅ Stream key visible in browser tab (same as create mode)

## Known Features

### Stream Key Display
- **Location**: Browser Stream tab (bottom section)
- **Features**:
  - Masked by default for security
  - Eye icon toggles visibility
  - Copy icon copies to clipboard
  - Shows warning about keeping it private

### Edit Form Fields
1. **Thumbnail** - Upload new image (uploads as base64)
2. **Title** - Max 100 characters
3. **Description** - Max 1000 characters
4. **Academic Info** - Year, Semester, Module selectors
5. **Scheduled Start Time** - DateTime picker

### Delete Functionality
- Asks for confirmation before deleting
- Deletes the stream from database
- Also deletes associated post from feed
- Redirects to /live page after success

## Troubleshooting

### Query Parameter Not Working
- Verify URL format: `/app/live/create?id=STREAM_ID` (not `/live/create`)
- Check that stream ID is correct (numeric value)
- Check browser console for any fetch errors

### Edit Form Not Showing
- Click the "Edit" button (it may be hidden initially)
- Verify you're in edit mode (`?id=` in URL)
- Check browser console for errors

### Stream Key Not Saving to Clipboard
- Browser must have permission to access clipboard
- Check if browser is blocking clipboard access
- Try with a different browser

### Delete Not Working
- Verify you have permission to delete (you're the creator)
- Check network tab in DevTools for 403 errors
- Verify streamIdInDb is correct

## Files Modified
- `/app/live/create/page.tsx` - Main streaming page with all enhancements

## Database Schema Used
- Table: `live_streams`
- Key columns: `id`, `creator_id`, `title`, `description`, `year`, `semester`, `module_name`, `stream_key`, `stream_url`, `thumbnail_url`, `scheduled_start_time`

## API Endpoints Used
- `POST /api/live/create` - Create YouTube stream
- `POST /api/live/streams` - Save stream to database
- `GET /api/live/streams/{id}` - Load stream for editing
- `PUT /api/live/streams/{id}` - Update stream
- `DELETE /api/live/streams/{id}` - Delete stream and associated post
- `GET https://www.googleapis.com/youtube/v3/videos` - Check live status

## Success Indicators
✅ All TypeScript errors fixed
✅ Stream key visible with toggle
✅ Edit form functional
✅ Delete working with confirmation
✅ URL query parameter routing working
✅ Stream data pre-populats in edit mode
