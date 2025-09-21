import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to homepage', async ({ page }) => {
    const logo = page.locator('img[alt="Bakeo"]');
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate to about page', async ({ page }) => {
    const aboutLink = page.locator('a').filter({ hasText: 'אודות' });
    await aboutLink.click();
    await expect(page).toHaveURL(/.*about/);
  });

  test('should navigate to contact page', async ({ page }) => {
    const contactLink = page.locator('a').filter({ hasText: 'צור קשר' });
    await contactLink.click();
    await expect(page).toHaveURL(/.*contact/);
  });

  test('should display categories menu', async ({ page }) => {
    const categoriesButton = page.locator('button').filter({ hasText: 'קטגוריות' });
    await expect(categoriesButton).toBeVisible();
    
    // Hover over categories to open menu
    await categoriesButton.hover();
    
    // Check if categories dropdown appears
    const categoriesMenu = page.locator('.absolute').filter({ hasText: 'קטגוריות' });
    await expect(categoriesMenu).toBeVisible();
  });

  test('should navigate to cart page', async ({ page }) => {
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();
    await expect(page).toHaveURL(/.*cart/);
  });

  test('should display language switcher', async ({ page }) => {
    const languageSwitcher = page.locator('[data-testid="language-switcher"]');
    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click();
      
      // Check if language options appear
      const languageOptions = page.locator('.language-options');
      await expect(languageOptions).toBeVisible();
    }
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile menu button is visible
    const mobileMenuButton = page.locator('button[aria-label*="menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Click mobile menu
    await mobileMenuButton.click();
    
    // Check if mobile menu is open
    const mobileMenu = page.locator('.fixed');
    await expect(mobileMenu).toBeVisible();
    
    // Check if navigation links are visible in mobile menu
    const mobileNavLinks = mobileMenu.locator('a');
    await expect(mobileNavLinks.first()).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('עוגה');
      await searchInput.press('Enter');
      
      // Should navigate to search results
      await expect(page).toHaveURL(/.*search/);
    }
  });
});
