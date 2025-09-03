# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rapidev is a real-time delivery management system with separate interfaces for clients, couriers, and administrators. It's built with:
- **Frontend**: Vue 3 + Vite + Vue Router + Pinia
- **Backend**: AdonisJS v6 with PostgreSQL

## Common Development Commands

### Frontend (from `/frontend`)
```bash
npm install          # Install dependencies
npm run dev          # Run development server (port 5173)
npm run build        # Build for production
npm run lint         # Lint and fix code
npm run format       # Format code with Prettier
```

For production mode: `VITE_API_ENV=production npm run dev`

### Backend (from `/backend`)
```bash
npm install              # Install dependencies
npm run dev              # Run development server with HMR (port 3333)
npm run build            # Build for production
npm run test             # Run tests
npm run lint             # Lint code
npm run format           # Format code
npm run typecheck        # Type check without emitting

# Database migrations (from backend directory)
node ace migration:run      # Run migrations
node ace migration:rollback # Rollback migrations
node ace migration:refresh  # Refresh migrations
```

## Architecture

### Frontend Structure
- `/src/views/` - Main route components (ClientView, CourierView, AdminView, LoginView)
- `/src/components/` - Reusable Vue components
- `/src/stores/` - Pinia stores for state management (userStore)
- `/src/router/` - Vue Router configuration with authentication guards
- `/src/api/` - API client modules
- `/src/services/` - Business logic services
- `/src/utils/` - Utility functions
- `/src/constants/` - Application constants
- `@` alias points to `/src/`

### Backend Structure
- `/app/controllers/` - Request handlers
- `/app/models/` - Database models
- `/app/services/` - Business logic
- `/app/validators/` - Request validation
- `/app/middleware/` - HTTP middleware
- `/database/migrations/` - Database migrations
- `/start/routes.ts` - API route definitions
- `#` imports are configured for module imports (e.g., `#controllers/*`)

### API Routes Pattern
All API routes are prefixed with `/api/`:
- `/api/users/*` - User management
- `/api/profiles/*` - Profile management
- `/api/orders/*` - Order management
- `/api/receipts/*` - Receipt management
- `/api/payments/*` - Payment integration (Stripe)

### User Types
The system has three user types:
- `CLIENT` - Businesses creating delivery orders
- `COURIER` - Delivery personnel
- `ADMIN` - System administrators

### Order Status Flow
Orders progress through various statuses:
- DRAFT → PENDING → ACCEPTED → ASSIGNED_TO_COURIER → CONFIRMED_BY_COURIER → PICKED_UP → DELIVERED

## Environment Configuration

### Frontend (.env)
- `VITE_API_ENV` - Set to 'development' or 'production'
- `VITE_FRONTEND_PORT` - Frontend server port
- Also requires `secrets.js` (copy from `secrets.example.js`) with Google Maps API key

### Backend (.env)
- `NODE_ENV` - Set to 'development' or 'production'
- Database credentials (PostgreSQL)
- Stripe API keys for payment processing

## Database Setup

The application uses PostgreSQL. Key tables include:
- users - User accounts
- profiles - User profiles
- orders - Delivery orders
- order_items - Individual items in orders
- receipts - Payment receipts

## External Integrations

1. **Google Maps** - Address autocomplete, location mapping
   - Requires Maps JavaScript API, Places API, Geocoding API

2. **Stripe** - Payment processing
   - Checkout sessions for order payments

## Testing Approach

Check for test scripts in package.json. Backend uses Japa test runner (`npm run test`).

## Important Notes

- Authentication uses session-based auth with AdonisJS
- Frontend routing includes authentication guards
- The app uses real-time features for delivery tracking
- Multiple delivery items can be part of a single order
- Separate pricing for registered vs casual clients