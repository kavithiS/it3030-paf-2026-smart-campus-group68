# Routes and Access Control

## Public Routes
- /
- /login
- /register
- /oauth-success
- /oauth2/redirect

## Protected Routes by Role
### USER only
- /user-dashboard
- /dashboard (redirects to /user-dashboard)

### USER, ADMIN, TECHNICIAN
- /resources
- /tickets
- /notifications

### USER and ADMIN
- /bookings

### ADMIN only
- /admin-dashboard

### TECHNICIAN only
- /technician-dashboard

## Unauthorized Handling
When a logged-in user tries to access a route outside their allowed roles, they are redirected by ProtectedRoute.

## Role Normalization
Roles are normalized in AuthContext to support values such as:
- ROLE_ADMIN
- admin
- mixed or array-based role payloads

Normalized values used by the app:
- ADMIN
- TECHNICIAN
- USER
