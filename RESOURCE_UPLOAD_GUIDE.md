# Resource Upload Enhancement - Complete Guide

## 🎯 Overview

This update adds **dual upload methods** for resources, allowing users to either:
1. **Share via Link** - Use shareable links from cloud services
2. **Upload Documents** - Upload files directly to Supabase Storage

## 📋 What Changed

### New Features

#### 1. **File Upload to Supabase Storage**
- Users can upload documents (PDF, PPT, Word, Excel, Images, Video, Audio)
- Max file size: 50MB
- Upload progress tracking
- Automatic file organization by user/timestamp

#### 2. **Upload Method Toggle**
- Easy switch between "Shareable Link" and "Upload File" methods
- Conditional form fields based on selected method
- Real-time validation

#### 3. **New API Endpoint**
- `POST /api/resources/upload` - Handles file uploads
- `PATCH /api/resources/[id]` - Update resource metadata

#### 4. **Database Schema Updates**
- Added `shareable_link` column (for link-based uploads)
- Added `uploader_name` column (for better attribution)
- Added `description` column (optional notes)
- Added `updated_at` column (track modifications)

## 🚀 Implementation Details

### Files Created/Modified

```
📂 Project Root
├── 📄 lib/supabase.ts (NEW)
│   └── Supabase client setup & file operations
├── 📄 app/api/resources/upload/route.ts (NEW)
│   └── File upload endpoint
├── 📄 app/api/resources/[id]/route.ts (NEW)
│   └── Update resource metadata
├── 📄 app/library/resources/page.tsx (UPDATED)
│   └── Added dual upload UI
├── 📄 lib/db-init.ts (UPDATED)
│   └── Added schema migrations
└── 📄 SUPABASE_SETUP.md (NEW)
    └── Setup & configuration guide
```

### Component Changes (page.tsx)

**Upload Method Toggle:**
```tsx
<Button variant={uploadMethod === 'link' ? 'default' : 'ghost'}>
  🔗 Shareable Link
</Button>
<Button variant={uploadMethod === 'file' ? 'default' : 'ghost'}>
  📤 Upload File
</Button>
```

**Conditional Fields:**
- Show "Shareable Link" input if `uploadMethod === 'link'`
- Show "File Upload" area if `uploadMethod === 'file'`

**Upload Progress:**
- Real-time progress bar during file upload
- Shows percentage and file size info

### API Changes

#### POST /api/resources (Existing - Enhanced)
Now handles JSON with shareable links.

#### POST /api/resources/upload (New)
Handles multipart form data with file upload to Supabase.

**Request:**
```
POST /api/resources/upload
Content-Type: multipart/form-data

year: "1"
semester: "1"
module_name: "CS101"
name: "Lecture Notes"
resourceType: "PDF"
description: "Chapter notes"
uploaderId: "user123"
uploaderName: "John Doe"
file: <binary file data>
```

**Response (201 Created):**
```json
{
  "id": 456,
  "uploader_id": "user123",
  "uploader_name": "John Doe",
  "year": "1",
  "semester": "1",
  "module_name": "CS101",
  "name": "Lecture Notes",
  "resource_type": "PDF",
  "file_path": "https://[supabase-url]/storage/v1/object/public/resource-documents/user123/1712345678000-notes.pdf",
  "shareable_link": null,
  "description": "Chapter notes",
  "created_at": "2026-04-08T10:30:00Z",
  "upload_type": "file"
}
```

#### PATCH /api/resources/[id] (New)
Update resource metadata.

**Request:**
```json
{
  "name": "Updated Lecture Notes",
  "description": "Latest version",
  "resource_type": "PDF",
  "updaterId": "user123"
}
```

### Database Schema

**Resources Table (Updated):**
```sql
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  uploader_id VARCHAR(50) NOT NULL,
  uploader_name VARCHAR(255) DEFAULT 'Anonymous',
  year VARCHAR(50) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  module_name VARCHAR(500) NOT NULL,
  name VARCHAR(500) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  
  -- Original link storage
  link TEXT,
  
  -- New upload features
  shareable_link TEXT,
  file_path VARCHAR(500),
  description TEXT,
  
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (uploader_id) REFERENCES users(id)
);
```

## 🔧 Setup Instructions

### 1. Install Supabase Package
```bash
npm install @supabase/supabase-js
```
✅ Already done in this implementation

### 2. Set Up Supabase Project
Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions:
- Create Supabase project
- Create `resource-documents` bucket
- Get API credentials

### 3. Configure Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 4. Restart Development Server
```bash
npm run dev
```

## 📱 User Interface

### Adding a Resource (Shareable Link)
1. Click "**+ Add Resource**"
2. Select Year, Semester, Module
3. Enter Resource Name & Type
4. Choose "**🔗 Shareable Link**" method
5. Paste shareable link URL
6. Add optional description
7. Click "**✓ Save Resource**"

### Adding a Resource (File Upload)
1. Click "**+ Add Resource**"
2. Select Year, Semester, Module
3. Enter Resource Name & Type
4. Choose "**📤 Upload File**" method
5. Click upload area or drag & drop file
6. Add optional description
7. Watch upload progress
8. Click "**📤 Upload Document**"

### Resource Display
- Shows file name, uploader, date
- "Open Link" button for shared links
- Direct download for uploaded files
- Average rating from feedback
- Delete option for owners

