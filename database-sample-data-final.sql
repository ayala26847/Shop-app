-- ============================================================================
-- SAMPLE DATA FOR E-COMMERCE APPLICATION (WITH GENERATED UUIDs)
-- ============================================================================
-- Sample categories, products, and system settings with Hebrew/English support
-- Execute this script AFTER creating the database schema and RLS policies
-- ============================================================================

-- ============================================================================
-- SYSTEM SETTINGS
-- ============================================================================
INSERT INTO public.system_settings (key, value, description) VALUES
('store_name', '"בייקאו - Bakeo"', 'Store name in Hebrew and English'),
('store_email', '"info@bakeo.co.il"', 'Store contact email'),
('currency', '"ILS"', 'Store currency (Israeli Shekel)'),
('currency_symbol', '"₪"', 'Currency symbol'),
('tax_rate', '0.17', 'VAT rate for Israel (17%)'),
('free_shipping_threshold', '200', 'Minimum order for free shipping (₪200)'),
('default_language', '"he"', 'Default language (Hebrew)'),
('supported_languages', '["he", "en"]', 'Supported languages'),
('store_address', '{"he": "תל אביב, ישראל", "en": "Tel Aviv, Israel"}', 'Store address'),
('store_phone', '"+972-3-1234567"', 'Store phone number'),
('business_hours', '{"he": "ראשון-חמישי: 8:00-18:00, שישי: 8:00-14:00", "en": "Sun-Thu: 8:00-18:00, Fri: 8:00-14:00"}', 'Business hours'),
('delivery_areas', '["תל אביב", "רמת גן", "גבעתיים", "חולון", "בת ים"]', 'Delivery areas'),
('min_order_amount', '50', 'Minimum order amount (₪50)');

-- ============================================================================
-- CATEGORIES
-- ============================================================================
-- Create categories using uuid_generate_v4() and store IDs in variables
DO $$
DECLARE
    bakery_id UUID := uuid_generate_v4();
    dairy_id UUID := uuid_generate_v4();
    cakes_id UUID := uuid_generate_v4();
    cookies_id UUID := uuid_generate_v4();
    frozen_id UUID := uuid_generate_v4();
    beverages_id UUID := uuid_generate_v4();
    snacks_id UUID := uuid_generate_v4();
    fruits_id UUID := uuid_generate_v4();

    bread1_id UUID := uuid_generate_v4();
    bread2_id UUID := uuid_generate_v4();
    cake1_id UUID := uuid_generate_v4();
    cake2_id UUID := uuid_generate_v4();
    dairy1_id UUID := uuid_generate_v4();
    dairy2_id UUID := uuid_generate_v4();
    cookie1_id UUID := uuid_generate_v4();
    cookie2_id UUID := uuid_generate_v4();
    bev1_id UUID := uuid_generate_v4();
    bev2_id UUID := uuid_generate_v4();
