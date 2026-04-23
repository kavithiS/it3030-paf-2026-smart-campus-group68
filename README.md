Module A: Facilities & Assets Catalogue

This module serves as the central hub for managing and monitoring all bookable resources within the Smart Campus Operations Hub.

Features -

Centralized Catalogue: Searchable list of lecture halls, labs, meeting rooms, and equipment.
Metadata Management: Real-time tracking of resource capacity, location, and categorization.
Availability Monitoring: Instant visibility into resource status (e.g., ACTIVE, OUT_OF_SERVICE).
Advanced Filtering: Service-layer logic to filter resources by type, status, and physical capacity.

Technical Implementation -

Backend (Spring Boot & MongoDB)
Model: Resource.java - Managed as a MongoDB document for flexible metadata storage.
Service Layer: ResourceService.java - Contains the business logic for availability windows and status transitions.
REST API: ResourceController.java - Secured endpoints for managing the catalogue.
Frontend (React & Tailwind CSS)
Dashboard: ResourcesPage.jsx - A responsive interface with state-managed filtering and CRUD capabilities.
API Integration: Integrated with the central api.js service for standardized data fetching.

Key Files -

Backend: model/Resource.java, service/ResourceService.java, controller/ResourceController.java
Frontend: pages/ResourcesPage.jsx, utils/dashboardConfig.js

How to Run -

Backend: mvn spring-boot:run
Frontend: npm run dev
