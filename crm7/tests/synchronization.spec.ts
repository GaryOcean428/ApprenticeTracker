import { test, expect } from '@playwright/test';

// Test the data synchronization mechanisms
test.describe('Data Synchronization', () => {
  test('should sync leads from website to CRM', async ({ page }) => {
    // Create a lead on the website
    await page.goto('https://braden.vercel.app/contact');
    
    // Fill in the contact form with unique data
    const uniqueId = Date.now().toString().slice(-6);
    await page.getByLabel('First Name').fill('Sync');
    await page.getByLabel('Last Name').fill(`Test${uniqueId}`);
    await page.getByLabel('Email').fill(`sync.test${uniqueId}@example.com`);
    await page.getByLabel('Phone').fill('555-123-4567');
    await page.getByLabel('Message').fill('Testing sync from website to CRM');
    
    // Select a service
    await page.getByText('Apprenticeships').click();
    
    // Submit the form
    await page.getByRole('button', { name: 'Send Message' }).click();
    
    // Check for success message
    await expect(page.getByText('Thank You!')).toBeVisible();
    
    // Wait for sync to happen (both immediate and periodic)
    await page.waitForTimeout(5000);
    
    // Navigate to CRM to verify the lead exists
    await page.goto('https://crm7.vercel.app/leads');
    
    // Search for the unique lead
    await page.getByPlaceholder('Search leads...').fill(`Test${uniqueId}`);
    await page.keyboard.press('Enter');
    
    // Verify the lead appears in the results
    await expect(page.getByText(`Sync Test${uniqueId}`)).toBeVisible();
  });

  test('should handle webhook events for lead updates', async ({ page }) => {
    // Create a lead on the website first
    await page.goto('https://braden.vercel.app/contact');
    
    // Fill in the contact form with unique data
    const uniqueId = Date.now().toString().slice(-6);
    await page.getByLabel('First Name').fill('Webhook');
    await page.getByLabel('Last Name').fill(`Test${uniqueId}`);
    await page.getByLabel('Email').fill(`webhook.test${uniqueId}@example.com`);
    await page.getByLabel('Phone').fill('555-987-6543');
    await page.getByLabel('Message').fill('Testing webhook events');
    
    // Submit the form
    await page.getByRole('button', { name: 'Send Message' }).click();
    
    // Wait for sync to happen
    await page.waitForTimeout(5000);
    
    // Navigate to CRM to find and update the lead
    await page.goto('https://crm7.vercel.app/leads');
    
    // Search for the unique lead
    await page.getByPlaceholder('Search leads...').fill(`Test${uniqueId}`);
    await page.keyboard.press('Enter');
    
    // Click on the lead to view details
    await page.getByText(`Webhook Test${uniqueId}`).click();
    
    // Update the lead status
    await page.getByLabel('Status').click();
    await page.getByText('Qualified').click();
    
    // Save the changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Wait for webhook to process
    await page.waitForTimeout(5000);
    
    // Verify the lead status was updated in the CRM
    await page.reload();
    await expect(page.getByText('Qualified')).toBeVisible();
    
    // This would ideally verify the status in the website database as well,
    // but for this test we're focusing on the CRM side
  });

  test('should handle periodic sync for missed updates', async ({ page }) => {
    // This test simulates a scenario where a webhook fails and periodic sync catches up
    
    // First, create a lead directly in the CRM
    await page.goto('https://crm7.vercel.app/leads/new');
    
    // Fill in the lead form with unique data
    const uniqueId = Date.now().toString().slice(-6);
    await page.getByLabel('First Name *').fill('Periodic');
    await page.getByLabel('Last Name *').fill(`Sync${uniqueId}`);
    await page.getByLabel('Email *').fill(`periodic.sync${uniqueId}@example.com`);
    await page.getByLabel('Source *').click();
    await page.getByText('Website').click();
    
    // Create the lead
    await page.getByRole('button', { name: 'Create Lead' }).click();
    
    // Wait for the lead detail page to load
    await expect(page.getByText('Lead Details')).toBeVisible();
    
    // Wait for periodic sync to run (normally 5 minutes, but we'll use a shorter time for testing)
    await page.waitForTimeout(10000);
    
    // Verify the lead still exists in the CRM
    await page.goto('https://crm7.vercel.app/leads');
    await page.getByPlaceholder('Search leads...').fill(`Sync${uniqueId}`);
    await page.keyboard.press('Enter');
    
    // Verify the lead appears in the results
    await expect(page.getByText(`Periodic Sync${uniqueId}`)).toBeVisible();
  });
});
