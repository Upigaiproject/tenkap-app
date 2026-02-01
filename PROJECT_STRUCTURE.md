# Tenkap Project Structure

This file provides an overview of the directory structure and key files for the Tenkap MVP.

## Root Directory: `/tenkap-app`

### `/backend` (Node.js + Express)
Core API service handling authentication, location tracking, and data persistence.
- **`server.js`**: Main entry point. Configures Express, middleware, DB setup, and starts server.
- **`package.json`**: Dependencies (`express`, `pg`, `redis`, etc.) and scripts.
- **`schema.sql`**: Database definitions for Users, Locations, Matches, Nudges.
- **`.env`**: Configuration (Database URL, Redis URL, API Keys).
- **`/routes`**:
  - `location.js`: Handles location updates, pattern detection, and proximity notifications.
  - `auth.js` (Planned): User authentication (Phone/SMS).
  - `matches.js` (Planned/Integrated): Match retrieval logic.

### `/frontend` (React + Vite + Tailwind) *(To be initialized)*
Web-based user interface (PWA).
- **`vite.config.ts`**: Build configuration.
- **`tailwind.config.js`**: Design system (colors, typography).
- **`/src`**:
  - **`/components`**: Reusable UI components (ActivityMap, NudgeCard).
  - **`/pages`**: Route pages (Onboarding, Home, Profile).
  - **`/services`**: API clients (LocationTracker).

### `/ai` (Python + FastAPI)
Microservice for intelligent features.
- **`nudge_generator.py`**: Logic for generating context-aware nudges.
- **`matcher.py`**: Compatibility scoring algorithm.
- **`requirements.txt`**: Python dependencies.

### `/docs`
Project documentation and guides.

---
**Status**: Backend and AI skeletons created. Database schema defined. Frontend pending initialization.
