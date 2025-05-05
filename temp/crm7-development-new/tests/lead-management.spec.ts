import { test, expect } from '@playwright/test';

// Test the lead management functionality in the CRM
test.describe('CRM Lead Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the CRM leads page
    await page.goto('https://crm7.vercel.app/leads');
  });

  test('should display leads listing page', async ({ page }) => {
    // Check that the leads page loads correctly
    await expect(page.getByText('Lead Management')).toBeVisible();
    await expect(page.getByText('View and manage all leads in your pipeline')).toBeVisible();
    
    // Check for the search and filter functionality
    await expect(page.getByPlaceholder('Search leads...')).toBeVisible();
    await expect(page.getByText('Filter')).toBeVisible();
    
    // Check that the leads table is displayed
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should navigate to lead detail page', async ({ page }) => {
    // Click on the first lead's view button
    await page.getByRole('button', { name: 'View' }).first().click();
    
    // Check that the lead detail page loads correctly
    await expect(page.getByText('Lead Details')).toBeVisible();
    
    // Check that the tabs are displayed
    await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Tasks' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Notes' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'History' })).toBeVisible();
  });

  test('should create a new lead', async ({ page }) => {
    // Navigate to the new lead page
    await page.getByRole('link', { name: 'Add Lead' }).click();
    
    // Fill in the lead form
    await page.getByLabel('First Name *').fill('Test');
    await page.getByLabel('Last Name *').fill('User');
    await page.getByLabel('Email *').fill('test.user@example.com');
    await page.getByLabel('Phone').fill('555-123-4567');
    await page.getByLabel('Company').fill('Test Company');
    
    // Submit the form
    await page.getByRole('button', { name: 'Create Lead' }).click();
    
    // Check that we're redirected to the lead detail page
    await expect(page.getByText('Lead Details')).toBeVisible();
  });

  test('should display lead dashboard with analytics', async ({ page }) => {
    // Navigate to the lead dashboard
    await page.goto('https://crm7.vercel.app/leads/dashboard');
    
    // Check that the dashboard loads correctly
    await expect(page.getByText('Lead Dashboard')).toBeVisible();
    
    // Check for the overview metrics
    await expect(page.getByText('Total Leads')).toBeVisible();
    await expect(page.getByText('New Leads (This Week)')).toBeVisible();
    await expect(page.getByText('Conversion Rate')).toBeVisible();
    
    // Check for the charts
    await expect(page.getByText('Lead Status Distribution')).toBeVisible();
    await expect(page.getByText('Lead Source Distribution')).toBeVisible();
    await expect(page.getByText('Monthly Lead Trends')).toBeVisible();
  });
});
