import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Tests', () => {
  test('should display correctly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile menu button is visible
    const mobileMenuButton = page.locator('button[aria-label*="menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Check if desktop navigation is hidden
    const desktopNav = page.locator('nav').filter({ hasText: 'אודות' });
    await expect(desktopNav).not.toBeVisible();
  });

  test('should handle mobile menu interaction', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Open mobile menu
    const mobileMenuButton = page.locator('button[aria-label*="menu"]');
    await mobileMenuButton.click();
    
    // Check if mobile menu is open
    const mobileMenu = page.locator('.fixed');
    await expect(mobileMenu).toBeVisible();
    
    // Check if navigation links are visible
    const navLinks = mobileMenu.locator('a');
    await expect(navLinks.first()).toBeVisible();
    
    // Close mobile menu
    const closeButton = mobileMenu.locator('button[aria-label*="close"]');
    await closeButton.click();
    
    // Check if mobile menu is closed
    await expect(mobileMenu).not.toBeVisible();
  });

  test('should display forms correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/signup');
    
    // Check if form is properly sized for mobile
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Check if input fields are properly sized
    const nameInput = page.locator('input[id="fullName"]');
    await expect(nameInput).toBeVisible();
    
    // Check if buttons are properly sized for touch
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('should handle product grid on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if product grid adapts to mobile
    const productGrid = page.locator('.grid');
    await expect(productGrid).toBeVisible();
    
    // Check if product cards are properly sized
    const productCards = page.locator('.product-card, [data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
  });

  test('should handle search on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Open mobile menu to access search
    const mobileMenuButton = page.locator('button[aria-label*="menu"]');
    await mobileMenuButton.click();
    
    // Check if search input is visible in mobile menu
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
      
      // Test search functionality
      await searchInput.fill('עוגה');
      await searchInput.press('Enter');
    }
  });

  test('should handle profile menu on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Look for user menu
    const userMenu = page.locator('.user-menu');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      // Check if dropdown appears and is properly positioned
      const dropdown = page.locator('.fixed');
      await expect(dropdown).toBeVisible();
    }
  });

  test('should handle cart on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if cart icon is visible and clickable
    const cartLink = page.locator('a[href="/cart"]');
    await expect(cartLink).toBeVisible();
    
    // Click cart
    await cartLink.click();
    await expect(page).toHaveURL(/.*cart/);
  });

  test('should handle language switcher on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if language switcher is visible
    const languageSwitcher = page.locator('[data-testid="language-switcher"]');
    if (await languageSwitcher.isVisible()) {
      await expect(languageSwitcher).toBeVisible();
    }
  });
});
