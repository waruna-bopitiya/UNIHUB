# 🔧 Comments System Troubleshooting

## Error: "Failed to fetch comments"

### 1️⃣ Check if DATABASE_URL is set

**In PowerShell:**
```powershell
# See your current DATABASE_URL
$env:DATABASE_URL

# Should output: postgresql://... (if set)
# If empty, set it:
$env:DATABASE_URL = "your-connection-string"
```

### 2️⃣ Check if table exists

**Option A: Run interactive setup**
```powershell
node scripts/interactive-setup.js
```

**Option B: Run test script**
```powershell
node scripts/test-db.js
```

**Option C: Run setup script** 
```powershell
node scripts/setup-comments-db.js
```

### 3️⃣ Browser Console Messages

After setting DATABASE_URL, refresh the page and check browser console (F12):

**Good signs (should see these):**
```
🔍 Fetching comments for answer: 123 with userId: user123
✅ Fetched comments: [...]
```

**Bad signs (means table doesn't exist):**
```
❌ Error fetching comments
❌ API Error: relation "answer_comments" does not exist
```

If you see the "bad signs", run:
```powershell
node scripts/setup-comments-db.js
```

---

## Step-by-Step Fix

### 1. Get Database URL
- Login to [Neon Console](https://console.neon.tech)
- Click your project → Connection string
- Copy the full URL

### 2. Set Environment Variable
```powershell
# In PowerShell, copy-paste (replace YOUR_URL):
$env:DATABASE_URL = "YOUR_URL"

# Verify it worked:
$env:DATABASE_URL
```

### 3. Create Comments Table
```powershell
node scripts/setup-comments-db.js
```

### 4. Refresh Browser
- Close and reopen the page
- Go to Q&A section
- Try adding a comment

### 5. Check Console
Open browser console (F12) and verify:
```
✅ Fetched comments: [...]  ← Should see this
```

---

## Common Issues

| Error | Solution |
|-------|----------|
| `DATABASE_URL not set` | Set environment variable (Step 2) |
| `relation "answer_comments" does not exist` | Run setup script (Step 3) |
| `User not found` | Make sure you're logged in |
| `Failed to fetch comments` | Check browser console, then run setup script |

---

## Getting Help

Check these files and console logs:

1. **Browser Console** (F12 → Console tab)
   - Look for 🔍, ❌, ✅ messages
   
2. **Terminal/Server Logs**
   - Should show logs starting with 📝, 🔍, ✅, ❌

3. **Table Structure**
   ```powershell
   node scripts/test-db.js
   ```

---

## Verify Everything Works

```powershell
# 1. Check connection
node scripts/test-db.js

# 2. Interactive setup
node scripts/interactive-setup.js

# 3. Check specific database
# You should see:
# ✅ answer_comments table exists
```

After running these, refresh browser and try to:
- ✅ Load comments
- ✅ Add new comment
- ✅ Edit comment
- ✅ Delete comment
- ✅ Refresh comments

All should work without errors!
