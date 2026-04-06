# Debug Quiz Creation Issue

## How to Test

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to **Console** tab
3. Create a quiz through the UI
4. Look for these logs:
   - 🚀 Starting quiz creation...
   - 📤 Sending to API...
   - 📥 Response status: (should be 201)
   - ✅ Quiz created successfully in database!

### Step 2: Check Server Logs
In your terminal where `npm run dev` is running, look for these logs:
- 📝 Creating quiz with data: (shows the data sent)
- 📋 Extracted: (shows parsed fields)
- 💾 Inserting quiz into database...
- ✅ Quiz inserted with ID: (shows database ID)
- 📚 Inserting X questions...
- ✅ All questions inserted
- 🎉 Quiz created successfully with ID: X

### Step 3: Quick API Test in Browser Console

Copy and paste this in your browser console:

```javascript
fetch('/api/quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Quiz - Simple Question',
    description: 'This is a simple test quiz to verify database insertion',
    creator: 'Test User',
    year: 1,
    semester: 1,
    course: 'Test Course',
    category: 'Test',
    difficulty: 'Easy',
    duration: 30,
    questions: [{
      question: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1
    }]
  })
})
.then(r => r.json())
.then(d => {
  console.log('Response:', d);
  if (d.status === 'success') {
    console.log('✅ SUCCESS! Quiz ID:', d.data.id);
  } else {
    console.log('❌ ERROR:', d.message);
  }
})
```

## Common Issues & Solutions

### Issue 1: "Error: Year, semester, and course are required"
**Check:**
- Did you select year, semester, and course in the form?
- Look at the console log to see what values were sent

### Issue 2: "Error: Quiz title is required"
**Check:**
- Quiz title must be at least 5 characters
- Description must be at least 10 characters

### Issue 3: "Error: At least one question is required"
**Check:**
- Add at least one question
- Fill in the question text
- Add all 4 options
- Mark the correct answer

### Issue 4: Response status 500 (server error)
**Check:**
- Look at the server logs for the exact error
- Check if DATABASE_URL environment variable is set
- Verify Neon database connection

## Expected Success Response

```json
{
  "status": "success",
  "message": "Quiz created successfully",
  "data": {
    "id": 123,
    "title": "Your Quiz Title",
    "questions": 3
  }
}
```

## After Successful Creation

1. Quiz should appear in the "Browse" tab
2. Check Neon database:
   - Go to Neon console
   - Look in `quizzes` table
   - You should see your new quiz with ID matching the response

3. Questions should be in `quiz_questions` table:
   - Filter by `quiz_id` = the ID from step 2

## Still Not Working?

1. **Note down ALL console messages** (both browser and server)
2. Check if you see these specific logs:
   - 🚀 Starting quiz creation... (means frontend is calling API)
   - 📝 Creating quiz with data... (means backend received data)
   - ✅ Quiz inserted with ID... (means database insert worked)

3. If missing any of these, you found the problem area

Share the console logs and we can fix it specifically!