## 🔐 Security Features

### Ownership Verification
- Only resource uploader can delete/update
- User ID checked on server-side
- Permissions enforced via `updaterId` check

### File Validation
- File type whitelist enforcement
- File size limit (50MB)
- Mime type verification
- Secure Supabase storage

### Data Privacy
- Files stored in Supabase (encrypted at rest)
- Public URLs for sharing
- Database stores metadata only
- No sensitive data in URLs

## 📊 Logging & Debugging

### Console Output
The implementation includes detailed logging:
- File upload starts: `📤 Uploading file to Supabase: [filename]`
- Upload progress: `📊 Upload progress: 45.23%`
- Success: `✅ File uploaded successfully: [filename]`
- Errors: `❌ [Error details]`

### Browser DevTools
Check Console tab for:
- Upload lifecycle events
- API response status
- File validation results
- Supabase errors

## 🐛 Troubleshooting

### Common Issues

**1. Upload Fails - "Missing required fields"**
- Ensure all fields filled: Year, Semester, Module, Name, Type
- File must be selected for file upload method

**2. Upload Fails - "File type not allowed"**
- Check file extension
- Allowed: PDF, PPT, PPTX, DOC, DOCX, TXT, XLS, XLSX, Images, Video, Audio
- Maximum file size: 50MB

**3. "Environment variables not set"**
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- Restart dev server (Ctrl+C, then `npm run dev`)

**4. Uploaded Files Not Accessible**
- Ensure Supabase bucket is **not private**
- Check bucket policies allow public access
- Verify file path in browser is accessible

**5. Upload Progress Stuck**
- Check network tab (F12) for failed requests
- Verify file size < 50MB
- Try smaller file first to test

## 🔄 Workflow Example

### User uploads a PDF:

```
┌─────────────────────────────────────────┐
│ React Component (page.tsx)              │
│ - Form validation                       │
│ - File selection                        │
│ - Progress tracking                     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ API Endpoint: /api/resources/upload     │
│ - Parse multipart form data             │
│ - Validate file properties              │
│ - Call Supabase upload function         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Supabase Storage (resource-documents)   │
│ - Store file in user folder             │
│ - Generate public URL                   │
│ - Return file path                      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Database (resources table)              │
│ - Store metadata                        │
│ - Save file_path URL                    │
│ - Log uploader and timestamp            │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Response to User                        │
│ - Success toast notification            │
│ - Add resource to UI                    │
│ - Clear form for next upload             │
└─────────────────────────────────────────┘
```

## 📚 API Documentation

### File Upload Endpoint

**Endpoint:** `POST /api/resources/upload`

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| year | string | Yes | Academic year |
| semester | string | Yes | Semester |
| module_name | string | Yes | Module/Subject code |
| name | string | Yes | Resource display name |
| resourceType | string | Yes | Type (PDF, PPT, etc.) |
| uploaderId | string | Yes | Uploader's user ID |
| uploaderName | string | No | Uploader's display name |
| description | string | No | Optional description |
| file | File | Yes | File object to upload |

**Success Response (201):**
```json
{
  "id": 456,
  "uploader_id": "user123",
  "uploader_name": "John",
  "year": "1",
  "semester": "1",
  "module_name": "CS101",
  "name": "Notes",
  "resource_type": "PDF",
  "file_path": "https://...",
  "description": "...",
  "created_at": "2026-04-08T...",
  "upload_type": "file"
}
```

**Error Responses:**
- `400` - Missing fields or invalid file
- `413` - File size > 50MB
- `500` - Upload/storage error

### Update Endpoint

**Endpoint:** `PATCH /api/resources/[id]`

**Request Body:**
```json
{
  "name": "New Name",
  "description": "New Description",
  "resource_type": "PPT",
  "updaterId": "user123"
}
```

**Success Response (200):**
```json
{
  "id": 456,
  "name": "New Name",
  "description": "New Description",
  "resource_type": "PPT",
  "updated_at": "2026-04-08T..."
}
```

## ✅ Testing Checklist

- [ ] Supabase project created and configured
- [ ] Environment variables set
- [ ] App starts without errors
- [ ] Can create resource with shareable link
- [ ] Can create resource by uploading file
- [ ] Upload progress bar shows
- [ ] File appears in resources list
- [ ] Can open/download uploaded file
- [ ] Can update resource (name/description)
- [ ] Can delete resource (if owner)
- [ ] Google Sheets sync works (if configured)

## 🚀 Performance Considerations

### File Upload Optimization
- XMLHttpRequest for progress tracking
- 50MB file size limit reduces storage costs
- Organized by user/timestamp for easy cleanup
- Bucket caching enabled (3600s)

### Database Optimization
- Indexed on uploader_id
- Indexed on created_at for sorting
- Indexed on resource_type for filtering

### Network
- Progress event firing approx every 128KB
- Timeout recommended: 10+ minutes for large files

## 📞 Support & Next Steps

### Completed
✅ Dual upload methods  
✅ Supabase integration  
✅ File storage system  
✅ Update functionality  
✅ Progress tracking  

### Future Enhancements
- [ ] Drag & drop file upload UI
- [ ] Thumbnail previews for images
- [ ] Bulk upload support
- [ ] File compression/optimization
- [ ] Advanced search filters
- [ ] Resource sharing via link
- [ ] Version control for documents
- [ ] Comments on uploads
