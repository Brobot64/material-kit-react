# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
- **Start dev server**: `yarn dev` (runs on http://localhost:3039)
- **Build for production**: `yarn build` 
- **Preview production build**: `yarn start`
- **Clean install and dev**: `yarn re:dev`
- **Clean install and build**: `yarn re:build`

### Code Quality
- **Lint code**: `yarn lint`
- **Fix linting issues**: `yarn lint:fix`
- **Check formatting**: `yarn fm:check`
- **Fix formatting**: `yarn fm:fix`
- **Fix all issues**: `yarn fix:all` (combines lint:fix and fm:fix)

### TypeScript
- **Type check**: `yarn tsc:watch`
- **Dev with type checking**: `yarn tsc:dev`
- **Show TypeScript config**: `yarn tsc:print`

## Architecture

### Project Structure
This is a React TypeScript admin dashboard built with Vite, Material-UI, and React Router v7. The architecture follows a feature-based organization:

```
src/
├── pages/           # Page components (thin wrappers with metadata)
├── sections/        # Feature-specific components organized by domain
│   ├── overview/    # Dashboard analytics components
│   ├── user/        # User management components  
│   ├── product/     # Product management components
│   ├── blog/        # Blog components
│   ├── auth/        # Authentication components
│   └── error/       # Error page components
├── layouts/         # Layout components
│   ├── dashboard/   # Main dashboard layout with nav/header
│   ├── auth/        # Authentication layout
│   └── core/        # Reusable layout primitives
├── components/      # Shared/reusable UI components
├── routes/          # Routing configuration and components
├── theme/           # Material-UI theme customization
├── utils/           # Utility functions
└── _mock/           # Mock data for development
```

### Key Architectural Patterns

#### Page-Section Pattern
Pages are thin wrappers that handle metadata (title, description, keywords) and delegate to section components:
```typescript
// pages/dashboard.tsx renders sections/overview/view/OverviewAnalyticsView
```

#### Layout System
- `DashboardLayout`: Main app layout with sidebar navigation and header
- `AuthLayout`: Simplified layout for authentication pages  
- Layout components use a slot-based system for flexibility
- Responsive design with `layoutQuery` breakpoint (default: 'lg')

#### Routing Architecture
- Uses React Router v7 with `createBrowserRouter`
- Routes defined in `src/routes/sections.tsx` with lazy loading
- Error boundaries integrated at router level
- Path aliases configured: `src/` maps to absolute imports

#### Theme System
- Custom Material-UI theme with CSS variables support
- Theme provider wraps entire app with `CssBaseline`
- Extensible theme configuration in `src/theme/`

### Import Organization
ESLint enforces strict import ordering:
1. Style imports
2. Side-effect imports  
3. Type imports
4. External libraries
5. Material-UI imports
6. Internal routes, hooks, utils
7. Components and sections
8. Relative imports

### Development Patterns
- TypeScript strict mode enabled
- Vite for fast development with HMR
- SWC for fast React compilation
- Path alias `src/` for clean imports
- Consistent barrel exports via `index.ts` files

## Package Manager
Uses Yarn v1.22.22 as specified in package.json `packageManager` field.

## Build System
- **Vite 6**: Modern build tool with native ES modules
- **React 19**: Latest React with concurrent features
- **TypeScript**: Strict type checking enabled
- **Port**: Development server runs on 3039

## Code Style
- **ESLint**: Comprehensive rules with TypeScript, React, and import sorting
- **Prettier**: Consistent formatting (100 char width, single quotes, trailing commas)
- **Import sorting**: Enforced by perfectionist plugin with custom groups
- **Unused imports**: Automatically flagged and removable