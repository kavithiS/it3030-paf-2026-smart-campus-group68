# Frontend Overview

## Purpose
The frontend is a React + Vite application for UniReserveHub. It provides role-based dashboards and feature pages for resources, bookings, tickets, and notifications.

## Tech Stack
- React 18
- Vite 5
- React Router DOM 6
- Axios
- Tailwind CSS
- Lucide React

## Main Folder Structure
- src/components: reusable UI building blocks
- src/pages: route-level pages
- src/routes: route guards (protected access)
- src/context: auth and theme contexts
- src/services: API client setup
- src/utils: utility and config helpers

## App Entry Flow
1. App starts with routes from src/App.jsx.
2. Auth context restores token from localStorage.
3. Current user is fetched from /users/me when possible.
4. Role-based routing sends users to admin, technician, or user dashboard.

## Run Commands
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
npm run preview
```

## Documentation Maintenance
- Update this file when adding or removing major frontend modules.
- Keep route and access details aligned with App and ProtectedRoute changes.
- Reflect API client behavior changes in API_INTEGRATION.md.
