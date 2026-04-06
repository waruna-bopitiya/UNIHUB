# Quiz Backend API Documentation

## Overview
The Quiz Backend provides RESTful endpoints for managing quizzes, submitting answers, and managing user feedback (comments and ratings).

## Database Schema

### quizzes
- `id`: Primary key
- `title`: Quiz title
- `description`: Quiz description
- `creator`: Name of quiz creator
- `year`: Year (1-4)
- `semester`: Semester (1-2)
- `course`: Course name
- `category`: Category
- `difficulty`: 'Easy' | 'Medium' | 'Hard'
- `duration`: Duration in minutes
- `participants`: Number of participants
- `created_at`, `updated_at`: Timestamps

### quiz_questions
- `id`: Primary key
- `quiz_id`: Foreign key to quizzes
- `question_text`: The question
- `options`: Array of answer options
- `correct_answer`: Index of correct answer
- `question_order`: Order of question in quiz

### quiz_responses
- `id`: Primary key
- `quiz_id`: Foreign key to quizzes
- `participant_name`: Name of participant who took quiz
- `answers`: Array of answer indices submitted
- `score`: Number of correct answers
- `total_questions`: Total questions in quiz
- `date_taken`: When quiz was taken

### quiz_comments
- `id`: Primary key
- `quiz_id`: Foreign key to quizzes
- `name`: Comment author name
- `message`: Comment text
- `created_at`: Timestamp

### quiz_ratings
- `id`: Primary key
- `quiz_id`: Foreign key to quizzes
- `name`: Name of rater
- `rating`: Rating 1-5
- `created_at`: Timestamp

## API Endpoints

### GET /api/quiz
List all quizzes with optional filtering

**Query Parameters:**
- `year` (optional): Filter by year (1-4)
- `semester` (optional): Filter by semester (1-2)
- `course` (optional): Filter by course (partial match)
- `category` (optional): Filter by category (partial match)
- `difficulty` (optional): Filter by difficulty (Easy, Medium, Hard)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "Quiz Title",
      "description": "Description",
      "creator": "Prof. Name",
      "year": 1,
      "semester": 1,
      "course": "Course Name",
      "category": "Category",
      "difficulty": "Easy",
      "duration": 30,
      "participants": 150,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

**Example:**
```
GET /api/quiz?year=1&semester=1&difficulty=Easy
```

---

### POST /api/quiz
Create a new quiz

**Request Body:**
```json
{
  "title": "Quiz Title",
  "description": "Quiz Description",
  "creator": "Prof. Name",
  "year": 1,
  "semester": 1,
  "course": "Course Name",
  "category": "Category",
  "difficulty": "Easy",
  "duration": 30,
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 1
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Quiz created successfully",
  "data": {
    "id": 1,
    "title": "Quiz Title",
    "questions": 1
  }
}
```

---

### GET /api/quiz/[id]
Get a specific quiz with all its questions

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "Quiz Title",
    "description": "Description",
    "creator": "Prof. Name",
    "year": 1,
    "semester": 1,
    "course": "Course Name",
    "category": "Category",
    "difficulty": "Easy",
    "duration": 30,
    "participants": 150,
    "questions": [
      {
        "id": "1",
        "question": "Question text?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": 1
      }
    ]
  }
}
```

---

### POST /api/quiz/[id]/submit
Submit quiz answers and get score

**Request Body:**
```json
{
  "answers": [1, 2, 0, 3],
  "participantName": "Student Name"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Quiz submitted successfully",
  "data": {
    "score": 3,
    "totalQuestions": 4,
    "percentage": 75,
    "dateTaken": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /api/quiz/[id]/comment
Get all comments for a quiz

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "name": "Student Name",
      "message": "Great quiz!",
      "date": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### POST /api/quiz/[id]/comment
Add a comment to a quiz

**Request Body:**
```json
{
  "name": "Student Name",
  "message": "Great quiz!"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Comment added successfully",
  "data": {
    "name": "Student Name",
    "message": "Great quiz!",
    "date": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /api/quiz/[id]/rating
Get all ratings for a quiz

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "name": "Student Name",
      "rating": 5,
      "date": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "averageRating": 4.5
}
```

---

### POST /api/quiz/[id]/rating
Add a rating to a quiz

**Request Body:**
```json
{
  "name": "Student Name",
  "rating": 4
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Rating added successfully",
  "data": {
    "name": "Student Name",
    "rating": 4,
    "date": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /api/quiz/results
Get quiz results with optional filtering

**Query Parameters:**
- `quizId` (optional): Filter by quiz ID
- `participantName` (optional): Filter by participant name (partial match)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "quizId": 1,
      "quizTitle": "Quiz Title",
      "participantName": "Student Name",
      "score": 3,
      "totalQuestions": 4,
      "dateTaken": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

## Error Responses

All endpoints follow consistent error response format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Successful GET or update
- `201 Created` - Resource successfully created
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Usage Examples

### JavaScript/TypeScript with Fetch API

```typescript
// Fetch all quizzes for year 1, semester 1
const response = await fetch('/api/quiz?year=1&semester=1');
const { data, count } = await response.json();

// Get a specific quiz
const quizResponse = await fetch('/api/quiz/1');
const quiz = await quizResponse.json();

// Submit quiz answers
const submitResponse = await fetch('/api/quiz/1/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: [1, 2, 0, 3],
    participantName: 'John Doe'
  })
});
const result = await submitResponse.json();

// Add a comment
const commentResponse = await fetch('/api/quiz/1/comment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    message: 'Great quiz!'
  })
});

// Add a rating
const ratingResponse = await fetch('/api/quiz/1/rating', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    rating: 4
  })
});

// Get quiz results
const resultsResponse = await fetch('/api/quiz/results?participantName=John');
const results = await resultsResponse.json();
```

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. The `participantName` field is optional and defaults to 'Anonymous'
3. The `options` array should contain the text for each answer option
4. The `correctAnswer` is 0-indexed (0 = first option, 1 = second option, etc.)
5. Rating values must be between 1 and 5
6. Comments and ratings support anonymous submissions (omit `name` field)
