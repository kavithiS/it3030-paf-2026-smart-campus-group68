
# UniReserveHub - Smart Campus Management System

UniReserveHub is a comprehensive, full-stack university resource and reservation management system designed to streamline campus operations. It features a robust Spring Boot backend and a modern, high-performance React frontend.

## Core Features

- **Advanced Authentication**: Secure login and registration system with JWT and OAuth2 integration (Google & GitHub).
- **Role-Based Access Control (RBAC)**: Specialized permissions and dashboards for Admins, Technicians, and Students.
- **Resource Management**: Real-time tracking and management of university resources (halls, equipment, etc.).
- **Reservation System**: Seamless booking process with availability tracking and status management.
- **Issue Tracking**: Integrated ticket-based system for reporting and tracking maintenance issues.
- **Real-time Notifications**: Persistent notification system to keep users updated on booking status and ticket assignments.

## Technical Stack

### Backend

- **Java 17** & **Spring Boot 3.2.4**
- **Spring Security** with JWT & OAuth2
- **MongoDB** for scalable data storage
- **Maven** for dependency management

### Frontend

- **React 18** & **Vite**
- **Tailwind CSS** for premium styling
- **Framer Motion** for smooth animations
- **Lucide React** for modern iconography

## Getting Started

### Prerequisites

- JDK 17
- Node.js 18+
- MongoDB instance (Atlas or local)

### Backend Setup

1. Navigate to the `backend` directory.
2. Update `src/main/resources/application.properties` with your MongoDB URI and OAuth2 credentials.
3. Run `./mvnw spring-boot:run`.

### Frontend Setup

1. Navigate to the `frontend` directory.
2. Run `npm install`.
3. Run `npm run dev`.

---

Developed as part of the PAF Project - Smart Campus Group 68.
