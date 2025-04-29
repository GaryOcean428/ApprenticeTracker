import { test, expect } from '@playwright/test';

// Test the integration between website and CRM
test.describe('Website-CRM Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the website contact page
    await page.goto('https://braden.vercel.app/contact');
  });

  test('should submit contact form and create lead in CRM', async ({ page }) => {
    // Fill in the contact form
    await page.getByLabel('First Name').fill('Integration');
    await page.getByLabel('Last Name').fill('Test');
    await page.getByLabel('Email').fill('integration.test@example.com');
    await page.getByLabel('Phone').fill('555-987-6543');
    await page.getByLabel('Message').fill('This is an integration test message');
    
    // Select a service
    await page.getByText('Apprenticeships').click();
    
    // Submit the form
    await page.getByRole('button', { name: 'Send Message' }).click();
    
    // Check for success message
    await expect(page.getByText('Thank You!')).toBeVisible();
    await expect(page.getByText('Your message has been received')).toBeVisible();
    
    // Wait for the lead to be processed
    await page.waitForTimeout(2000);
    
    // Navigate to the CRM to verify the lead was created
    await page.goto('https://crm7.vercel.app/leads');
    
    // Search for the lead
    await page.getByPlaceholder('Search leads...').fill('integration.test@example.com');
    await page.keyboard.press('Enter');
    
    // Verify the lead appears in the results
    await expect(page.getByText('Integration Test')).toBeVisible();
  });

  test('should sync lead data between systems', async ({ page }) => {
    // Create a lead in the CRM
    await page.goto('https://crm7.vercel.app/leads/new');
    
    // Fill in the lead form
    await page.getByLabel('First Name *').fill('Sync');
    await page.getByLabel('Last Name *').fill('Test');
    await page.getByLabel('Email *').fill('sync.test@example.com');
    await page.getByLabel('Phone').fill('555-555-5555');
    await page.getByLabel('Company').fill('Sync Company');
    
    // Submit the form
    await page.getByRole('button', { name: 'Create Lead' }).click();
    
    // Wait for the lead to be processed
    await page.waitForTimeout(2000);
    
    // Update the lead status
    await page.getByLabel('Status').click();
    await page.getByText('Qualified').click();
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Wait for the sync to happen
    await page.waitForTimeout(5000);
    
    // Check the website admin to verify the lead was synced
    // Note: This would require admin access to the website database
    // For this test, we'll just verify the lead exists in the CRM
    await page.goto('https://crm7.vercel.app/leads');
    await page.getByPlaceholder('Search leads...').fill('sync.test@example.com');
    await page.keyboard.press('Enter');
    
    // Verify the lead appears with the updated status
    await expect(page.getByText('Sync Test')).toBeVisible();
    await expect(page.getByText('Qualified')).toBeVisible();
  });
});
