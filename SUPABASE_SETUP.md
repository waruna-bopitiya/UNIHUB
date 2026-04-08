# Supabase Document Upload Setup Guide

## Overview
This application now supports uploading documents directly to Supabase Storage. Users can either:
1. **Share a Link** - Provide a shareable link from Google Drive, OneDrive, SharePoint, or GitHub
2. **Upload Document** - Upload a document file directly to Supabase (PDF, PPT, Word, Excel, Images, Video, Audio)

## Prerequisites

- [Supabase Account](https://supabase.com) (free tier available)
- Your project database already connected (Neon with your existing setup)

## Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"** or log in if you have an account
3. Fill in the project details:
   - **Name**: Choose any name (e.g., "unihub-resources")
   - **Database Password**: Use a strong password
   - **Region**: Choose the region closest to your users
   - **Pricing**: Free tier is sufficient for starting

4. Click **"Create new project"** and wait for setup to complete

### 2. Get Supabase Credentials

1. In your Supabase project, go to **Settings** (bottom left)
2. Click **API** from the left menu
3. You'll see:
   - **Project URL** - Copy this
   - **Anon Key** - Copy this (under "anon public")
   - **Service Role Secret** - Keep this secret (only if needed for server operations)

### 3. Create Storage Bucket

1. In Supabase, go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Name it: `resource-documents` (exactly this name)
4. **Uncheck** "Make bucket private" (to make files publicly accessible)
5. Click **Create bucket**

### 4. Set Bucket Policies (Optional but Recommended)

1. Go to the `resource-documents` bucket
2. Click **Policies** tab
3. Add this policy to allow uploads:
   - **Everyone can upload**: Create a policy that allows INSERT, UPDATE, DELETE

Or use the simple approach: Files will be public URLs accessible to anyone with the link.

### 5. Add Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ujtloemrqvxkddtjtqpe.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_zB8nMJDsYs6h9yd34_8QhQ_SiomykBj
```

**Replace:**
- `YOUR_PROJECT_ID` - First part of your Supabase Project URL (before `.supabase.co`)
- `YOUR_ANON_KEY_HERE` - The Anon Public Key from Supabase Settings

### Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdef123456xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Restart Development Server

After adding environment variables:

```bash
# Stop the dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Features Implemented

### Upload Methods
- **Shareable Link**: Upload resources stored on Google Drive, OneDrive, SharePoint, or GitHub
- **Direct Upload**: Upload documents to Supabase Storage
  - Supported formats: PDF, PPT, PPTX, DOC, DOCX, TXT, XLS, XLSX, Images, Video, Audio
  - Max file size: 50MB

### API Endpoints

#### 1. **POST /api/resources** (Existing - Shareable Links)
Upload a resource with a shareable link.

**Request:**
```json
{
  "year": "1",
  "semester": "1",
  "module_name": "CS101",
  "name": "Chapter 3 Notes",
  "resource_type": "PDF",
  "shareable_link": "https://drive.google.com/file/d/...",
  "description": "Important notes from lecture",
  "uploader_id": "user123",
  "uploader_name": "John Doe"
}
```

#### 2. **POST /api/resources/upload** (New - File Uploads)
Upload a document file to Supabase Storage.

**Request:** (multipart/form-data)
```
year: "1"
semester: "1"
module_name: "CS101"
name: "Chapter 3 Notes"
resourceType: "PDF"
description: "Important notes"
uploaderId: "user123"
uploaderName: "John Doe"
file: <File object>
```

**Response:**
```json
{
  "id": 123,
  "uploader_id": "user123",
  "uploader_name": "John Doe",
  "year": "1",
  "semester": "1",
  "module_name": "CS101",
  "name": "Chapter 3 Notes",
  "resource_type": "PDF",
  "file_path": "https://[supabase_url]/storage/v1/object/public/resource-documents/...",
  "description": "Important notes",
  "created_at": "2026-04-08T10:30:00Z",
  "upload_type": "file"
}
```

## Database Schema

The `resources` table now supports both upload methods:

```sql
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  uploader_id VARCHAR(50),
  uploader_name VARCHAR(255),
  year VARCHAR(50),
  semester VARCHAR(50),
  module_name VARCHAR(500),
  name VARCHAR(500),
  resource_type VARCHAR(50),
  
  -- Shareable Link Method
  shareable_link TEXT,
  
  -- File Upload Method
  file_path VARCHAR(500),
  
  description TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## File Storage Structure (Supabase)

Files are organized by user ID and timestamp:

```
resource-documents/
  └── user123/
      ├── 1712572200000-notes.pdf
      ├── 1712572300000-presentation.pptx
      └── 1712572400000-lecture.mp4
```

## Display Resources

When displaying resources, the component handles both types automatically:

- If `file_path` exists → Show download button linking to Supabase file
- If `shareable_link` exists → Show "Open Link" button
- Both can be present (user choice)

## Frontend Usage

### Adding a Resource (Shareable Link)
1. Users click **"+ Add Resource"**
2. Fill in: Year, Semester, Module, Name, Resource Type
3. Select **"🔗 Shareable Link"** method
4. Paste or enter the shareable link
5. Add optional description
6. Click **"✓ Save Resource"**

### Adding a Resource (File Upload)
1. Users click **"+ Add Resource"**
2. Fill in: Year, Semester, Module, Name, Resource Type
3. Select **"📤 Upload File"** method
4. Click the upload area or drag & drop a file
5. Add optional description
6. Click **"📤 Upload Document"**
7. Monitor upload progress

## Troubleshooting

### "Environment variables not set" Error
- Check `.env.local` exists in project root
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present
- Restart dev server after adding env vars

### Upload Fails with "File type not allowed"
- Check file extension against allowed types
- Supabase only accepts: PDF, PPT, PPTX, DOC, DOCX, TXT, XLS, XLSX, Image, Video, Audio

### File Upload Progress Stuck
- Check file size (max 50MB)
- Check network connection
- Verify Supabase bucket permissions

### Files Not Accessible After Upload
- Ensure bucket is **not private** (uncheck "Make bucket private")
- Check bucket policies allow public access

## Security Notes

### Public URLs
Files uploaded to this bucket are **publicly accessible** via their URL. Consider:
- Don't store sensitive documents
- Use Supabase RLS (Row Level Security) for private content if needed
- Document sharing is logged in database

### Rate Limiting
- Implement rate limiting on `/api/resources/upload` if needed
- Monitor storage usage on Supabase dashboard

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Create storage bucket
3. ✅ Add environment variables
4. ✅ Test upload feature
5. (Optional) Implement update feature for uploaded documents
6. (Optional) Add delete functionality for uploaded files

## Example Implementation

### User Uploads a File

```
User Interface
    ↓
/api/resources/upload (Form Data with File)
    ↓
Supabase Storage
    ↓
Returns Public URL
    ↓
Saved to Database (file_path)
    ↓
Available for Download/Viewing
```

## Support

For issues:
- Check Supabase console logs
- Verify credentials in `.env.local`
- Review browser console for JavaScript errors
- Check API response status codes
