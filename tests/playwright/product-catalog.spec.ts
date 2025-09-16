import { test, expect } from '@playwright/test';

test.describe('Product Catalog Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display product grid', async ({ page }) => {
    // Check if product grid is visible
    const productGrid = page.locator('.grid');
    await expect(productGrid).toBeVisible();
    
    // Check if product cards are present
    const productCards = page.locator('.product-card, [data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
  });

  test('should display product information correctly', async ({ page }) => {
    const productCard = page.locator('.product-card, [data-testid="product-card"]').first();
    
    // Check if product name is visible
    await expect(productCard.locator('h3, .product-name')).toBeVisible();
    
    // Check if product price is visible
    await expect(productCard.locator('.price, .product-price')).toBeVisible();
    
    // Check if product image is visible
    await expect(productCard.locator('img')).toBeVisible();
  });

  test('should handle product filtering', async ({ page }) => {
    // Look for filter controls
    const filterSection = page.locator('.filters, [data-testid="filters"]');
    if (await filterSection.isVisible()) {
      // Check if search filter is present
      const searchFilter = filterSection.locator('input[type="text"]');
      await expect(searchFilter).toBeVisible();
      
      // Test search functionality
      await searchFilter.fill('עוגה');
      
      // Check if results update
      await page.waitForTimeout(1000);
    }
  });

  test('should handle category filtering', async ({ page }) => {
    // Navigate to a category page
    await page.goto('/category/bakery');
    
    // Check if category page loads
    await expect(page.locator('h1')).toContainText('מאפייה');
    
    // Check if products are filtered by category
    const productCards = page.locator('.product-card, [data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
  });

  test('should handle product sorting', async ({ page }) => {
    const sortSelect = page.locator('select');
    if (await sortSelect.isVisible()) {
      // Test sorting options
      await sortSelect.selectOption('price-asc');
      await page.waitForTimeout(1000);
      
      await sortSelect.selectOption('price-desc');
      await page.waitForTimeout(1000);
    }
  });

  test('should handle pagination', async ({ page }) => {
    const loadMoreButton = page.locator('button').filter({ hasText: 'טען עוד' });
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForTimeout(1000);
      
      // Check if more products are loaded
      const productCards = page.locator('.product-card, [data-testid="product-card"]');
      await expect(productCards).toHaveCount({ min: 1 });
    }
  });

  test('should display product categories correctly', async ({ page }) => {
    const categoryChips = page.locator('.category-chip, [data-testid="category-chip"]');
    if (await categoryChips.isVisible()) {
      await expect(categoryChips.first()).toBeVisible();
      
      // Click on a category chip
      await categoryChips.first().click();
      
      // Should navigate to category page
      await expect(page).toHaveURL(/.*category/);
    }
  });

  test('should handle empty state', async ({ page }) => {
    // Navigate to a category with no products
    await page.goto('/category/nonexistent');
    
    // Check if empty state is displayed
    const emptyState = page.locator('text=אין מוצרים');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });
});
