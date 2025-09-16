import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test('should display sign up form correctly', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check if form elements are visible
    await expect(page.locator('h2')).toContainText('הרשמה');
    await expect(page.locator('input[id="fullName"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
    
    // Check if Google sign up button is present
    const googleButton = page.locator('button').filter({ hasText: 'Google' });
    await expect(googleButton).toBeVisible();
  });

  test('should display sign in form correctly', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Check if form elements are visible
    await expect(page.locator('h2')).toContainText('התחברות');
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    
    // Check if Google sign in button is present
    const googleButton = page.locator('button').filter({ hasText: 'Google' });
    await expect(googleButton).toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Check if validation errors appear
    await expect(page.locator('.form-error')).toBeVisible();
  });

  test('should handle password visibility toggle', async ({ page }) => {
    await page.goto('/auth/signup');
    
    const passwordInput = page.locator('input[id="password"]');
    const toggleButton = page.locator('button').filter({ hasText: '' }).first();
    
    // Check initial state
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button
    await toggleButton.click();
    
    // Check if password is now visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should navigate between sign in and sign up', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Click sign in link
    const signInLink = page.locator('a').filter({ hasText: 'התחברות' });
    await signInLink.click();
    
    // Should be on sign in page
    await expect(page).toHaveURL(/.*auth\/signin/);
    
    // Click sign up link
    const signUpLink = page.locator('a').filter({ hasText: 'הרשמה' });
    await signUpLink.click();
    
    // Should be on sign up page
    await expect(page).toHaveURL(/.*auth\/signup/);
  });
});
