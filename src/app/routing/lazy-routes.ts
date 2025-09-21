// Lazy-loaded routes for code splitting

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load pages
const HomePage = lazy(() => import('../../pages/HomePage'));
const AboutPage = lazy(() => import('../../pages/AboutPage'));
const ProductsPage = lazy(() => import('../../pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('../../pages/ProductDetailPage'));
const CategoryPage = lazy(() => import('../../pages/CategoryPage'));
const CartPage = lazy(() => import('../../pages/CartPage'));
const CheckoutPage = lazy(() => import('../../pages/CheckoutPage'));
const SignInPage = lazy(() => import('../../pages/auth/SignInPage'));
const SignUpPage = lazy(() => import('../../pages/auth/SignUpPage'));
const ProfilePage = lazy(() => import('../../pages/ProfilePage'));
const OrdersPage = lazy(() => import('../../pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('../../pages/OrderDetailPage'));
const WishlistPage = lazy(() => import('../../pages/WishlistPage'));
const SearchPage = lazy(() => import('../../pages/SearchPage'));
const NotFoundPage = lazy(() => import('../../pages/NotFoundPage'));

// Lazy load features
const ProductManagement = lazy(() => import('../../features/products/ProductManagement'));
const OrderManagement = lazy(() => import('../../features/orders/OrderManagement'));
const UserManagement = lazy(() => import('../../features/users/UserManagement'));
const AnalyticsDashboard = lazy(() => import('../../features/analytics/AnalyticsDashboard'));

// Lazy load widgets
const ProductCarousel = lazy(() => import('../../widgets/ProductCarousel'));
const CategoryGrid = lazy(() => import('../../widgets/CategoryGrid'));
const FeaturedProducts = lazy(() => import('../../widgets/FeaturedProducts'));
const RecentOrders = lazy(() => import('../../widgets/RecentOrders'));

// Route configurations with preloading strategies
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
    // Preload critical resources
    loader: () => {
      // Preload critical CSS and JS
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = '/critical.css';
      link.as = 'style';
      document.head.appendChild(link);
      
      return null;
    },
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/products',
    element: <ProductsPage />,
    // Preload related components
    loader: () => {
      // Preload product-related components
      import('../../widgets/ProductCarousel');
      import('../../widgets/CategoryGrid');
      return null;
    },
  },
  {
    path: '/products/:id',
    element: <ProductDetailPage />,
    // Preload product detail components
    loader: () => {
      import('../../widgets/FeaturedProducts');
      return null;
    },
  },
  {
    path: '/categories/:slug',
    element: <CategoryPage />,
  },
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
    // Preload checkout components
    loader: () => {
      import('../../features/checkout/CheckoutFlow');
      return null;
    },
  },
  {
    path: '/auth/signin',
    element: <SignInPage />,
  },
  {
    path: '/auth/signup',
    element: <SignUpPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    // Preload user-related components
    loader: () => {
      import('../../widgets/RecentOrders');
      return null;
    },
  },
  {
    path: '/orders',
    element: <OrdersPage />,
  },
  {
    path: '/orders/:id',
    element: <OrderDetailPage />,
  },
  {
    path: '/wishlist',
    element: <WishlistPage />,
  },
  {
    path: '/search',
    element: <SearchPage />,
  },
  {
    path: '/admin/products',
    element: <ProductManagement />,
  },
  {
    path: '/admin/orders',
    element: <OrderManagement />,
  },
  {
    path: '/admin/users',
    element: <UserManagement />,
  },
  {
    path: '/admin/analytics',
    element: <AnalyticsDashboard />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// Route groups for different user types
export const publicRoutes = routes.filter(route => 
  !route.path?.startsWith('/admin') && 
  !route.path?.startsWith('/profile') &&
  !route.path?.startsWith('/orders')
);

export const authenticatedRoutes = routes.filter(route => 
  route.path?.startsWith('/profile') ||
  route.path?.startsWith('/orders') ||
  route.path?.startsWith('/wishlist')
);

export const adminRoutes = routes.filter(route => 
  route.path?.startsWith('/admin')
);

// Preloading strategies
export const preloadStrategy = {
  // Preload on hover
  onHover: (routePath: string) => {
    const route = routes.find(r => r.path === routePath);
    if (route?.loader) {
      route.loader();
    }
  },
  
  // Preload on visibility
  onVisible: (routePath: string) => {
    const route = routes.find(r => r.path === routePath);
    if (route?.loader) {
      route.loader();
    }
  },
  
  // Preload critical routes
  critical: () => {
    // Preload critical routes immediately
    import('../../pages/HomePage');
    import('../../pages/ProductsPage');
    import('../../pages/CartPage');
  },
  
  // Preload on idle
  onIdle: () => {
    // Preload non-critical routes when browser is idle
    import('../../pages/AboutPage');
    import('../../pages/SearchPage');
    import('../../pages/WishlistPage');
  },
};

// Bundle analysis
export const bundleInfo = {
  // Critical bundles (loaded immediately)
  critical: [
    'HomePage',
    'ProductsPage',
    'CartPage',
  ],
  
  // Secondary bundles (loaded on demand)
  secondary: [
    'ProductDetailPage',
    'CategoryPage',
    'CheckoutPage',
  ],
  
  // Admin bundles (loaded for admin users)
  admin: [
    'ProductManagement',
    'OrderManagement',
    'UserManagement',
    'AnalyticsDashboard',
  ],
  
  // Widget bundles (loaded when needed)
  widgets: [
    'ProductCarousel',
    'CategoryGrid',
    'FeaturedProducts',
    'RecentOrders',
  ],
};
