# Supabase Setup Guide for Phase 2 Authentication

This guide will walk you through setting up Supabase for your e-commerce application's authentication system.

## Prerequisites

- A Supabase account (free tier is sufficient for development)
- The Supabase CLI (optional but recommended)

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/up
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `Bakeo Shop` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be ready

## Step 2: Configure Environment Variables

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API Keys** → **anon public** key

3. Update your `.env.local` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_APP_ENV=development
   ```

## Step 3: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `database-schema.sql` from your project root
3. Paste it into the SQL Editor and click **Run**
4. Wait for all tables and policies to be created

## Step 4: Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your development URL:
   ```
   http://localhost:5173
   ```
3. Under **Redirect URLs**, add:
   ```
   http://localhost:5173/auth/**
   ```

### Email Configuration (Optional for Development)

For production, you'll want to configure custom email templates:

1. Go to **Authentication** → **Email Templates**
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link

For development, you can use the default Supabase email service.

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   yarn dev
   ```

2. Navigate to `http://localhost:5173/auth/signup`
3. Try creating a new account
4. Check your email for the confirmation link
5. Try signing in with the new account

## Step 6: Verify Database Tables

In the Supabase dashboard:

1. Go to **Table Editor**
2. You should see the following tables:
   - `user_profiles`
   - `user_addresses`
   - `categories`
   - `products`
   - `product_categories`
   - `product_variants`
   - `cart_items`
   - `wishlist_items`
   - `orders`
   - `order_items`
   - `product_reviews`
   - `discount_codes`
   - `admin_users`
   - `system_settings`

3. Check that initial data was inserted:
   - **Categories**: Should have 11 baking categories
   - **System Settings**: Should have store configuration

## Step 7: Row Level Security (RLS) Verification

1. Go to **Authentication** → **Policies**
2. Verify that RLS policies are active for each table
3. Test that:
   - Authenticated users can only see their own data
   - Public users can view products and categories
   - Cart items work for both authenticated and guest users

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables" error**
   - Check that your `.env.local` file is in the project root
   - Verify the variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Restart your development server after changing environment variables

2. **"Failed to create user profile" error**
   - Check that the `user_profiles` table exists
   - Verify that RLS policies allow INSERT for authenticated users
   - Check the browser console for detailed error messages

3. **Email confirmation not working**
   - For development, check your spam folder
   - In production, configure custom SMTP in Supabase settings
   - Verify that the redirect URLs are correctly configured

4. **RLS policies blocking access**
   - Review the policies in the SQL Editor
   - Test with different user roles
   - Check that `auth.uid()` is working correctly

## Production Considerations

When deploying to production:

1. **Environment Variables**: Update with production Supabase URL and keys
2. **Email Service**: Configure custom SMTP for branded emails
3. **Domain Configuration**: Update Site URL and Redirect URLs
4. **SSL/HTTPS**: Ensure all URLs use HTTPS
5. **Rate Limiting**: Configure appropriate rate limits for auth endpoints
6. **Backup Strategy**: Set up regular database backups

## Next Steps

With authentication now set up, you're ready for:

1. **Phase 3**: Enhanced shopping cart with database persistence
2. **Product Management**: Admin interface for managing products
3. **Order System**: Complete checkout and order processing
4. **User Profiles**: Extended user profile management

## Support

If you encounter issues:

1. Check the Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Review the browser console for detailed error messages
3. Check the Supabase logs in your dashboard
4. Test API calls directly in the Supabase API docs section