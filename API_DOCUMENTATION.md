# Azora ES API Documentation

This document provides comprehensive API documentation for the Azora ES microservices platform.

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [User Service](#user-service)
- [Session Service](#session-service)
- [Course Service](#course-service)
- [Enrollment Service](#enrollment-service)
- [AI Agent Service](#ai-agent-service)
- [Analytics Service](#analytics-service)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Overview

Azora ES provides a RESTful API across multiple microservices. All services run on different ports and communicate internally.

### Base URLs
- **User Service**: `http://localhost:8080` (local) / `https://api.azora.world/users`
- **Session Service**: `http://localhost:8083` (local) / `https://api.azora.world/sessions`
- **Course Service**: `http://localhost:8081` (local) / `https://api.azora.world/courses`
- **Enrollment Service**: `http://localhost:8082` (local) / `https://api.azora.world/enrollments`
- **AI Agent Service**: `http://localhost:8085` (local) / `https://api.azora.world/ai`
- **Analytics Service**: `http://localhost:8086` (local) / `https://api.azora.world/analytics`

### Common Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt-token>  # Required for authenticated endpoints
X-API-Key: <api-key>              # Optional for service-to-service calls
```

## Authentication

### JWT Token Flow
1. User registers/logs in via User Service
2. Receives JWT token in response
3. Include token in `Authorization: Bearer <token>` header for subsequent requests
4. Token expires after 24 hours (configurable)

### Session Management
- Sessions are managed via Session Service
- JWT tokens are validated against Redis-backed sessions
- Automatic cleanup of expired sessions

## User Service

**Port**: 8080

### Register User
```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token-here"
}
```

### Login User
```http
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**: Same as register

### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Update User
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### Delete User
```http
DELETE /users/profile
Authorization: Bearer <token>
```

## Session Service

**Port**: 8083

### Validate Session
```http
GET /sessions/validate
Authorization: Bearer <token>
```

**Response**:
```json
{
  "valid": true,
  "userId": "uuid",
  "expiresAt": "2024-01-02T00:00:00Z"
}
```

### Refresh Token
```http
POST /sessions/refresh
Authorization: Bearer <token>
```

**Response**:
```json
{
  "token": "new-jwt-token",
  "expiresAt": "2024-01-02T00:00:00Z"
}
```

### Logout
```http
POST /sessions/logout
Authorization: Bearer <token>
```

## Course Service

**Port**: 8081

### Create Course
```http
POST /courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction to AI",
  "description": "Learn the basics of artificial intelligence",
  "instructorId": "uuid",
  "category": "Technology",
  "difficulty": "beginner",
  "duration": 3600,
  "price": 99.99,
  "tags": ["AI", "Machine Learning"],
  "modules": [
    {
      "title": "What is AI?",
      "content": "AI definition and history...",
      "order": 1
    }
  ]
}
```

### Get Courses
```http
GET /courses?page=1&limit=10&category=Technology&difficulty=beginner
```

**Response**:
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "Introduction to AI",
      "description": "Learn the basics...",
      "instructorId": "uuid",
      "category": "Technology",
      "difficulty": "beginner",
      "duration": 3600,
      "price": 99.99,
      "rating": 4.5,
      "enrollmentCount": 150,
      "tags": ["AI", "Machine Learning"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Course by ID
```http
GET /courses/{courseId}
```

### Update Course
```http
PUT /courses/{courseId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced AI",
  "price": 149.99
}
```

### Delete Course
```http
DELETE /courses/{courseId}
Authorization: Bearer <token>
```

### Search Courses
```http
GET /courses/search?q=artificial+intelligence&category=Technology
```

## Enrollment Service

**Port**: 8082

### Enroll in Course
```http
POST /enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "uuid",
  "userId": "uuid"
}
```

**Response**:
```json
{
  "id": "uuid",
  "courseId": "uuid",
  "userId": "uuid",
  "status": "active",
  "progress": 0,
  "enrolledAt": "2024-01-01T00:00:00Z"
}
```

### Get User Enrollments
```http
GET /enrollments/user/{userId}
Authorization: Bearer <token>
```

**Response**:
```json
{
  "enrollments": [
    {
      "id": "uuid",
      "courseId": "uuid",
      "courseTitle": "Introduction to AI",
      "status": "active",
      "progress": 25,
      "enrolledAt": "2024-01-01T00:00:00Z",
      "lastAccessedAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Update Progress
```http
PUT /enrollments/{enrollmentId}/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "progress": 50,
  "lastModuleId": "uuid"
}
```

### Complete Course
```http
POST /enrollments/{enrollmentId}/complete
Authorization: Bearer <token>
```

### Get Course Enrollments (Instructor)
```http
GET /enrollments/course/{courseId}
Authorization: Bearer <token>
```

## AI Agent Service

**Port**: 8085

### Execute Task
```http
POST /ai/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "task": "Analyze student performance data",
  "context": {
    "userId": "uuid",
    "courseId": "uuid",
    "timeframe": "last_30_days"
  },
  "constraints": [
    "Ensure data privacy",
    "Provide actionable insights"
  ]
}
```

**Response**:
```json
{
  "taskId": "uuid",
  "status": "processing",
  "estimatedCompletion": "2024-01-01T00:05:00Z"
}
```

### Get Task Status
```http
GET /ai/tasks/{taskId}
Authorization: Bearer <token>
```

**Response**:
```json
{
  "taskId": "uuid",
  "status": "completed",
  "result": {
    "insights": [
      "Students perform better with interactive content",
      "Peak engagement is between 7-9 PM"
    ],
    "recommendations": [
      "Add more video content",
      "Schedule live sessions in evening"
    ]
  },
  "completedAt": "2024-01-01T00:03:45Z"
}
```

### Constitutional Check
```http
POST /ai/constitutional-check
Content-Type: application/json

{
  "action": "Generate personalized learning path",
  "context": "Student data analysis",
  "potentialImpact": "Privacy implications"
}
```

**Response**:
```json
{
  "approved": true,
  "reasoning": "Action aligns with privacy policies and educational goals",
  "constraints": [
    "Anonymize all personal data",
    "Limit data retention to 1 year"
  ]
}
```

### Get AI Capabilities
```http
GET /ai/capabilities
```

**Response**:
```json
{
  "capabilities": [
    "student_performance_analysis",
    "personalized_learning_paths",
    "content_recommendation",
    "engagement_prediction",
    "automated_grading_assistance"
  ],
  "models": [
    "gpt-4",
    "claude-3",
    "custom-fine-tuned-model"
  ]
}
```

## Analytics Service

**Port**: 8086

### Record Event
```http
POST /analytics/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventType": "course_view",
  "userId": "uuid",
  "courseId": "uuid",
  "metadata": {
    "source": "dashboard",
    "device": "mobile"
  }
}
```

### Get User Analytics
```http
GET /analytics/users/{userId}?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response**:
```json
{
  "userId": "uuid",
  "metrics": {
    "coursesEnrolled": 3,
    "coursesCompleted": 1,
    "totalStudyTime": 14400,
    "averageProgress": 65,
    "engagementScore": 8.2
  },
  "timeline": [
    {
      "date": "2024-01-01",
      "studyTime": 3600,
      "coursesAccessed": 2
    }
  ]
}
```

### Get Course Analytics
```http
GET /analytics/courses/{courseId}?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response**:
```json
{
  "courseId": "uuid",
  "metrics": {
    "totalEnrollments": 150,
    "completionRate": 0.75,
    "averageRating": 4.5,
    "totalRevenue": 14850,
    "popularModules": ["Introduction", "Advanced Topics"]
  },
  "trends": {
    "enrollments": [
      {"date": "2024-01-01", "count": 10},
      {"date": "2024-01-02", "count": 15}
    ]
  }
}
```

### Get Platform Analytics
```http
GET /analytics/platform?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response**:
```json
{
  "platform": {
    "totalUsers": 1000,
    "activeUsers": 750,
    "totalCourses": 50,
    "totalEnrollments": 2500,
    "totalRevenue": 150000
  },
  "growth": {
    "userGrowth": 0.15,
    "revenueGrowth": 0.22,
    "engagementGrowth": 0.08
  }
}
```

### Real-time Metrics
```http
GET /analytics/realtime?metrics=active_users,course_views,enrollments
```

**Response**:
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "metrics": {
    "activeUsers": 1250,
    "courseViews": 450,
    "enrollments": 12
  }
}
```

## Error Handling

### Common Error Responses

#### Authentication Error
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "code": 401
}
```

#### Validation Error
```json
{
  "error": "ValidationError",
  "message": "Invalid input data",
  "code": 400,
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

#### Not Found Error
```json
{
  "error": "NotFound",
  "message": "Resource not found",
  "code": 404
}
```

#### Internal Server Error
```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred",
  "code": 500,
  "requestId": "uuid"
}
```

#### Rate Limit Error
```json
{
  "error": "RateLimitExceeded",
  "message": "Too many requests",
  "code": 429,
  "retryAfter": 60
}
```

### Error Codes
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `409`: Conflict - Resource already exists
- `422`: Unprocessable Entity - Validation failed
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server error
- `503`: Service Unavailable - Service temporarily down

## Rate Limiting

### Limits by Endpoint Type
- **Authentication**: 10 requests/minute per IP
- **User operations**: 100 requests/minute per user
- **Course browsing**: 500 requests/minute per user
- **AI operations**: 50 requests/minute per user
- **Analytics**: 200 requests/minute per user

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60  # Only present when limit exceeded
```

### Rate Limit Response
```json
{
  "error": "RateLimitExceeded",
  "message": "API rate limit exceeded",
  "retryAfter": 60
}
```

## SDKs and Tools

### Postman Collection
Import the Azora ES API collection from `docs/postman_collection.json`

### OpenAPI Specification
View the complete OpenAPI 3.0 spec at `/docs/openapi.yaml`

### Client Libraries
- **JavaScript/TypeScript**: `npm install @azora/es-client`
- **Python**: `pip install azora-es-client`
- **Go**: `go get github.com/azora/es-client-go`

### Example Usage (JavaScript)
```javascript
import { AzoraES } from '@azora/es-client';

const client = new AzoraES({
  baseURL: 'https://api.azora.world',
  apiKey: 'your-api-key'
});

// Authenticate
const { token } = await client.auth.login('user@example.com', 'password');

// Get courses
const courses = await client.courses.list({ category: 'AI' });

// Enroll in course
await client.enrollments.create({
  courseId: 'course-uuid',
  userId: 'user-uuid'
});
```

---

For additional support or enterprise integrations, contact api-support@azora.world