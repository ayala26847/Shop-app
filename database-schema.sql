-- ============================================================================
-- E-COMMERCE DATABASE SCHEMA FOR SUPABASE
-- ============================================================================
-- This schema creates all necessary tables for a full-featured e-commerce application
-- with multi-language support (Hebrew/English) and RTL compatibility
--
-- Execute this script in your Supabase SQL Editor to create all tables
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
-- Extends Supabase Auth users with additional profile information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    date_of_birth TEXT, -- Changed to TEXT to match TypeScript types
    avatar_url TEXT,
    marketing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER ADDRESSES TABLE
-- ============================================================================
-- Stores billing and shipping addresses for users
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('billing', 'shipping')),
    is_default BOOLEAN DEFAULT false,
    full_name TEXT NOT NULL,
    company TEXT,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state_province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'Israel',
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
-- Product categories with hierarchical structure and i18n support
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Changed to UUID to match TypeScript
    name_key TEXT NOT NULL UNIQUE, -- i18n key for category names
    description TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= price),
  cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
  weight DECIMAL(8,2) DEFAULT 0,
  dimensions JSONB, -- {length, width, height, unit}
  requires_shipping BOOLEAN DEFAULT true,
  is_digital BOOLEAN DEFAULT false,
  track_inventory BOOLEAN DEFAULT true,
  inventory_quantity INTEGER DEFAULT 0 CHECK (inventory_quantity >= 0),
  inventory_policy TEXT CHECK (inventory_policy IN ('deny', 'continue')) DEFAULT 'deny',
  tags TEXT[],
  images TEXT[], -- Array of image URLs
  seo_title TEXT,
  seo_description TEXT,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product-Category associations
CREATE TABLE public.product_categories (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Product variants (size, color, etc.)
CREATE TABLE public.product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  sku TEXT UNIQUE,
  price DECIMAL(10,2) CHECK (price >= 0),
  compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= price),
  cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
  inventory_quantity INTEGER DEFAULT 0 CHECK (inventory_quantity >= 0),
  weight DECIMAL(8,2) DEFAULT 0,
  option1 TEXT, -- e.g., Color: Red
  option2 TEXT, -- e.g., Size: Large
  option3 TEXT, -- e.g., Material: Cotton
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. SHOPPING CART & WISHLIST
-- =============================================

-- Shopping cart items
CREATE TABLE public.cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure either user_id or session_id is provided
  CONSTRAINT cart_items_user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  ),

  -- Unique constraint for user/session + product + variant
  UNIQUE(user_id, session_id, product_id, variant_id)
);

-- Wishlist items
CREATE TABLE public.wishlist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, product_id)
);

-- =============================================
-- 4. ORDERS & TRANSACTIONS
-- =============================================

-- Orders
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Order status
  status TEXT CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending',
  fulfillment_status TEXT CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled')) DEFAULT 'unfulfilled',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'voided')) DEFAULT 'pending',

  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  shipping_amount DECIMAL(10,2) DEFAULT 0 CHECK (shipping_amount >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),

  -- Addresses
  billing_address JSONB NOT NULL,
  shipping_address JSONB NOT NULL,

  -- Shipping
  shipping_method TEXT,
  tracking_number TEXT,
  tracking_url TEXT,

  -- Notes
  notes TEXT,

  -- Timestamps
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,

  -- Product snapshot at time of order
  product_name TEXT NOT NULL,
  variant_title TEXT,
  sku TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. REVIEWS & RATINGS
-- =============================================

-- Product reviews
CREATE TABLE public.product_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[], -- Array of review image URLs

  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(product_id, user_id) -- One review per user per product
);

-- =============================================
-- 6. DISCOUNTS & PROMOTIONS
-- =============================================

