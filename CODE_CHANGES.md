# Code Changes & Comparison

## 📝 Overview of All Code Changes

This document shows exactly what changed in your code.

---

## 1️⃣ Form Schema Changes

### Before ❌
```typescript
const resourceSchema = z.object({
  year: z.string().min(1, 'Year is required'),
  semester: z.string().min(1, 'Semester is required'),
  module_name: z.string().min(1, 'Module is required'),
  name: z.string().min(1, 'Resource name is required'),
  resourceType: z.enum(['file', 'link']),  // ← Only 2 options
  file: z.instanceof(File).nullable().optional(),  // ← File input
  link: z.string().optional(),
});
```

### After ✅
```typescript
const RESOURCE_TYPES = ['PDF', 'PPT', 'Word', 'TXT', 'Excel', 'Image', 'Video', 'Audio', 'Other'];

const resourceSchema = z.object({
  year: z.string().min(1, 'Year is required'),
  semester: z.string().min(1, 'Semester is required'),
  module_name: z.string().min(1, 'Module is required'),
  name: z.string().min(1, 'Resource name is required'),
  resourceType: z.enum(RESOURCE_TYPES),  // ← 9 types!
  shareableLink: z.string().url('Invalid URL').min(1, 'Required'),  // ← URL only
  description: z.string().optional(),  // ← NEW!
});
```

---

## 2️⃣ Form Submission Changes

### Before ❌
```javascript
// Sent as FormData with file upload
const formData = new FormData()
formData.append('year', values.year)
formData.append('resourceType', values.resourceType)
if (values.resourceType === 'file' && values.file instanceof File) {
  formData.append('file', values.file)
}

fetch('/api/resources', {
  method: 'POST',
  body: formData,  // ← FormData with files
})
```

### After ✅
```javascript
// Sent as JSON with shareable link
const payload = {
  year: values.year,
  semester: values.semester,
  module_name: values.module_name,
  name: values.name,
  resource_type: values.resourceType,
  shareable_link: values.shareableLink,  // ← URL only!
  description: values.description || '',
  uploader_id: currentUserId,
  uploader_name: currentUserName,
}

fetch('/api/resources', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),  // ← JSON body
})
```

---

## 3️⃣ API Route Changes

### Before ❌
```typescript
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  
  // Handle file upload to /public/uploads/resources
  if (resourceType === 'file' && file) {
    // Save file to disk...
    filePath = `/uploads/resources/${filename}`
  }
  
  await sql`INSERT INTO resources ... VALUES (${link})`
}
```

### After ✅
```typescript
export async function POST(request: Request) {
  // Handles both JSON and FormData
  const contentType = request.headers.get('content-type')
  if (contentType.includes('application/json')) {
    const body = await request.json()
    shareable_link = body.shareable_link  // ← URL only!
  }
  
  // Validate URL
  new URL(shareable_link)  // ← Throws if invalid
  
  // Save to database
  await sql`INSERT INTO resources ... VALUES (${shareable_link})`
  
  // Send to Google Sheet (NEW!)
  sendToGoogleSheet({...})  // ← Non-blocking
}
```

---

## 4️⃣ New AppScript Integration

### Before ❌
```javascript
// No Google Sheets integration
```

### After ✅
```typescript
// New function in API route
async function sendToGoogleSheet(resource: any) {
  try {
    const APPSCRIPT_URL = process.env.GOOGLE_APPSCRIPT_DEPLOYMENT_URL
    
    const response = await fetch(APPSCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addResource',
        resource: { ...resource },  // ← Send to Google Sheet
      }),
    })
  } catch (error) {
    console.error('Error sending to Google Sheet:', error)
    // Non-blocking - app continues even if sync fails
  }
}
```

---

## 5️⃣ Form Input Changes

### Before ❌
```typescript
// File input OR Link input (toggle)
{resourceType === 'file' ? (
  <input type="file" ... />
) : (
  <input type="text" placeholder="Link" ... />
)}
```

### After ✅
```typescript
// Resource Type Dropdown
<FormField name="resourceType" render={({ field }) => (
  <Select onValueChange={field.onChange} value={field.value}>
    <SelectContent>
      {RESOURCE_TYPES.map((type) => (
        <SelectItem key={type} value={type}>{type}</SelectItem>
      ))}
    </SelectContent>
  </Select>
)} />

// Shareable Link Input (required)
<FormField name="shareableLink" render={({ field }) => (
  <FormControl>
    <Input 
      placeholder="https://drive.google.com/file/d/..."
      type="url"
      {...field}
    />
  </FormControl>
)} />

// Description (optional)
<FormField name="description" render={({ field }) => (
  <FormControl>
    <Input placeholder="Brief description..." {...field} />
  </FormControl>
)} />
```

