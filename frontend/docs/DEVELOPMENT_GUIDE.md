# Frontend Development Guide

## Local Setup
1. Install dependencies.
2. Configure environment variables.
3. Start Vite dev server.

```bash
npm install
npm run dev
```

## Scripts
- npm run dev: start development server
- npm run build: production build
- npm run preview: preview production build
- npm run lint: lint source files

## Coding Conventions
- Keep route-level logic in src/pages.
- Keep reusable UI in src/components.
- Keep API configuration inside src/services.
- Keep auth and role logic centralized in src/context/AuthContext.jsx.

## Adding a New Protected Page
1. Create page component in src/pages.
2. Add route in src/App.jsx.
3. Wrap route with ProtectedRoute and allowedRoles.
4. Add navigation links where needed.

## Common Issues
- Blank page after login: verify token and user role mapping.
- Redirect loops: verify allowedRoles in ProtectedRoute.
- API failures: verify backend URL and CORS settings.
