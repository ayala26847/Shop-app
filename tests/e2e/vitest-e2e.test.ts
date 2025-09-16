import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('E2E Tests with Vitest', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    // Launch browser
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Homepage Tests', () => {
    it('should load homepage successfully', async () => {
      await page.goto('http://localhost:5173');
      const title = await page.title();
      expect(title).toContain('Bakeo');
    });

    it('should have RTL direction', async () => {
      await page.goto('http://localhost:5173');
      const dir = await page.getAttribute('html', 'dir');
      expect(dir).toBe('rtl');
    });

    it('should display navigation', async () => {
      await page.goto('http://localhost:5173');
      const nav = await page.locator('nav').isVisible();
      expect(nav).toBe(true);
    });

    it('should display logo', async () => {
      await page.goto('http://localhost:5173');
      const logo = await page.locator('img[alt="Bakeo"]').isVisible();
      expect(logo).toBe(true);
    });
  });

  describe('Authentication Tests', () => {
    it('should load sign up page', async () => {
      await page.goto('http://localhost:5173/auth/signup');
      const form = await page.locator('form').isVisible();
      expect(form).toBe(true);
    });

    it('should load sign in page', async () => {
      await page.goto('http://localhost:5173/auth/signin');
      const form = await page.locator('form').isVisible();
      expect(form).toBe(true);
    });

    it('should have RTL form direction', async () => {
      await page.goto('http://localhost:5173/auth/signup');
      const dir = await page.getAttribute('form', 'dir');
      expect(dir).toBe('rtl');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should work on mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:5173');
      
      const body = await page.locator('body').isVisible();
      expect(body).toBe(true);
    });

    it('should show mobile menu button', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:5173');
      
      const mobileMenuButton = await page.locator('button[aria-label*="menu"]').isVisible();
      expect(mobileMenuButton).toBe(true);
    });
  });

  describe('Navigation Tests', () => {
    it('should navigate to about page', async () => {
      await page.goto('http://localhost:5173');
      await page.click('a[href="/about"]');
      await page.waitForURL('**/about');
      const url = page.url();
      expect(url).toContain('/about');
    });

    it('should navigate to cart page', async () => {
      await page.goto('http://localhost:5173');
      await page.click('a[href="/cart"]');
      await page.waitForURL('**/cart');
      const url = page.url();
      expect(url).toContain('/cart');
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      await page.goto('http://localhost:5173/auth/signup');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check if validation errors appear
      const errors = await page.locator('.form-error').count();
      expect(errors).toBeGreaterThan(0);
    });

    it('should handle form input', async () => {
      await page.goto('http://localhost:5173/auth/signup');
      
      // Fill form fields
      await page.fill('input[id="fullName"]', 'ישראל ישראלי');
      await page.fill('input[id="email"]', 'test@example.com');
      await page.fill('input[id="password"]', 'password123');
      
      // Check if fields are filled
      const nameValue = await page.inputValue('input[id="fullName"]');
      expect(nameValue).toBe('ישראל ישראלי');
    });
  });
});
