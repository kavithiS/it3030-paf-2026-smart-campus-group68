# Smart Campus Operations Hub

A comprehensive platform designed for modern campus management, featuring robust authentication, role-based access control, and a dynamic notification system.

## 🚀 Overview

Smart Campus Operations Hub is a full-stack web application that streamlines campus activities by providing tailored experiences for different user roles. Whether you are an administrator managing the system, a technician handling service requests, or a student/staff member accessing campus services, the platform ensures secure and efficient operations.

## ✨ Key Features

- **Advanced Authentication**: Secure login and registration system using JWT (JSON Web Tokens).
- **OAuth2 Integration**: One-tap sign-in with Google for a seamless user experience.
- **Role-Based Access Control (RBAC)**: Specialized dashboards and permissions for:
    - **Admin**: Full system oversight and management.
    - **Technician**: Management of service requests and technical tasks.
    - **User**: Access to personal services and status updates.
- **Notification System**: Integrated alert system to keep users informed about service updates and approvals.
- **Modern UI/UX**: Fully responsive, high-performance interface with dark mode support.

## 📦 Modules

### Module A: Facilities & Assets Catalogue
This module serves as the central hub for managing and monitoring all bookable resources within the Smart Campus Operations Hub.
- **Centralized Catalogue**: Searchable list of lecture halls, labs, meeting rooms, and equipment.
- **Metadata Management**: Real-time tracking of resource capacity, location, and categorization.
- **Availability Monitoring**: Instant visibility into resource status (e.g., ACTIVE, OUT_OF_SERVICE).
- **Advanced Filtering**: Service-layer logic to filter resources by type, status, and physical capacity.

### Module D: Notifications, Role Management & Auth
The current module focused on securing the platform and enhancing user communication.
- **Security**: JWT-based authentication and Google OAuth2 integration.
- **Dashboard Logic**: Role-specific navigation and layouts.
- **Communication**: Centralized notification system for status alerts.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (with Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **State Management**: React Context API
- **HTTP Client**: Axios

### Backend
- **Framework**: [Spring Boot 3.2.4](https://spring.io/projects/spring-boot)
- **Security**: [Spring Security](https://spring.io/projects/spring-security) with OAuth2 Client
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Token Handling**: JJWT (Java JWT)
- **Build Tool**: Maven

## ⚙️ Setup & Installation

### Prerequisites
- JDK 17 or higher
- Node.js 18 or higher
- MongoDB Atlas account or local MongoDB instance

### Backend Setup
1. Navigate to the `backend` directory.
2. Update `src/main/resources/application.properties` with your credentials:
   - `spring.data.mongodb.uri`: Your MongoDB connection string.
   - `spring.security.oauth2.client.registration.google.client-id`: Your Google Client ID.
   - `spring.security.oauth2.client.registration.google.client-secret`: Your Google Client Secret.
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

## 📁 Project Structure

```text
├── backend                 # Spring Boot application
│   ├── src/main/java       # Java source files
│   └── src/main/resources  # Configuration & static assets
├── frontend                # Vite + React application
│   ├── src/components      # Reusable UI components
│   ├── src/pages           # Page components
│   └── src/context         # State management
└── README.md               # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
Developed as part of the PAF (Practical Application of Frameworks) Project.
