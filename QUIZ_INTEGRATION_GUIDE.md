# Quiz Backend Integration Guide

## Overview

This guide shows how to integrate the new backend API with the existing frontend without changing any UI components or functions.

## Current Frontend Architecture

The frontend uses:
- React hooks for state management (useState)
- Mock data arrays initialized at the top
- Local state for quizzes, results, comments, ratings
- Client-side event handlers

## Integration Approach

There are 3 ways to integrate:

### Option 1: Minimal Integration (Recommended)
Keep existing structure, just replace mock data with API calls on initial load.

### Option 2: Progressive Integration
Gradually migrate each feature (browse, create, results, etc.)

### Option 3: Full Migration
Complete rewrite of data fetching logic

## Option 1: Minimal Integration (Step-by-Step)

### Step 1: Add useEffect Hook

At the top of `app/quiz/page.tsx`, add:

```typescript
import { useEffect } from 'react'

// Inside QuizPage component, after the useState declarations:
useEffect(() => {
  loadQuizzesFromBackend();
}, []);

async function loadQuizzesFromBackend() {
  try {
    const response = await fetch('/api/quiz');
    const { data } = await response.json();
    
    // Transform backend data to match frontend format
    const transformedQuizzes = data.map(quiz => ({
      ...quiz,
      questions: [] // Will load with each quiz detail page
    }));
    
    setQuizzes(transformedQuizzes);
  } catch (error) {
    console.error('Failed to load quizzes:', error);
    // Falls back to mock data if API fails
  }
}
```

### Step 2: Load Quiz Details On Demand

Modify `handleTakeQuiz` to load full quiz with questions:

```typescript
async function handleTakeQuiz(quizId: string) {
  try {
    const response = await fetch(`/api/quiz/${quizId}`);
    const { data: quiz } = await response.json();
    setPreviewQuiz(quiz);
  } catch (error) {
    console.error('Failed to load quiz:', error);
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) setPreviewQuiz(quiz);
  }
}
```

### Step 3: Save Quiz Creation to Backend

Modify `handleCreateQuiz`:

```typescript
async function handleCreateQuiz(quizData: any) {
  try {
    const response = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...quizData,
        creator: 'Student', // Replace with actual user
      })
    });
    
    const { data: newQuiz } = await response.json();
    
    // Add to frontend state
    setQuizzes([{...newQuiz, questions: quizData.questions}, ...quizzes]);
    setActiveTab('browse');
  } catch (error) {
    console.error('Failed to create quiz:', error);
    // Show error to user
  }
}
```

### Step 4: Save Quiz Submissions

Modify `handleQuizComplete`:

