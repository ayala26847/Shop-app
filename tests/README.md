# E2E Testing Suite for Hebrew RTL Website

This directory contains comprehensive End-to-End (E2E) tests for the Hebrew RTL bakery website using Playwright.

## Test Structure

### Test Files

1. **`rtl-layout.spec.ts`** - Tests for Hebrew RTL layout and text direction
2. **`authentication.spec.ts`** - Tests for sign up/sign in functionality
3. **`navigation.spec.ts`** - Tests for website navigation and menu functionality
4. **`product-catalog.spec.ts`** - Tests for product display and filtering
5. **`mobile-responsiveness.spec.ts`** - Tests for mobile device compatibility

## Running Tests

### Prerequisites

Make sure you have the development server running:
```bash
npm run dev
```

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run only mobile tests
npm run test:e2e:mobile

# Run all tests (unit + E2E)
npm run test:all
```

## Test Coverage

### RTL Layout Tests
- ✅ Hebrew text direction validation
- ✅ Navigation layout in RTL
- ✅ Profile menu positioning
- ✅ Mobile RTL layout
- ✅ Form input RTL support
- ✅ Search input RTL attributes

### Authentication Tests
- ✅ Sign up form display and validation
- ✅ Sign in form display and validation
- ✅ Google OAuth button presence
- ✅ Form field validation
- ✅ Password visibility toggle
- ✅ Navigation between auth pages

### Navigation Tests
- ✅ Homepage navigation
- ✅ About page navigation
- ✅ Contact page navigation
- ✅ Categories menu functionality
- ✅ Cart page navigation
- ✅ Language switcher
- ✅ Mobile navigation
- ✅ Search functionality

### Product Catalog Tests
- ✅ Product grid display
- ✅ Product information display
- ✅ Product filtering
- ✅ Category filtering
- ✅ Product sorting
- ✅ Pagination
- ✅ Category chips
- ✅ Empty state handling

### Mobile Responsiveness Tests
- ✅ Mobile viewport display
- ✅ Mobile menu interaction
- ✅ Mobile form display
- ✅ Mobile product grid
- ✅ Mobile search
- ✅ Mobile profile menu
- ✅ Mobile cart functionality
- ✅ Mobile language switcher

## Test Configuration

The tests are configured in `playwright.config.ts` with:
- Multiple browser support (Chrome, Firefox, Safari)
- Mobile device testing (Pixel 5, iPhone 12)
- Automatic dev server startup
- Screenshot and video recording on failure
- Trace collection for debugging

## Debugging Tests

### View Test Results
```bash
# Open test results in browser
npx playwright show-report
```

### Debug Specific Test
```bash
# Run specific test file
npx playwright test rtl-layout.spec.ts

# Run with debug mode
npx playwright test --debug
```

### View Test Traces
```bash
# Open trace viewer
npx playwright show-trace trace.zip
```

## Best Practices

1. **RTL Testing**: All tests verify proper RTL layout and Hebrew text direction
2. **Mobile First**: Tests prioritize mobile responsiveness
3. **Accessibility**: Tests check for proper ARIA labels and keyboard navigation
4. **Performance**: Tests include wait conditions and timeouts
5. **Error Handling**: Tests verify error states and empty conditions

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Headless mode by default
- Retry failed tests
- Generate HTML reports
- Record videos and screenshots on failure

## Maintenance

- Update selectors when UI changes
- Add new test cases for new features
- Keep test data up to date
- Monitor test execution time
- Review and update test assertions regularly
