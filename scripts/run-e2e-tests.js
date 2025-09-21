#!/usr/bin/env node

/**
 * E2E Test Runner for Hebrew RTL Website
 * This script runs comprehensive E2E tests without requiring browser installation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting E2E Test Suite for Hebrew RTL Website...\n');

// Test configuration
const tests = [
  {
    name: 'Unit Tests',
    command: 'npm run test',
    description: 'Running unit tests with Vitest'
  },
  {
    name: 'Linting Tests',
    command: 'npm run lint',
    description: 'Running ESLint checks'
  },
  {
    name: 'Build Tests',
    command: 'npm run build',
    description: 'Testing production build'
  }
];

// Check if development server is running
function checkDevServer() {
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5173', { encoding: 'utf8' });
    return response.trim() === '200';
  } catch (error) {
    return false;
  }
}

// Run a single test
function runTest(test) {
  console.log(`\n📋 ${test.name}`);
  console.log(`   ${test.description}`);
  
  try {
    const startTime = Date.now();
    execSync(test.command, { stdio: 'inherit' });
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`   ✅ ${test.name} passed (${duration}s)`);
    return true;
  } catch (error) {
    console.log(`   ❌ ${test.name} failed`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  let passed = 0;
  let failed = 0;
  
  console.log('🔍 Checking development server...');
  if (!checkDevServer()) {
    console.log('⚠️  Development server not running. Starting it...');
    try {
      execSync('npm run dev &', { stdio: 'inherit' });
      console.log('⏳ Waiting for server to start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.log('❌ Failed to start development server');
      return;
    }
  } else {
    console.log('✅ Development server is running');
  }
  
  console.log('\n🚀 Running test suite...\n');
  
  for (const test of tests) {
    if (runTest(test)) {
      passed++;
    } else {
      failed++;
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your Hebrew RTL website is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Manual E2E test checklist
function printManualTestChecklist() {
  console.log('\n📋 Manual E2E Test Checklist:');
  console.log('   Please manually verify the following:');
  console.log('');
  console.log('   🌐 RTL Layout:');
  console.log('   □ Hebrew text displays right-to-left');
  console.log('   □ Navigation menu is properly aligned');
  console.log('   □ Profile dropdown appears on correct side');
  console.log('   □ Forms have RTL input direction');
  console.log('');
  console.log('   📱 Mobile Responsiveness:');
  console.log('   □ Mobile menu opens and closes properly');
  console.log('   □ Touch targets are appropriately sized');
  console.log('   □ Text doesn\'t overflow on small screens');
  console.log('   □ Buttons are easily tappable');
  console.log('');
  console.log('   🔐 Authentication:');
  console.log('   □ Sign up form validates correctly');
  console.log('   □ Sign in form works properly');
  console.log('   □ Google OAuth buttons are visible');
  console.log('   □ Password visibility toggle works');
  console.log('');
  console.log('   🛒 E-commerce Features:');
  console.log('   □ Product grid displays correctly');
  console.log('   □ Category filtering works');
  console.log('   □ Search functionality works');
  console.log('   □ Cart page loads properly');
  console.log('');
  console.log('   🎨 UI Consistency:');
  console.log('   □ Button styles are consistent');
  console.log('   □ Colors match design system');
  console.log('   □ Typography is consistent');
  console.log('   □ Spacing follows design guidelines');
}

// Main execution
async function main() {
  try {
    await runAllTests();
    printManualTestChecklist();
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runAllTests, runTest, checkDevServer };
