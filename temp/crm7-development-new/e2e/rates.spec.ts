// Updated e2e test file with proper type comparisons

import { test, expect } from '@playwright/test';

test.describe('Rate Management Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Set up test data and authenticate
    await page.goto('/rates');
  });

  test('calculates rate using template', async ({ page }) => {
    // Select rate template
    await page.selectOption('[data-testid="template-select"]', { label: 'Standard Rate' });

    // Enter base rate
    await page.fill('[data-testid="base-rate-input"]', '100');

    // Click calculate
    await page.click('[data-testid="calculate-button"]');

    // Verify calculation result
    const finalRate = await page.textContent('[data-testid="final-rate"]');
    expect(parseFloat(finalRate ?? '0')).toBeGreaterThan(0);
  });

  test('displays rate analytics dashboard', async ({ page }) => {
    await page.goto('/rates/analytics');

    // Check for charts
    await expect(page.locator('[data-testid="rate-forecast-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="actual-rates-chart"]')).toBeVisible();

    // Change date range
    await page.click('[data-testid="date-range-picker"]');
    await page.click('text=Last 7 Days');

    // Verify charts update
    await expect(page.locator('[data-testid="rate-forecast-chart"]')).toBeVisible();
  });

  test('approves rate template', async ({ page }) => {
    await page.goto('/rates/templates');

    // Create new template
    await page.click('[data-testid="new-template-button"]');
    await page.fill('[data-testid="template-name"]', 'Test Template');
    await page.fill('[data-testid="base-rate"]', '100');
    await page.click('[data-testid="save-template"]');

    // Submit for approval
    await page.click('[data-testid="submit-approval"]');

    // Verify template status
    const status = await page.textContent('[data-testid="template-status"]');
    expect(status).toBe('Pending Approval');
  });

  test('compares rates across templates', async ({ page }) => {
    await page.goto('/rates/compare');

    // Select templates to compare
    await page.selectOption('[data-testid="template-1"]', { label: 'Standard Rate' });
    await page.selectOption('[data-testid="template-2"]', { label: 'Premium Rate' });

    // Enter base rate
    await page.fill('[data-testid="comparison-base-rate"]', '100');

    // Compare rates
    await page.click('[data-testid="compare-button"]');

    // Verify comparison results
    const comparison = page.locator('[data-testid="comparison-results"]');
    await expect(comparison).toBeVisible();

    // Check difference calculation
    const difference = await page.textContent('[data-testid="rate-difference"]');
    expect(parseFloat(difference ?? '0')).not.toBe(0);
  });
});
