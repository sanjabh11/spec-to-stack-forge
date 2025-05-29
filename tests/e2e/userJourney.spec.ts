
import { test, expect } from '@playwright/test';

test.describe('Full User Journey', () => {
  test('healthcare spec creation journey', async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Should see domain selector
    await expect(page.getByText('Select your domain')).toBeVisible();
    
    // Select healthcare domain
    await page.click('[data-testid="domain-healthcare"]');
    
    // Should start chat interface
    await expect(page.getByText('Healthcare AI Solution')).toBeVisible();
    
    // Answer a few questions
    await page.fill('input[placeholder*="response"]', 'Clinical note analysis');
    await page.click('button[type="submit"]');
    
    // Wait for response and next question
    await page.waitForSelector('.chat-response');
    
    // Continue with more answers
    await page.fill('input[placeholder*="response"]', 'EHR database, PDF documents');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('.chat-response');
    
    // Complete the journey
    await page.fill('input[placeholder*="response"]', '99.9%');
    await page.click('button[type="submit"]');
    
    // Should eventually see generation option
    await expect(page.getByText('generate', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('knowledge base management', async ({ page }) => {
    await page.goto('/');
    
    // Click knowledge base button
    await page.click('button:has-text("Manage Knowledge Base")');
    
    // Should see knowledge base interface
    await expect(page.getByText('Knowledge Base Management')).toBeVisible();
    
    // Should see upload area
    await expect(page.getByText('Upload Documents')).toBeVisible();
  });
});
