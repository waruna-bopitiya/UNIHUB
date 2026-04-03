# Signup Page Setup Guide

## Overview
The signup page is now available at `/auth/signup` with the following features:
- Professional form design matching your project's theme colors
- Email validation (must be @my.sliit.lk)
- Automatic student ID generation (STU00000001, STU00000002, etc.)
- Database integration with Neon PostgreSQL

## Required Fields
- **First Name** (required)
- **Email** (required) - Must end with @my.sliit.lk
- **Phone Number** (required)
- **Year of University** (required) - Radio buttons for years 1-4
- **Semester** (required) - Radio buttons for semesters 1-2

## Optional Fields
- **Second Name**
- **Address**
- **Gender** - Radio buttons for Male, Female, Other

## Database Setup

### 1. Environment Variables
Make sure your `.env.local` file contains:
```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

Get your Neon database connection string from:
https://console.neon.tech/

### 2. Initialize Database
The `users` table will be automatically created when the app starts. The table includes:
- `id` (VARCHAR): Student ID in format STU00000001
- `first_name` (VARCHAR): First name
- `second_name` (VARCHAR): Optional second name
- `email` (VARCHAR): Unique email (must be @my.sliit.lk)
- `phone_number` (VARCHAR): Phone number
- `address` (TEXT): Optional address
- `gender` (VARCHAR): Optional gender
- `year_of_university` (INTEGER): Year 1-4
- `semester` (INTEGER): Semester 1-2
- `created_at` (TIMESTAMPTZ): Account creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

### 3. Access the Signup Page
Navigate to: `http://localhost:3000/auth/signup`

## Features

### Form Validation
- All required fields are validated before submission
- Email format validation (must end with @my.sliit.lk)
- Duplicate email check on backend
- Client-side and server-side validation

### Error Handling
- Clear error messages displayed to the user
- Form maintains data on error
- Proper HTTP status codes returned

### Success Flow
- Student ID displayed on successful signup
- Automatic redirect to home page after 2 seconds
- Form cleared after successful submission

### Design
- Uses your project's color theme (blue/purple primary colors)
- Responsive design (mobile and desktop friendly)
- Professional gradient background
- Card-based layout with proper spacing
- Icons for visual feedback (errors, success)

## API Endpoint

### POST `/api/auth/signup`
**Request Body:**
```json
{
  "firstName": "John",
  "secondName": "Doe",
  "email": "john.doe@my.sliit.lk",
  "phoneNumber": "+94 71 234 5678",
  "address": "123 Main St",
  "gender": "male",
  "yearOfUniversity": "1",
  "semester": "1"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "studentId": "STU00000001"
}
```

**Error Response (400, 409, 500):**
```json
{
  "error": "Error message describing the issue"
}
```

## File Structure
```
app/
├── auth/
│   └── signup/
│       └── page.tsx           # Signup page component
└── api/
    └── auth/
        └── signup/
            └── route.ts       # API endpoint for signup
lib/
├── db.ts                      # Database connection (already exists)
└── db-init.ts                 # Database initialization (updated)
```

## Troubleshooting

### Issue: "DATABASE_URL environment variable is not set"
**Solution:** Add `DATABASE_URL` to your `.env.local` file from your Neon project

### Issue: "Email already registered"
**Solution:** This email is already in the database. Use a different email address.

### Issue: "Email must end with @my.sliit.lk"
**Solution:** Only @my.sliit.lk emails are allowed. Update your email address.

### Issue: Form not submitting
**Solution:** Check that all required fields are filled and email format is correct. Check browser console for errors.

## Next Steps
1. Add phone number format validation if needed
2. Add email verification/confirmation
3. Add password field for authentication
4. Add account activation via email
5. Integrate with authentication system (NextAuth.js, Auth0, etc.)
