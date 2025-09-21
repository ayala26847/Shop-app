-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================
-- Security policies for all tables to ensure proper data access control
-- Execute this script AFTER creating the database schema
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================
-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- USER ADDRESSES POLICIES
-- ============================================================================
-- Users can only access their own addresses
CREATE POLICY "Users can manage own addresses" ON public.user_addresses FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- CATEGORIES POLICIES
-- ============================================================================
-- Categories are publicly readable
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);

-- ============================================================================
-- PRODUCTS POLICIES
-- ============================================================================
-- Products are publicly readable when active
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);

-- ============================================================================
-- PRODUCT CATEGORIES POLICIES
-- ============================================================================
-- Product-category relationships are publicly readable
CREATE POLICY "Anyone can view product categories" ON public.product_categories FOR SELECT USING (true);

-- ============================================================================
-- PRODUCT VARIANTS POLICIES
-- ============================================================================
-- Product variants are publicly readable when active
CREATE POLICY "Anyone can view active variants" ON public.product_variants FOR SELECT USING (is_active = true);

-- ============================================================================
-- CART ITEMS POLICIES
-- ============================================================================
-- Users can manage their own cart items, guests can manage session-based carts
CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (
  auth.uid() = user_id OR
  (auth.uid() IS NULL AND session_id IS NOT NULL)
);

-- ============================================================================
-- WISHLIST ITEMS POLICIES
-- ============================================================================
-- Users can only access their own wishlist
CREATE POLICY "Users can manage own wishlist" ON public.wishlist_items FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- ORDERS POLICIES
-- ============================================================================
-- Users can view and create their own orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- ORDER ITEMS POLICIES
-- ============================================================================
-- Users can view items from their own orders
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid() OR user_id IS NULL)
);

-- ============================================================================
-- PRODUCT REVIEWS POLICIES
-- ============================================================================
-- Everyone can read approved reviews, users can manage their own reviews
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage own reviews" ON public.product_reviews FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- DISCOUNT CODES POLICIES
-- ============================================================================
-- Public can view active discount codes (for validation)
CREATE POLICY "Anyone can view active discount codes" ON public.discount_codes FOR SELECT USING (
  is_active = true AND
  starts_at <= NOW() AND
  (ends_at IS NULL OR ends_at >= NOW())
);

-- ============================================================================
-- ADMIN USERS POLICIES
-- ============================================================================
-- Only active admins can access admin_users table
CREATE POLICY "Only admins can access admin_users" ON public.admin_users FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true)
);

-- ============================================================================
-- SYSTEM SETTINGS POLICIES
-- ============================================================================
-- Public can read non-sensitive settings
CREATE POLICY "Anyone can view public settings" ON public.system_settings FOR SELECT USING (
  key NOT LIKE 'secret_%' AND
  key NOT LIKE 'private_%' AND
  key NOT LIKE 'admin_%'
);
-- Admins can manage all settings
CREATE POLICY "Admins can manage settings" ON public.system_settings FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true)
);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Row Level Security policies created successfully! ✅';
    RAISE NOTICE 'All tables are now secured with appropriate access controls.';
END $$;