BEGIN
    -- Insert categories
    INSERT INTO public.categories (id, name_key, description, display_order, is_active) VALUES
    (bakery_id, 'categories.bakery', 'חומרי אפייה ומוצרי מאפייה / Bakery products and baking supplies', 1, true),
    (dairy_id, 'categories.dairy', 'מוצרי חלב טריים / Fresh dairy products', 2, true),
    (cakes_id, 'categories.cakes', 'עוגות טריות ומיוחדות / Fresh and specialty cakes', 3, true),
    (cookies_id, 'categories.cookies', 'עוגיות ומתוקים / Cookies and sweets', 4, true),
    (frozen_id, 'categories.frozen', 'מוצרים קפואים / Frozen products', 5, true),
    (beverages_id, 'categories.beverages', 'משקאות / Beverages', 6, true),
    (snacks_id, 'categories.snacks', 'חטיפים ופיצוחים / Snacks and nuts', 7, true),
    (fruits_id, 'categories.fruits', 'פירות טריים / Fresh fruits', 8, true);

    -- Insert bakery products
    INSERT INTO public.products (id, name, description, short_description, slug, sku, price, compare_at_price, weight, images, is_active, featured, rating, reviews_count, tags) VALUES
    (bread1_id, 'לחם שחור מקמח מלא / Whole Wheat Bread', 'לחם שחור טרי ובריא עשוי מקמח מלא 100%, ללא חומרים משמרים. עשיר בסיבים תזונתיים וטעים במיוחד. / Fresh and healthy whole wheat bread made from 100% whole flour, no preservatives. Rich in dietary fiber and especially delicious.', 'לחם מקמח מלא 100% / 100% whole wheat bread', 'whole-wheat-bread', 'BRD001', 12.90, 15.90, 0.5, ARRAY['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'], true, true, 4.5, 23, ARRAY['לחם', 'bread', 'whole-wheat', 'healthy']),

    (bread2_id, 'חלה לשבת / Sabbath Challah', 'חלה מסורתית לשבת, רכה ומתוקה, עשויה מחומרים הכי טובים. מתאימה למשפחות גדולות וקטנות. / Traditional Sabbath challah, soft and sweet, made from the finest ingredients. Perfect for families large and small.', 'חלה מסורתית לשבת / Traditional Sabbath challah', 'sabbath-challah', 'BRD002', 18.90, 22.90, 0.6, ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800'], true, true, 4.8, 45, ARRAY['חלה', 'challah', 'sabbath', 'traditional']);

    -- Insert cake products
    INSERT INTO public.products (id, name, description, short_description, slug, sku, price, compare_at_price, weight, images, is_active, featured, rating, reviews_count, tags) VALUES
    (cake1_id, 'עוגת שוקולד פאדج / Chocolate Fudge Cake', 'עוגת שוקולד עשירה ודביקה עם שכבות קרם שוקולד. מושלמת לחגיגות ואירועים מיוחדים. / Rich and fudgy chocolate cake with layers of chocolate cream. Perfect for celebrations and special occasions.', 'עוגת שוקולד עשירה / Rich chocolate cake', 'chocolate-fudge-cake', 'CAK001', 89.90, 109.90, 1.2, ARRAY['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'], true, true, 4.9, 67, ARRAY['עוגה', 'cake', 'chocolate', 'celebration']),

    (cake2_id, 'עוגת גבינה ניו יורק / New York Cheesecake', 'עוגת גבינה קלאסית במסורת ניו יורק, קרמית ועשירה עם בסיס עוגיות גרהם. / Classic New York style cheesecake, creamy and rich with graham cracker crust.', 'עוגת גבינה קלאסית / Classic cheesecake', 'new-york-cheesecake', 'CAK002', 79.90, 95.90, 1.0, ARRAY['https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800'], true, false, 4.7, 34, ARRAY['עוגה', 'cake', 'cheesecake', 'classic']);

    -- Insert dairy products
    INSERT INTO public.products (id, name, description, short_description, slug, sku, price, compare_at_price, weight, images, is_active, featured, rating, reviews_count, tags) VALUES
    (dairy1_id, 'חלב טרי 3% / Fresh Milk 3%', 'חלב טרי ואיכותי 3% שומן מחוות בצפון הארץ. עשיר בסידן וחלבונים. / Fresh quality 3% fat milk from northern farms. Rich in calcium and proteins.', 'חלב טרי 3% שומן / Fresh 3% fat milk', 'fresh-milk-3-percent', 'DRY001', 6.90, null, 1.0, ARRAY['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800'], true, false, 4.6, 89, ARRAY['חלב', 'milk', 'dairy', 'fresh']),

    (dairy2_id, 'גבינת צפתית / Tzfat Cheese', 'גבינת צפתית אותנטית, מקורית ועתיקת יומין. טעם מלוח ומיוחד שמתאים לארוחת בוקר. / Authentic original Tzfat cheese, ancient and traditional. Salty and special taste perfect for breakfast.', 'גבינת צפתית אותנטית / Authentic Tzfat cheese', 'tzfat-cheese', 'DRY002', 34.90, 39.90, 0.25, ARRAY['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800'], true, true, 4.4, 56, ARRAY['גבינה', 'cheese', 'tzfat', 'traditional']);

    -- Insert cookie products
    INSERT INTO public.products (id, name, description, short_description, slug, sku, price, compare_at_price, weight, images, is_active, featured, rating, reviews_count, tags) VALUES
    (cookie1_id, 'עוגיות שוקולד צ''יפס / Chocolate Chip Cookies', 'עוגיות שוקולד צ''יפס קלאסיות, פריכות מבחוץ ורכות מבפנים. אפויות טרי מדי יום. / Classic chocolate chip cookies, crispy outside and soft inside. Baked fresh daily.', 'עוגיות שוקולד צ''יפס טריות / Fresh chocolate chip cookies', 'chocolate-chip-cookies', 'COO001', 28.90, 34.90, 0.4, ARRAY['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800'], true, true, 4.7, 78, ARRAY['עוגיות', 'cookies', 'chocolate', 'fresh']),

    (cookie2_id, 'רוגלך קינמון / Cinnamon Rugelach', 'רוגלך מסורתי במילוי קינמון וסוכר, עשוי מבצק חמאה עדין. מתכון סבתא אותנטי. / Traditional rugelach filled with cinnamon and sugar, made from delicate butter dough. Authentic grandmother recipe.', 'רוגלך קינמון מסורתי / Traditional cinnamon rugelach', 'cinnamon-rugelach', 'COO002', 32.90, null, 0.3, ARRAY['https://images.unsplash.com/photo-1571197119282-eac5b4c8bb7f?w=800'], true, false, 4.8, 42, ARRAY['רוגלך', 'rugelach', 'cinnamon', 'traditional']);

    -- Insert beverage products
    INSERT INTO public.products (id, name, description, short_description, slug, sku, price, compare_at_price, weight, images, is_active, featured, rating, reviews_count, tags) VALUES
    (bev1_id, 'מיץ תפוזים טרי / Fresh Orange Juice', 'מיץ תפוזים טבעי 100% סחוט טרי מתפוזי יפו המפורסמים. ללא תוספת סוכר או חומרים משמרים. / 100% natural orange juice freshly squeezed from famous Jaffa oranges. No added sugar or preservatives.', 'מיץ תפוזים טרי 100% / 100% fresh orange juice', 'fresh-orange-juice', 'BEV001', 16.90, null, 1.0, ARRAY['https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800'], true, true, 4.6, 34, ARRAY['מיץ', 'juice', 'orange', 'fresh']),

    (bev2_id, 'קפה קולד ברו / Cold Brew Coffee', 'קפה קולד ברו איכותי, מבושל בשיטת חליטה קרה ל-12 שעות. טעם עדין ומרענן. / Quality cold brew coffee, brewed using cold brewing method for 12 hours. Delicate and refreshing taste.', 'קפה קולד ברו איכותי / Quality cold brew coffee', 'cold-brew-coffee', 'BEV002', 22.90, 26.90, 0.5, ARRAY['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800'], true, false, 4.5, 28, ARRAY['קפה', 'coffee', 'cold-brew', 'quality']);

    -- Insert product-category associations
    INSERT INTO public.product_categories (product_id, category_id) VALUES
    -- Bakery products
    (bread1_id, bakery_id), -- Whole wheat bread -> Bakery
    (bread2_id, bakery_id), -- Challah -> Bakery

    -- Cakes
    (cake1_id, cakes_id), -- Chocolate cake -> Cakes
    (cake2_id, cakes_id), -- Cheesecake -> Cakes

    -- Dairy products
    (dairy1_id, dairy_id), -- Milk -> Dairy
    (dairy2_id, dairy_id), -- Cheese -> Dairy

    -- Cookies
    (cookie1_id, cookies_id), -- Chocolate chip cookies -> Cookies
    (cookie2_id, cookies_id), -- Rugelach -> Cookies

    -- Beverages
    (bev1_id, beverages_id), -- Orange juice -> Beverages
    (bev2_id, beverages_id); -- Cold brew -> Beverages

END $$;

-- ============================================================================
-- SAMPLE DISCOUNT CODES
-- ============================================================================
INSERT INTO public.discount_codes (code, type, value, minimum_amount, usage_limit, starts_at, ends_at, is_active) VALUES
('WELCOME10', 'percentage', 10, 50, 100, NOW(), NOW() + INTERVAL '30 days', true),
('FREESHIP', 'free_shipping', 0, 150, NULL, NOW(), NOW() + INTERVAL '7 days', true),
('SAVE20', 'fixed_amount', 20, 100, 50, NOW(), NOW() + INTERVAL '14 days', true);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Sample data inserted successfully! ✅';
    RAISE NOTICE 'Categories: 8 main categories created';
    RAISE NOTICE 'Products: 10 sample products with Hebrew/English names';
    RAISE NOTICE 'System settings: Store configuration with Israeli settings';
    RAISE NOTICE 'Discount codes: 3 sample promotional codes';
    RAISE NOTICE 'All data uses Israeli pricing (ILS) and supports RTL/LTR text';
END $$;