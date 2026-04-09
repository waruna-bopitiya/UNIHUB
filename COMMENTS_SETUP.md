# 📋 Comment System Setup Guide

## Problem
The `answer_comments` table doesn't exist in your Neon database yet.

## Solution - Quick Setup (3 Steps)

### Step 1: Get Your DATABASE_URL
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click "Connection string"
4. Copy the full connection string (looks like: `postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require`)

### Step 2: Set DATABASE_URL in PowerShell
```powershell
# Copy-paste this in your PowerShell terminal (replace with your actual URL)
$env:DATABASE_URL = "postgresql://your_user:your_password@ep-xxx.us-east-1.aws.neon.tech/your_db?sslmode=require"

# Verify it's set
$env:DATABASE_URL
```

### Step 3: Run Setup Script
```powershell
cd c:\Users\TUF\Documents\GitHub\UNIHUB
node scripts/setup-comments-db.js
```

You should see:
```
✅ Connected to database
✅ answer_comments table exists
📊 Table Structure:
...
✅ Database setup complete!
```

## Troubleshooting

### Error: "DATABASE_URL not set"
- Make sure you set the environment variable in PowerShell (see Step 2)
- The variable is only set for that PowerShell session

### Error: "relation "answer_comments" does not exist"
- Run the setup script (Step 3)

### Error: Connection failed
- Check your DATABASE_URL is correct
- Make sure you copied the entire connection string
- Test by running: `node scripts/test-db.js`

## Verify Setup
Run this to check everything:
```powershell
node scripts/test-db.js
```

Expected output:
```
✅ Database connected!
✅ Found X answers in database  
✅ Found X students in database
✅ Found 0 comments in database (or more if you have comments)
```

## After Setup
- Comments feature will work automatically
- Users can create, edit, delete comments
- Comments are stored in the `answer_comments` table
- Auto-refresh works from the UI

---

Need help? Check the server logs (F12 → Console) for detailed error messages.
