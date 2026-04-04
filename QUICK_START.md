# ⚡ Quick Start Guide - UNIHUB Google Sheets Integration

## 🎯 What You Need to Do

### Phase 1: Google Sheet Setup (5 mins)

1. **Create Google Sheet**
   - Go to https://sheets.google.com
   - New → Spreadsheet
   - Name it "UNIHUB Resources"
   - Copy the Sheet ID from URL

2. **Create Google Apps Script**
   - Go to https://script.google.com
   - New Project
   - Delete default code
   - Paste code from `GOOGLE_APPSCRIPT_CODE.gs`
   - Find this line: `SPREADSHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE'`
   - Replace with your Sheet ID

3. **Run Initialization**
   - Select function: `initializeSheet`
   - Click **Run**
   - Grant permissions
   - Check your Google Sheet - should have headers

---

### Phase 2: Deploy AppScript (5 mins)

1. **Deploy as Web App**
   - Click **Deploy** → **New Deployment**
   - Type: "Web app"
   - Execute as: "Me"
   - Allow: "Anyone"
   - Click **Deploy**

2. **Copy Deployment URL**
   - Look for the URL in dialog
   - Should be: `https://script.googleapis.com/macros/d/[ID]/userweb`
   - Keep this URL safe - you need it next!

3. **Test Deployment**
   - Select function: `testAppScript`
   - Click **Run**
   - Should see success message
   - Check Google Sheet for test resource

---

### Phase 3: Update Your App (5 mins)

1. **Add Environment Variable**
   - Open `.env.local` in your project
   - Add new line:
   ```
   GOOGLE_APPSCRIPT_DEPLOYMENT_URL=https://script.googleapis.com/macros/d/[PASTE_YOUR_ID_HERE]/userweb
   ```

2. **Update Database** (if needed)
   - Run migration: `add-google-sheets-columns.sql`
   - Adds new columns to resources table
   - Safe to run (uses IF NOT EXISTS)

3. **Replace Files**
   - Copy new `app/library/resources/page.tsx`
   - Update `app/api/resources/route.ts`
   - Restart your app: `npm run dev` or `pnpm dev`

---

### Phase 4: Test It! (2 mins)

1. **From Browser**
   - Go to https://yourapp.com/library/resources
   - Click "+ Add Resource"
   - Fill in:
     - Year, Semester, Module
     - Resource Name
     - **Type**: PDF (or other)
     - **Link**: Copy-paste Google Drive link
     - Description (optional)
   - Click "Save Resource"

2. **Check Both Locations**
   - Resource appears in your app ✅
   - Resource appears in Google Sheet ✅
   - Log appears in AppScript executions ✅

3. **Test Feedback** (login required)
   - Click resource
   - Add rating/review
   - Should work like before

4. **Test Delete** (uploader only)  
   - Click delete button
   - Should only appear for your resources
   - Should work like before

---

## 📚 Resource Examples (for testing)

### Google Drive Link
1. Upload PDF to Google Drive
2. Right-click → Share
3. Get link (public or with email)
4. Copy full link
5. Paste in "Shareable Link" field

### Other Services
- OneDrive: Get share link
- Dropbox: Get share link  
- GitHub: Direct file link
- Any accessible URL

---

## 🚨 Common Issues & Fixes

### "GOOGLE_APPSCRIPT_DEPLOYMENT_URL not configured"
→ Make sure you added it to `.env.local` and restarted app

### "Invalid URL"
→ Make sure link starts with `https://` or `http://`

### "Spreadsheet not found"
→ Check Sheet ID in AppScript is correct

### Resource not in Google Sheet
→ Check AppScript execution logs for errors

---

## ✅ Success Checklist

- [ ] Google Sheet created
- [ ] AppScript deployed
- [ ] Deployment URL added to `.env.local`
- [ ] Files updated in app
- [ ] App restarted
- [ ] New resource added successfully
- [ ] Resource appears in Google Sheet
- [ ] Google Sheet has correct columns
- [ ] Type filter works (PDF, PPT, etc)
- [ ] Feedback still works
- [ ] Delete still works

---

## 📞 Need Help?

### Check AppScript Logs
- Go to AppScript editor
- Click **Executions** tab
- See all webhook calls and errors

### Check App Console
- Browser: F12 → Console
- Terminal: npm run dev output
- Look for error messages

### Run Tests
- In AppScript: Run `testAppScript()`
- Should see success message
- Check Google Sheet was updated

---

## 🎉 You're Done!

Your app now:
- ✅ Saves resources locally
- ✅ Syncs to Google Sheets automatically
- ✅ Has resource type filter
- ✅ Uses shareable links (no file uploads)
- ✅ Keeps all existing features

**Total Setup Time: ~15-20 minutes**

---

*For detailed information, see `SETUP_GOOGLE_SHEETS.md` and `UPDATE_SUMMARY.md`*