```typescript
async function handleQuizComplete(score: number, answers: number[]) {
  if (selectedQuiz) {
    try {
      // Save to backend
      const response = await fetch(`/api/quiz/${selectedQuiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          participantName: 'You'
        })
      });
      
      const { data: result } = await response.json();
      
      // Update frontend state
      const quizResult: QuizResult = {
        quizId: selectedQuiz.id,
        quizTitle: selectedQuiz.title,
        participantName: 'You',
        score: result.score,
        totalQuestions: result.totalQuestions,
        dateTaken: new Date().toLocaleDateString(),
      };
      
      setQuizResults([quizResult, ...quizResults]);
      
      // Update participants
      setQuizzes(
        quizzes.map((q) =>
          q.id === selectedQuiz.id ? { ...q, participants: q.participants + 1 } : q
        )
      );
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      // Handle error
    }
  }
}
```

### Step 5: Load Comments and Ratings

Add this to load existing comments/ratings when viewing a quiz:

```typescript
async function loadQuizComments(quizId: string) {
  try {
    const [commentsRes, ratingsRes] = await Promise.all([
      fetch(`/api/quiz/${quizId}/comment`),
      fetch(`/api/quiz/${quizId}/rating`)
    ]);
    
    const { data: comments } = await commentsRes.json();
    const { data: ratings } = await ratingsRes.json();
    
    setQuizComments(prev => ({...prev, [quizId]: comments}));
    setQuizRatings(prev => ({...prev, [quizId]: ratings}));
  } catch (error) {
    console.error('Failed to load quiz feedback:', error);
  }
}
```

### Step 6: Save Comments and Ratings

Modify handlers:

```typescript
async function handleAddQuizComment(quizId: string, name: string, message: string) {
  const trimmedName = name.trim();
  const trimmedMessage = message.trim();

  if (!trimmedName || !trimmedMessage) return;

  try {
    const response = await fetch(`/api/quiz/${quizId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName, message: trimmedMessage })
    });
    
    const comment = await response.json();
    
    setQuizComments((prev) => ({
      ...prev,
      [quizId]: [
        {
          name: trimmedName,
          message: trimmedMessage,
          date: new Date().toLocaleString(),
        },
        ...(prev[quizId] || []),
      ],
    }));
  } catch (error) {
    console.error('Failed to add comment:', error);
  }
}

async function handleAddQuizRating(quizId: string, name: string, rating: number) {
  const trimmedName = name.trim();
  if (!trimmedName || rating < 1 || rating > 5) return;

  try {
    const response = await fetch(`/api/quiz/${quizId}/rating`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName, rating })
    });
    
    setQuizRatings((prev) => ({
      ...prev,
      [quizId]: [
        {
          name: trimmedName,
          rating,
          date: new Date().toLocaleString(),
        },
        ...(prev[quizId] || []),
      ],
    }));
  } catch (error) {
    console.error('Failed to add rating:', error);
  }
}
```

## Option 2: Gradual Integration

If you prefer to migrate feature by feature:

### Phase 1: Browse & Display (Week 1)
- Load quizzes from backend on page load
- Load quiz details when taking quiz
- Keep mock data as fallback

### Phase 2: Create & Submit (Week 2)
- Save new quizzes to backend
- Submit quiz answers to backend
- Track scores in database

### Phase 3: Feedback (Week 3)
- Load and save comments
- Load and save ratings
- Display feedback in real-time

## Option 3: Full Migration

Create a custom hook for quiz management:

```typescript
// hooks/useQuizBackend.ts
import { useState, useCallback } from 'react'

export function useQuizBackend() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuizzes = useCallback(async (filters?: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams(filters).toString()
      const url = `/api/quiz${params ? `?${params}` : ''}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch')
      const { data } = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createQuiz = useCallback(async (quizData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      })
      if (!response.ok) throw new Error('Failed to create')
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitQuiz = useCallback(async (quizId: number, answers: number[], participantName: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, participantName })
      })
      if (!response.ok) throw new Error('Failed to submit')
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Add more methods as needed...

  return {
    isLoading,
    error,
    fetchQuizzes,
    createQuiz,
    submitQuiz,
    // Add more methods
  }
}
```

Then use it:

```typescript
const { isLoading, fetchQuizzes, createQuiz, submitQuiz } = useQuizBackend()

useEffect(() => {
  fetchQuizzes().then(setQuizzes)
}, [])
```

## Fallback Strategy

To ensure the app doesn't break if the backend is down:

```typescript
async function fetchData() {
  try {
    const response = await fetch('/api/quiz', {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    if (!response.ok) throw new Error('API error')
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable, using mock data:', error)
    return { data: mockQuizzes } // Fallback to mock data
  }
}
```

## Testing Integration

Before full deployment:

1. **Test individual endpoints** in browser console
2. **Test with small dataset** (1-2 quizzes)
3. **Test error scenarios** (network down, invalid data)
4. **Test with real user actions** (create, submit, comment)
5. **Performance test** (load 50+ quizzes)

## Performance Considerations

- **Lazy load** quiz questions (load only when viewing)
- **Debounce** search/filter requests
- **Cache** frequently accessed data
- **Paginate** results (implement in API later)

```typescript
// Example debounce for filtering
const [searchTerm, setSearchTerm] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    fetchQuizzes({ course: searchTerm })
  }, 300) // Wait 300ms after user stops typing
  
  return () => clearTimeout(timer)
}, [searchTerm])
```

## Monitoring

Add logging to track backend integration:

```typescript
async function apiCall(endpoint: string, options: any = {}) {
  const startTime = performance.now()
  
  try {
    const response = await fetch(endpoint, options)
    const duration = performance.now() - startTime
    
    console.log(`✅ ${endpoint} - ${duration.toFixed(0)}ms`)
    return response
  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`❌ ${endpoint} - ${duration.toFixed(0)}ms`, error)
    throw error
  }
}
```

---

**Recommendation**: Start with Option 1 (Minimal Integration) for quickest implementation, then gradually add more features as needed.
