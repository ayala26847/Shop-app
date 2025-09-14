# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` - Start development server (Vite) on localhost:5173
- `yarn build` - Build for production (TypeScript check + Vite build)
- `yarn test` - Run tests with Vitest and JSDOM environment
- `yarn lint` - Run ESLint for code quality checks
- `yarn format` - Format code with Prettier
- `yarn preview` - Preview production build locally

## Architecture Overview

This is a modern React e-commerce application with the following key architectural decisions:

### Tech Stack
- **React 19** with TypeScript 5 and modern concurrent features
- **Vite** as build tool and dev server (migrated from Create React App)
- **Redux Toolkit** for state management with slices for products and cart
- **React Router DOM v7** for routing with lazy-loaded pages
- **Tailwind CSS** for styling with utility-first approach
- **i18next** for internationalization (Hebrew/English with RTL support)
- **Vitest + JSDOM** for testing instead of Jest

### State Management Structure
- Redux store configured in `src/app/store.ts`
- Features organized in slices: `features/products/productsSlice.ts`, `features/cart/cartSlice.ts`
- Selectors in `store/selectors/` for computed state
- TypeScript types for RootState and AppDispatch properly configured

### Key Architectural Patterns
- **Lazy loading**: All pages are lazy-loaded for performance
- **Error boundaries**: Global error handling with custom ErrorBoundary component
- **Performance monitoring**: Web vitals tracking with custom usePerformanceMonitor hook
- **Internationalization**: Full RTL/LTR support with dynamic direction switching
- **Component organization**: Separates UI components, layout components, and feature components

### File Structure Conventions
- `src/components/ui/` - Reusable UI components (LoadingSpinner, OptimizedImage, etc.)
- `src/components/layout/` - Layout components (Header, Footer, CategoriesMenu)
- `src/features/` - Feature-specific components and Redux slices
- `src/pages/` - Page components (lazy-loaded)
- `src/hooks/` - Custom hooks (useDebounce, useKeyboardNavigation, useDirection)
- `src/locales/` - Translation files (en.json, he.json)
- `src/types/` - TypeScript type definitions

### Development Guidelines
- Uses functional React components exclusively
- ESLint configured with TypeScript rules and React best practices
- Prettier for code formatting
- All text content supports Hebrew/English with proper RTL handling
- Performance optimizations include lazy loading, debouncing, and optimized images