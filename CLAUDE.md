# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` - Start development server (Vite) on localhost:5173
- `yarn build` - Build for production (TypeScript check + Vite build)
- `yarn test` - Run tests with Vitest and JSDOM environment
- `yarn test:e2e` - Run Playwright end-to-end tests
- `yarn test:e2e:ui` - Run Playwright tests with UI
- `yarn test:e2e:simple` - Run simplified E2E test suite (uses custom script)
- `yarn test:all` - Run both unit and E2E tests
- `yarn test:qa` - Complete QA test suite
- `yarn lint` - Run ESLint for code quality checks
- `yarn format` - Format code with Prettier
- `yarn preview` - Preview production build locally

## Architecture Overview

This is a modern React e-commerce application with the following key architectural decisions:

### Tech Stack
- **React 19** with TypeScript 5 and modern concurrent features
- **Vite** as build tool and dev server (migrated from Create React App)
- **Redux Toolkit** with RTK Query for state management and API calls
- **React Router DOM v7** for routing with lazy-loaded pages
- **Tailwind CSS** for styling with utility-first approach
- **Supabase** for backend services (authentication, database)
- **i18next** for internationalization (Hebrew/English with RTL support)
- **Vitest + JSDOM** for unit testing, **Playwright** for E2E testing
- **Radix UI** for accessible component primitives
- **React Hook Form + Zod** for form handling and validation

### State Management Structure
- Redux store configured in `src/app/store.ts` with RTK Query integration
- Features organized in slices: `features/products/productsSlice.ts`, `features/cart/cartSlice.ts`
- RTK Query APIs: `authApi`, `productsApi`, `cartApi`, `ordersApi` for server state
- Selectors in `store/selectors/` for computed state
- TypeScript types for RootState and AppDispatch properly configured
- **Supabase integration**: Authentication and database operations via `src/lib/supabase.ts`

### Key Architectural Patterns
- **Lazy loading**: All pages are lazy-loaded for performance
- **Error boundaries**: Global error handling with custom ErrorBoundary component
- **Performance monitoring**: Web vitals tracking with custom usePerformanceMonitor hook
- **Internationalization**: Full RTL/LTR support with dynamic direction switching
- **Component organization**: Separates UI components, layout components, and feature components

### File Structure Conventions
- `src/components/ui/` - Reusable UI components (LoadingSpinner, OptimizedImage, etc.)
- `src/components/layout/` - Layout components (Header, Footer, CategoriesMenu)
- `src/components/auth/` - Authentication components (SignInForm, SignUpForm)
- `src/components/cart/` - Shopping cart components
- `src/components/checkout/` - Checkout flow components
- `src/features/` - Feature-specific components and Redux slices
- `src/pages/` - Page components (lazy-loaded with React.lazy)
- `src/hooks/` - Custom hooks (useDebounce, useKeyboardNavigation, useDirection)
- `src/store/api/` - RTK Query API definitions
- `src/store/selectors/` - Redux selectors for computed state
- `src/lib/` - External service configurations (Supabase)
- `src/locales/` - Translation files (en.json, he.json)
- `src/types/` - TypeScript type definitions
- `src/contexts/` - React Context providers (AuthContext, ToastContext)
- `scripts/` - Build and deployment scripts

### Development Guidelines
- Uses functional React components exclusively
- ESLint configured with TypeScript rules and React best practices
- Prettier for code formatting
- All text content supports Hebrew/English with proper RTL handling
- Performance optimizations include lazy loading, debouncing, and optimized images
- Environment variables required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Testing Strategy
- **Unit tests**: Vitest with JSDOM for component and utility testing
- **E2E tests**: Playwright for full user journey testing
- **Custom E2E script**: `scripts/run-e2e-tests.js` for simplified testing without browser installation
- Test configuration in `vite.config.ts` with globals enabled
- Test setup in `src/setupTests.ts`

### Key Dependencies to Know
- **@reduxjs/toolkit**: Modern Redux with RTK Query for API state
- **@supabase/supabase-js**: Backend as a Service integration
- **react-router-dom v7**: Latest routing with enhanced features
- **@radix-ui/***: Headless UI components for accessibility
- **react-hook-form**: Performant forms with minimal re-renders
- **zod**: TypeScript-first schema validation
- **class-variance-authority & tailwind-variants**: Dynamic styling utilities