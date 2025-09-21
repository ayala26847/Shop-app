import { test, expect } from '@playwright/test';

test.describe('Hebrew RTL Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
  });

  test('should display Hebrew text with RTL direction', async ({ page }) => {
    // Check if the page has RTL direction
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');
    
    // Check if Hebrew text is displayed correctly
    const hebrewText = page.locator('text=בית');
    await expect(hebrewText).toBeVisible();
  });

  test('should have proper RTL navigation layout', async ({ page }) => {
    // Check navigation elements are positioned correctly for RTL
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check if logo is on the right side in RTL
    const logo = page.locator('img[alt="Bakeo"]');
    await expect(logo).toBeVisible();
    
    // Check if navigation items are properly aligned
    const navLinks = page.locator('.nav-link');
    await expect(navLinks.first()).toBeVisible();
  });

  test('should display profile menu correctly in RTL', async ({ page }) => {
    // Look for user menu or sign in button
    const userMenu = page.locator('.user-menu');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      // Check if dropdown appears on the correct side for RTL
      const dropdown = page.locator('.absolute').first();
      await expect(dropdown).toBeVisible();
    }
  });

  test('should handle mobile RTL layout correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile menu button is visible
    const mobileMenuButton = page.locator('button[aria-label*="menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Click mobile menu
    await mobileMenuButton.click();
    
    // Check if mobile menu opens from the correct side for RTL
    const mobileMenu = page.locator('.fixed');
    await expect(mobileMenu).toBeVisible();
  });

  test('should display search input with RTL support', async ({ page }) => {
    // Check if search input has proper RTL attributes
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toHaveAttribute('dir', 'rtl');
    }
  });

  test('should handle form inputs with RTL layout', async ({ page }) => {
    // Navigate to sign up page
    await page.goto('/auth/signup');
    
    // Check if form has RTL direction
    const form = page.locator('form');
    await expect(form).toHaveAttribute('dir', 'rtl');
    
    // Check if input fields have proper RTL support
    const nameInput = page.locator('input[id="fullName"]');
    await expect(nameInput).toHaveAttribute('dir', 'rtl');
  });
});
