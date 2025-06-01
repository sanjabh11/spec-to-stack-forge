
/**
 * Frontend UI Component Tests
 * Tests React components and user interactions
 */

const { test, expect } = require('@playwright/test');

test.describe('AI Advisor Platform UI Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Domain Selector displays and works', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('AI Platform Advisor');
    
    // Check if domain cards are visible
    await expect(page.locator('[data-testid="domain-card"]')).toHaveCount(4);
    
    // Test domain selection
    await page.click('text=Healthcare');
    await expect(page.locator('.chat-interface')).toBeVisible();
  });

  test('Chat Interface functionality', async ({ page }) => {
    // Navigate to chat
    await page.click('text=Healthcare');
    
    // Test chat input
    await page.fill('textarea[placeholder*="message"]', 'What kind of system do you need?');
    await page.click('button:has-text("Send")');
    
    // Wait for response
    await expect(page.locator('.chat-message')).toBeVisible({ timeout: 10000 });
  });

  test('Document Upload component', async ({ page }) => {
    await page.click('text=Knowledge Base');
    
    // Check upload area is visible
    await expect(page.locator('input[type="file"]')).toBeVisible();
    
    // Test file upload interface
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample.pdf');
  });

  test('Admin Dashboard access', async ({ page }) => {
    // Navigate to admin (if accessible)
    await page.goto('http://localhost:3000/admin');
    
    // Check admin components
    await expect(page.locator('h1')).toContainText('Admin');
  });

  test('Cost Estimator functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/cost-estimator');
    
    // Test cost calculator inputs
    await page.fill('input[name="users"]', '100');
    await page.fill('input[name="requests"]', '1000');
    
    await page.click('button:has-text("Calculate")');
    await expect(page.locator('.cost-result')).toBeVisible();
  });

  test('Platform Builder workflow', async ({ page }) => {
    await page.goto('http://localhost:3000/platform-builder');
    
    // Test step-by-step builder
    await expect(page.locator('.step-indicator')).toBeVisible();
    
    // Complete first step
    await page.selectOption('select[name="domain"]', 'healthcare');
    await page.click('button:has-text("Next")');
    
    // Verify progress
    await expect(page.locator('.step-2')).toBeVisible();
  });

  test('Responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.container')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.container')).toBeVisible();
    
    // Test desktop view
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('.container')).toBeVisible();
  });

});
