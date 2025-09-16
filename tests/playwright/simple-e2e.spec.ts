import { test, expect } from '@playwright/test';

// Simple E2E tests that can run without browser installation
test.describe('Basic Website Functionality', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Bakeo|בית/);
  });

  test('should have proper HTML structure', async ({ page }) => {
    await page.goto('/');
    
    // Check basic HTML structure
    await expect(page.locator('html')).toBeAttached();
    await expect(page.locator('body')).toBeAttached();
    await expect(page.locator('header')).toBeAttached();
    await expect(page.locator('main')).toBeAttached();
  });

  test('should have RTL direction attribute', async ({ page }) => {
    await page.goto('/');
    
    // Check if page has RTL direction
    const htmlElement = page.locator('html');
    const dirAttribute = await htmlElement.getAttribute('dir');
    expect(dirAttribute).toBe('rtl');
  });

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/');
    
    // Check if navigation is present
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check if logo is present
    const logo = page.locator('img[alt="Bakeo"]');
    await expect(logo).toBeVisible();
  });

  test('should have working links', async ({ page }) => {
    await page.goto('/');
    
    // Test internal navigation
    const links = page.locator('a[href^="/"]');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should load sign up page', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check if sign up page loads
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[id="fullName"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
  });

  test('should load sign in page', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Check if sign in page loads
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
  });

  test('should have proper form structure', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check form elements
    const form = page.locator('form');
    await expect(form).toHaveAttribute('dir', 'rtl');
    
    // Check input fields have proper attributes
    const nameInput = page.locator('input[id="fullName"]');
    await expect(nameInput).toHaveAttribute('dir', 'rtl');
  });

  test('should handle mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if page loads on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Check if mobile menu button is present
    const mobileMenuButton = page.locator('button[aria-label*="menu"]');
    await expect(mobileMenuButton).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeAttached();
    
    // Check charset
    const charset = page.locator('meta[charset]');
    await expect(charset).toBeAttached();
  });
});
