# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ABKImports Frontend is a React TypeScript application for import/export management built with Vite. The application provides functionality for cargo inspection, merchandise tracking, quotation management, and logistics tools for import businesses.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
vite build

# Type checking
npm run type-check

# Linting
npm run lint

# Preview production build
npm run preview
```

## Architecture & Key Structure

### Tech Stack
- **React 19** with TypeScript and Vite
- **TailwindCSS 4** with Radix UI components
- **React Router 7** for routing
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Leaflet** for mapping functionality
- **Socket.io** for real-time features

### Directory Structure
- `src/api/` - API layer with centralized fetch utility (`apiFetch.ts`)
- `src/components/` - Reusable UI components including shadcn/ui components
- `src/pages/` - Page components organized by feature areas
- `src/layouts/` - Layout components (basic-layout, dashboard-layout)
- `src/hooks/` - Custom React hooks
- `src/context/` - React contexts for auth and theme
- `src/lib/` - Utility functions and configurations

### Key Features & Pages
- **Inspection Management** (`src/pages/inspeccion/`) - Cargo inspection workflows
- **Merchandise Management** (`src/pages/gestion-de-mercancia/`) - Product and inventory management
- **Tracking System** (`src/pages/Tracking.tsx`, `src/pages/gestion-de-tracking.tsx`) - Shipment tracking with maps
- **Quotation System** (`src/pages/mis-cotizaciones/`, `src/pages/gestion-de-cotizacion/`) - Quote management
- **Tax Calculator** (`src/pages/calculator.tsx`) - Import tax calculations
- **Educational Resources** (`src/pages/Educacion.tsx`) - Learning materials

### Authentication & Role-Based Access
The application uses JWT tokens stored in localStorage with role-based navigation permissions defined in `src/components/app-sidebar.tsx`. Roles include: `admin`, `temporal`, `guest`, `final`.

### API Integration
- Centralized API client in `src/api/apiFetch.ts`
- Base API URL configured via `VITE_API_URL` environment variable
- Automatic Bearer token authentication
- Specialized API modules for different features (inspection, shipments, login, etc.)

### State Management
- TanStack Query for server state and caching
- Custom hooks for data fetching (`use-inspections.ts`, `use-shipments.ts`)
- React Context for authentication and theme management

### UI Components
Uses shadcn/ui component library with custom modifications. Key reusable components include:
- Data tables with pagination, filtering, and sorting
- Modal dialogs for forms and confirmations
- File upload components
- Map components using React-Leaflet

## Configuration Files
- Path aliases configured with `@/*` pointing to `./src/*`
- TypeScript strict mode enabled with custom compiler options
- ESLint configured for React and TypeScript
- Tailwind CSS 4 with custom configuration