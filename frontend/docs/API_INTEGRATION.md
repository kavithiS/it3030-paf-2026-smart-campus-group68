# API Integration Guide

## Base URL
The frontend API client uses:
- VITE_API_BASE_URL (if set)
- fallback: http://localhost:8080/api

Example .env.local:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Axios Client
A shared Axios instance is configured in src/services/api.js.

## Authentication Header
For protected endpoints, the client automatically adds:
- Authorization: Bearer <token>

Token source:
- localStorage key: token

## Public Endpoints Without Authorization Header
The interceptor excludes Authorization for these paths:
- /auth/login
- /auth/register
- /auth/forgot-password
- /auth/reset-password
- /auth/test

## Common Backend Route Groups
- /auth
- /users
- /admin
- /technician
- /resources
- /bookings
- /tickets
- /notifications

## Debug Tips
- Verify token exists in localStorage after login.
- Verify VITE_API_BASE_URL points to running backend.
- Check browser network tab for 401/403 responses.
