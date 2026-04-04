# Google Sheets Integration Setup Guide for UNIHUB Resources

This guide explains how to set up Google Apps Script to sync your resources to a Google Sheet.

## Step 1: Prepare Your Google Sheet

1. **Create a new Google Sheet** (or use an existing one)
   - Open https://sheets.google.com
   - Create a new spreadsheet or open an existing one
   - Give it a name like "UNIHUB Resources"

2. **Get your Google Sheet ID**
   - The ID is in the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the `SHEET_ID_HERE` part

3. **Note**: Don't worry about creating the columns - the AppScript will do that automatically!

## Step 2: Create and Deploy Google Apps Script

### 2A. Create a new Apps Script project
1. Go to https://script.google.com
2. Click "**New Project**"
3. Name it "UNIHUB Resources Sync"
4. Copy all content from `GOOGLE_APPSCRIPT_CODE.gs` (provided in your project)
5. Replace the default code in the editor

### 2B. Update the Sheet ID
1. In the AppScript editor, find this line at the top:
   ```javascript
   const CONFIG = {
     SPREADSHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE', // Replace with your Google Sheet ID
   ```
2. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID from Step 1

### 2C. Initialize the Sheet (First Time Only)
1. In the AppScript editor, select function: **`initializeSheet`** from the dropdown
2. Click **Run**
3. You'll see a permission request - **click "Review permissions"** and **authorize**
4. Check your Google Sheet - it should now have headers!

### 2D. Deploy as Web App
This is **IMPORTANT** - your Next.js app needs the deployment URL to send data.

1. Click **"Deploy"** → **"New Deployment"**
2. Select **Type**: "Web app"
3. Execute as: **"Me"** (your account)
4. Who has access: **"Anyone"**
5. Click **"Deploy"**
6. Copy the **Deployment ID** (you'll see it in a dialog)
7. The URL will be something like:
   ```
   https://script.googleapis.com/macros/d/[DEPLOYMENT_ID]/userweb
   ```
8. Save this URL - you'll need it next!

## Step 3: Configure Your Next.js Environment

1. Open `.env.local` in your project root
2. Add this line:
   ```
   GOOGLE_APPSCRIPT_DEPLOYMENT_URL=https://script.googleapis.com/macros/d/[DEPLOYMENT_ID]/userweb
   ```
   - Replace `[DEPLOYMENT_ID]` with your actual Deployment ID from above

3. Restart your Next.js app:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## Step 4: Test It!

### Test from AppScript:
1. In your AppScript editor, select function: **`testAppScript`** from the dropdown
2. Click **Run**
3. A dialog should appear saying "Test successful!"
4. Check your Google Sheet - you should see a test resource!

### Test from Your App:
1. Open your UNIHUB Resources page
2. **Add a new resource** with:
   - Year, Semester, Module
   - Resource Name
   - Resource Type (PDF, PPT, etc.) - **NEW!**
   - Shareable Link (must be a valid URL like Google Drive link)
   - Description (optional)
3. Click **"Save Resource"**
4. Check your Google Sheet - the resource should appear!

## Step 5: Update Your Database (If Needed)

Your database needs the `shareable_link` and other new columns. Let me know if you need help with migrations!

### Required Database Columns:
```sql
ALTER TABLE resources ADD COLUMN shareable_link VARCHAR(500);
ALTER TABLE resources ADD COLUMN uploader_name VARCHAR(255);
ALTER TABLE resources ADD COLUMN description TEXT;
```

## Important Features

### ✅ What's Working:
- Resources are saved to **local database** (your existing system)
- Resources are synced to **Google Sheet** automatically
- **Resource type filter** (PDF, PPT, Word, TXT, etc.)
- **Shareable links only** (no file uploads)
- **Feedback system** (with login required)
- **Delete** (uploader only)
- **Top resource** by rating still works

### 📋 Unique Resource Types Available:
- PDF
- PPT
- Word
- TXT
- Excel
- Image
- Video
- Audio
- Other

## Troubleshooting

### "GOOGLE_APPSCRIPT_DEPLOYMENT_URL not configured"
- Make sure you added it to `.env.local`
- Restart your app after adding it
- Resources will still save locally, just not to Google Sheet

### Resource not appearing in Google Sheet
1. Check if AppScript deployment is correct
2. Run `testAppScript` function to verify
3. Check browser console for error messages
4. Check AppScript logs for errors

### Error: "Spreadsheet not found"
- Make sure the `SPREADSHEET_ID` in AppScript is correct
- Make sure the Google account running the script has access to the Sheet
- Try running `initializeSheet` again

### Permission errors
- Click the "Review permissions" button when AppScript asks
- Select your Google account
- Click "Allow" for necessary permissions

## File Updated

- **`app/library/resources/page.tsx`** - Complete rewrite with new structure
- **`app/api/resources/route.ts`** - Updated to handle shareable links
- **`GOOGLE_APPSCRIPT_CODE.gs`** - AppScript code to save to Google Sheets

## Key Changes from Previous Version

| Feature | Before | After |
|---------|--------|-------|
| Upload Method | File upload to server | Shareable links (Google Drive, OneDrive, etc) |
| Resource Type | File/Link toggle | Dropdown (PDF, PPT, Word, TXT, etc) |
| Data Storage | Local database only | Local database + Google Sheets |
| Description | Not available | Optional field added |
| Uploader Tracking | ID only | ID + Name |
| Resource Type Filtering | Not available | Full type filtering support |

## Security Notes

⚠️ **Important:**
- Ensure only authorized users can upload resources (login required)
- Only uploaders can delete resources (enforced in code)
- Google Sheet access - consider adding viewer restrictions
- Shareable links should be from trusted sources only

## Next Steps

1. ✅ Set up Google Sheet and AppScript (this guide)
2. ✅ Update Next.js environment variables
3. ✅ Test the connection
4. ✅ Update database schema if needed
5. ✅ Replace old page.tsx with new one
6. ✅ Restart your app
7. ✅ Test by adding a new resource!

## Need Help?

- Check Google Apps Script logs: **"Executions"** tab
- Check Next.js console logs for API errors
- Browser DevTools (F12) → Console tab for frontend errors
- Make sure both URLs are correct (Sheet ID and Deployment URL)

---

**Last Updated:** 2026
**Version:** 1.0