-- Discount codes
CREATE TABLE public.discount_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('percentage', 'fixed_amount', 'free_shipping')) NOT NULL,
  value DECIMAL(10,2) NOT NULL CHECK (value >= 0),

  minimum_amount DECIMAL(10,2) DEFAULT 0 CHECK (minimum_amount >= 0),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),

  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. ADMIN & SYSTEM
-- =============================================

-- Admin users
CREATE TABLE public.admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'moderator')) DEFAULT 'admin',
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON public.user_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON public.discount_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

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

-- User Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User Addresses: Users can only access their own addresses
CREATE POLICY "Users can manage own addresses" ON public.user_addresses FOR ALL USING (auth.uid() = user_id);

-- Categories: Public read access
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);

-- Products: Public read access for active products
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);

-- Product Categories: Public read access
CREATE POLICY "Anyone can view product categories" ON public.product_categories FOR SELECT USING (true);

-- Product Variants: Public read access for active variants
CREATE POLICY "Anyone can view active variants" ON public.product_variants FOR SELECT USING (is_active = true);

-- Cart Items: Users can only access their own cart items
CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (
  auth.uid() = user_id OR
  (auth.uid() IS NULL AND session_id IS NOT NULL)
);

-- Wishlist Items: Users can only access their own wishlist
CREATE POLICY "Users can manage own wishlist" ON public.wishlist_items FOR ALL USING (auth.uid() = user_id);

-- Orders: Users can only access their own orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: Users can only access items from their own orders
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);

-- Product Reviews: Users can manage their own reviews, everyone can read approved reviews
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage own reviews" ON public.product_reviews FOR ALL USING (auth.uid() = user_id);

-- Discount Codes: Public read access for active codes (limited info)
CREATE POLICY "Anyone can view active discount codes" ON public.discount_codes FOR SELECT USING (
  is_active = true AND
  (starts_at <= NOW()) AND
  (ends_at IS NULL OR ends_at >= NOW())
);

-- Admin Users: Only admins can access
CREATE POLICY "Only admins can access admin_users" ON public.admin_users FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true)
);

-- System Settings: Public read access for non-sensitive settings
CREATE POLICY "Anyone can view public settings" ON public.system_settings FOR SELECT USING (
  key NOT LIKE 'secret_%' AND key NOT LIKE 'private_%'
);

-- =============================================
-- 10. INDEXES FOR PERFORMANCE
-- =============================================

-- User-related indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX idx_user_addresses_type ON public.user_addresses(type);

-- Product-related indexes
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON public.product_categories(category_id);
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);

-- Cart and wishlist indexes
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items(user_id);

-- Order-related indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Review indexes
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_approved ON public.product_reviews(is_approved);

-- =============================================
-- 11. INITIAL DATA SEEDING
-- =============================================

-- Insert initial categories
INSERT INTO public.categories (id, name_key, description, display_order) VALUES
('bakery', 'categories.bakery', 'חומרי אפייה בסיסיים', 1),
('dairy', 'categories.dairy', 'מוצרי חלב', 2),
('frozen', 'categories.frozen', 'מוצרים קפואים', 3),
('fruits', 'categories.fruits', 'פירות טריים', 4),
('seafood', 'categories.seafood', 'דגים ומאכלי ים', 5),
('beverages', 'categories.beverages', 'משקאות', 6),
('snacks', 'categories.snacks', 'חטיפים', 7),
('condiments', 'categories.condiments', 'רטבים ותבלינים', 8),
('cakes', 'categories.cakes', 'עוגות', 9),
('cookies', 'categories.cookies', 'עוגיות', 10),
('cheesecakes', 'categories.cheesecakes', 'עוגות גבינה', 11);

-- Insert initial system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('store_name', '"Bakeo - חנות האפייה"', 'Store name'),
('store_email', '"info@bakeo.co.il"', 'Store contact email'),
('currency', '"ILS"', 'Store currency'),
('tax_rate', '0.17', 'VAT rate for Israel'),
('free_shipping_threshold', '200', 'Minimum order for free shipping');