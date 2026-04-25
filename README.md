# UniReserveHub

UniReserveHub is a full-stack Smart Campus Management System built for university operations. It combines resource management, booking workflows, incident ticketing, notifications, role-based dashboards, and OAuth-enabled authentication in one platform.

## Project Scope

This repository contains:

- Spring Boot backend API with JWT and OAuth2 authentication
- React + Vite frontend with role-aware navigation and dashboards
- MongoDB data persistence

Primary business modules:

- Facilities and resources management
- Bookings and approval workflow
- Incident tickets with assignment, status updates, and comments
- Notification center
- Role management for ADMIN, TECHNICIAN, and USER roles

## Tech Stack

### Backend

- Java 17
- Spring Boot 3.2.4
- Spring Security (JWT + OAuth2)
- Spring Data MongoDB
- Maven

### Frontend

- React 18
- Vite 5
- React Router 6
- Axios
- Tailwind CSS
- Lucide React

### Database

- MongoDB (Atlas or local)

## Repository Structure

```text
.
|- backend/
|  |- src/main/java/com/sliit/paf/
|  |  |- controller/
|  |  |- service/
|  |  |- repository/
|  |  |- model/
|  |  |- dto/
|  |  |- security/
|  |  \- config/
|  \- src/main/resources/application.properties
\- frontend/
	|- src/
	|  |- components/
	|  |- pages/
	|  |- routes/
	|  |- context/
	|  |- services/
	|  \- utils/
	\- package.json
```

## Quick Start

### 1) Prerequisites

- JDK 17
- Maven 3.9+
- Node.js 18+
- npm 9+
- MongoDB connection URI

### 2) Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend default URL: `http://localhost:8080`

### 3) Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Configuration

### Backend properties

Edit `backend/src/main/resources/application.properties` and configure:

- `server.port` (default 8080)
- `spring.data.mongodb.uri`
- `smartcampus.app.jwtSecret`
- `smartcampus.app.jwtExpirationMs`
- `spring.security.oauth2.client.registration.google.client-id`
- `spring.security.oauth2.client.registration.google.client-secret`
- `app.oauth2.redirectUri`

### Frontend environment

Create `frontend/.env` (or `.env.local`) and set:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

If unset, frontend defaults to `http://localhost:8080/api`.

## Authentication and Authorization

- Local auth endpoints under `/api/auth/*` (login, register, forgot/reset password)
- Google OAuth2 login flow supported via Spring Security OAuth2 client
- JWT bearer token expected on protected API routes
- Role-based guards in backend and frontend navigation

Roles used across the app:

- ADMIN
- TECHNICIAN
- USER

## API Overview

Main route groups exposed by backend controllers:

- `/api/auth` - authentication, registration, password recovery
- `/api/users` - current user profile and user management actions
- `/api/admin` - admin dashboard and management data
- `/api/technician` - technician-specific workbench endpoints
- `/api/resources` - CRUD for campus resources
- `/api/bookings` - booking creation and approval lifecycle
- `/api/tickets` - incident ticketing, assignment, status, comments
- `/api/notifications` - notifications list and read-state operations

## Build Commands

### Backend

```bash
cd backend
mvn clean package
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Security Notes

- Do not commit real production secrets in `application.properties`.
- Move sensitive credentials to environment variables or secret management.
- Restrict allowed CORS origins for production deployments.

## Team

Developed for IT3030 PAF Smart Campus Project (Group 68).