---

## 6️⃣ Resource Display Changes

### Before ❌
```typescript
{res.resource_type === 'file' && res.file_path && (
  <Button onClick={() => handleDownload(res.id)}>Download</Button>
)}

{res.resource_type === 'link' && res.link && (
  <a href={res.link}>Visit Link</a>
)}
```

### After ✅
```typescript
{/* Show resource type badge */}
<span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
  {res.resource_type}
</span>

{/* Show description */}
{res.description && (
  <p className="text-sm text-gray-600 line-clamp-2">{res.description}</p>
)}

{/* Show uploader name (NEW!) */}
<div className="text-xs mt-1">By: {res.uploader_name || 'Anonymous'}</div>

{/* Open shareable link */}
<Button onClick={() => handleOpenLink(res.shareableLink, res.name)}>
  <ExternalLink size={16} />
  Open Resource
</Button>
```

---

## 7️⃣ Filtering Changes

### Before ❌
```typescript
const filtered = resources.filter(
  (r) =>
    (!filter.year || r.year === filter.year) &&
    (!filter.semester || r.semester === filter.semester) &&
    (!filter.module_name || r.module_name === filter.module_name)
);
```

### After ✅
```typescript
const filtered = resources.filter(
  (r) =>
    (!filter.year || r.year === filter.year) &&
    (!filter.semester || r.semester === filter.semester) &&
    (!filter.module_name || r.module_name === filter.module_name) &&
    (!filter.resourceType || r.resource_type === filter.resourceType)  // ← NEW!
);
```

---

## 8️⃣ Database Schema Changes

### Before ❌
```sql
CREATE TABLE resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uploader_id VARCHAR(255),
  year VARCHAR(50),
  semester VARCHAR(50),
  module_name VARCHAR(255),
  name VARCHAR(255),
  resource_type VARCHAR(50),
  link VARCHAR(500),
  file_path VARCHAR(500),
  download_count INT DEFAULT 0
);
```

### After ✅
```sql
ALTER TABLE resources ADD COLUMN shareable_link VARCHAR(500);  -- NEW!
ALTER TABLE resources ADD COLUMN uploader_name VARCHAR(255) DEFAULT 'Anonymous';  -- NEW!
ALTER TABLE resources ADD COLUMN description TEXT;  -- NEW!
ALTER TABLE resources ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;  -- NEW!

-- Plus indexes for performance
CREATE INDEX idx_resources_resource_type ON resources(resource_type);
```

---

## 9️⃣ Environment Variables

### Before ❌
```env
# No AppScript integration
```

### After ✅
```env
# NEW! Google Apps Script Deployment URL
GOOGLE_APPSCRIPT_DEPLOYMENT_URL=https://script.googleapis.com/macros/d/[YOUR_ID]/userweb
```

---

## 🔟 New Files Created

### AppScript (`GOOGLE_APPSCRIPT_CODE.gs`)
```javascript
// Main webhook handler
function doPost(e) { ... }

// Add resource to Google Sheet
function addResourceToSheet(resource) { ... }

// Initialize sheet with headers
function initializeSheet() { ... }

// Test the connection
function testAppScript() { ... }

// Get statistics
function getStats() { ... }

// Clear all data
function clearAllData() { ... }
```

---

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Upload Method** | File to server | Shareable link |
| **Resource Types** | 2 (file/link) | 9 (PDF, PPT, Word, etc) |
| **API Request** | FormData with files | JSON with URL |
| **Tracking** | ID only | ID + Name + Timestamp |
| **Data Sync** | Local only | Local + Google Sheets |
| **Description** | None | Optional field |
| **Type Filter** | None | Full filter support |
| **AppScript** | None | Full webhook integration |

---

## Code Quality Improvements

✅ **JSON over FormData**
- Cleaner API contracts
- Easier debugging
- Better type safety

✅ **URL Validation**
- Prevents invalid links
- Better error messages

✅ **Non-blocking AppScript Sync**
- App doesn't wait for sheet sync
- Better performance
- Graceful failure

✅ **Backward Compatible**
- API accepts both JSON and FormData
- Smooth migration

✅ **Better Error Handling**
- Validation on both frontend and backend
- Clear error messages

---

## Performance Impact

✅ **Improved**
- No file storage needed
- Smaller database queries
- Faster uploads (just save metadata)
- Better filtering with indexes

⚠️ **Network**
- Now makes 2 requests (DB + Sheet)
- AppScript call is non-blocking
- ~500ms total extra (after response)

---

This summarizes all code changes from the old system to the new Google Sheets integrated system!
