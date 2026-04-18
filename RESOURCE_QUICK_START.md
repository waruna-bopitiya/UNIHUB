# 🚀 Quick Start: Resource Upload with Supabase

## 5-Minute Setup

### Step 1: Get Supabase Credentials (2 minutes)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (any region, save the password)
3. Go to **Settings → API** and copy:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **Anon Key** (long string starting with `ey...`)

### Step 2: Create Storage Bucket (1 minute)
1. In Supabase, click **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Name: `resource-documents`
4. **Uncheck** "Make bucket private"
5. Click **Create**

### Step 3: Configure Environment Variables (1 minute)
1. Open `.env.local` in your project root (create if missing):
```env
NEXT_PUBLIC_SUPABASE_URL=https://ujtloemrqvxkddtjtqpe.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_zB8nMJDsYs6h9yd34_8QhQ_SiomykBj
```

2. Save the file (keep these credentials secret - never commit to git!)

### Step 4: Restart Dev Server (1 minute)
```bash
# Stop: Ctrl+C
# Start:
npm run dev
```

✅ **Done!** You're ready to upload files!

## Test It Out

### Upload Your First Document

1. Open the app: `http://localhost:3000`
2. Navigate to **Library → Resources**
3. Click **"+ Add Resource"**
4. Fill in:
   - Year: 1
   - Semester: 1
   - Module: CS101
   - Name: "Test Document"
   - Type: PDF
5. Choose **"📤 Upload File"** method
6. Click the upload area and select a PDF file
7. Click **"📤 Upload Document"**
8. Watch the progress bar!

### Share via Link (Alternative)

1. Click **"+ Add Resource"**
2. Fill in the same fields
3. Choose **"🔗 Shareable Link"** method
4. Paste a Google Drive/OneDrive link
5. Click **"✓ Save Resource"**

## What You Get

### Storage ☁️
- Files stored securely in Supabase
- Auto-organized by user and date
- Max 50MB per file
- Publicly accessible via URL

### Database 📊
- Metadata saved (name, type, dates)
- Uploader tracked
- Upload progress syncedwith Google Sheets (if configured)
- Easy to search and filter

### User Interface 🎨
- Toggle between link and file upload
- Real-time progress bar
- File preview before upload
- Clear error messages

## File Types Supported

✅ **Documents:** PDF, PPT, PPTX, DOC, DOCX, TXT, XLS, XLSX  
✅ **Images:** JPG, PNG, GIF, WEBP  
✅ **Video:** MP4, MPEG  
✅ **Audio:** MP3, WAV, WEBM  

❌ Not supported: EXE, ZIP, BAT, SH, or other executable files

## Common Questions

**Q: Can I use this without Supabase?**  
A: Yes! The shareable link method works without Supabase. File uploads require Supabase.

**Q: Can users upload large files?**  
A: Max 50MB per file. For larger files, compress before uploading.

**Q: Are uploaded files private?**  
A: Files are publicly accessible via URL, but only shareable link you generate (or database) reveals the URL.

**Q: Can I delete uploaded files?**  
A: When a resource is deleted from the database, the file should also be removed from Supabase (implement delete handler in API).

**Q: What if upload fails?**  
A: Check browser console (F12) for specific error. Most common: wrong Supabase credentials or bucket name.

## Troubleshooting

### Error: "Environment variables not set"
❌ Problem: `.env.local` missing or incomplete
✅ Solution: 
- Create `.env.local` in project root
- Add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server

### Error: "File type not allowed"
❌ Problem: File extension not supported
✅ Solution: Use supported formats (PDF, PPT, DOC, DOCX, XLS, XLSX, IMG, VID, AUD)

### Error: "Upload failed"
❌ Problem: Network error or file too large
✅ Solution: 
- Check file size is < 50MB
- Check internet connection
- Try smaller test file first
- Check browser console for details (F12)

### Files not showing after upload
❌ Problem: Database saved but file might not be accessible
✅ Solution:
- Refresh the page
- Check Supabase bucket is not private
- Verify file_path in database is correct

## Next Steps

### For Production
1. Add rate limiting to `/api/resources/upload`
2. Implement file delete (removes from Supabase)
3. Add file compression for PDFs
4. Monitor Supabase storage usage
5. Set up automatic cleanup for old files

### Optional Features
- Drag & drop UI improvements
- Image thumbnails
- Bulk upload
- File versioning
- Access logs
- Sharing via token

## Resources

📖 [Full Setup Guide](./SUPABASE_SETUP.md)  
📚 [Feature Documentation](./RESOURCE_UPLOAD_GUIDE.md)  
🔗 [Supabase Docs](https://supabase.com/docs)  
💬 [Community Help](https://supabase.com/community)  

## Key Files

```
lib/supabase.ts              ← Supabase configuration
app/api/resources/upload/    ← File upload endpoint
app/api/resources/[id]/      ← Update resource endpoint
app/library/resources/       ← Upload UI component
```

---

**Questions?** Check the logs in browser console (F12) for detailed error messages and next steps.
