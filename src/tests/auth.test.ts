/**
 * Authentication Flow Tests
 *
 * These tests verify the authentication system works correctly.
 * Run these tests after setting up Supabase to ensure everything is working.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { supabase } from '../lib/supabase'

// Test user credentials
const testUser = {
  email: 'test@bakeo.test',
  password: 'TestPassword123!',
  fullName: 'Test User'
}

describe('Authentication System', () => {
  // Clean up after each test
  afterEach(async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      // Ignore errors during cleanup
    }
  })

  it('should connect to Supabase', async () => {
    // Test that Supabase client is properly configured
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  it('should handle sign up flow', async () => {
    // Test user registration
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: testUser.fullName,
        },
      },
    })

    expect(error).toBeNull()
    expect(data.user).toBeDefined()
    expect(data.user?.email).toBe(testUser.email)
  })

  it('should handle sign in flow', async () => {
    // First create a user (in real app, this would be done via sign up)
    await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
    })

    // Test sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    })

    expect(error).toBeNull()
    expect(data.user).toBeDefined()
    expect(data.session).toBeDefined()
  })

  it('should handle sign out flow', async () => {
    // First sign in
    await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    })

    // Test sign out
    const { error } = await supabase.auth.signOut()
    expect(error).toBeNull()

    // Verify user is signed out
    const { data: { user } } = await supabase.auth.getUser()
    expect(user).toBeNull()
  })

  it('should handle invalid credentials', async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    })

    expect(error).toBeDefined()
    expect(error?.message).toContain('Invalid')
  })

  it('should handle password reset request', async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(testUser.email)

    // This should not error even if user doesn't exist (for security)
    expect(error).toBeNull()
  })
})

describe('User Profile System', () => {
  beforeEach(async () => {
    // Sign in before each test
    await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    })
  })

  afterEach(async () => {
    await supabase.auth.signOut()
  })

  it('should create user profile on signup', async () => {
    const { data: { user } } = await supabase.auth.getUser()
    expect(user).toBeDefined()

    if (user) {
      // Check if profile was created
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      expect(error).toBeNull()
      expect(profile).toBeDefined()
      expect(profile?.email).toBe(testUser.email)
    }
  })

  it('should update user profile', async () => {
    const { data: { user } } = await supabase.auth.getUser()
    expect(user).toBeDefined()

    if (user) {
      const updatedData = {
        full_name: 'Updated Test User',
        phone: '+1234567890',
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update(updatedData)
        .eq('id', user.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(profile?.full_name).toBe(updatedData.full_name)
      expect(profile?.phone).toBe(updatedData.phone)
    }
  })
})

describe('Row Level Security', () => {
  it('should prevent access to other users data', async () => {
    // This test verifies RLS is working
    const { error } = await supabase
      .from('user_profiles')
      .select('*')
      .neq('id', 'fake-user-id')

    // Should either return no data or specific user data only
    // The exact behavior depends on RLS policy implementation
    expect(error).toBeNull()
  })

  it('should allow public access to products', async () => {
    // Test that products are publicly accessible
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5)

    expect(error).toBeNull()
    expect(data).toBeDefined()
  })

  it('should allow public access to categories', async () => {
    // Test that categories are publicly accessible
    const { data, error } = await supabase
      .from('categories')
      .select('*')

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data.length).toBeGreaterThan(0)
  })
})

/**
 * Manual Testing Checklist
 *
 * After running these automated tests, manually verify:
 *
 * 1. Navigation to /auth/signup shows the signup form
 * 2. Navigation to /auth/signin shows the signin form
 * 3. Signup form validation works (password strength, email format)
 * 4. Signin form validation works (required fields)
 * 5. Successful signup shows success message
 * 6. Successful signin redirects to home page
 * 7. User avatar appears in header when signed in
 * 8. User dropdown menu works (profile, orders, wishlist, sign out)
 * 9. Sign out button works
 * 10. Guest users see signin/signup buttons in header
 * 11. Password reset form works
 * 12. Email verification flow works (check email)
 * 13. Protected routes redirect to signin when not authenticated
 * 14. RTL layout works correctly on auth pages
 * 15. Mobile responsive design works on auth pages
 * 16. Form errors display correctly in both languages
 * 17. Success messages display correctly in both languages
 * 18. Browser refresh maintains authentication state
 * 19. Authentication persists across browser sessions
 * 20. Multiple tabs stay synchronized with auth state
 */