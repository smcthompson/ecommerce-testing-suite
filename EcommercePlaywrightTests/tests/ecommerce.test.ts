import { test, expect } from '@playwright/test';

test.describe('E-Commerce Site Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('Product list loads', async ({ page }) => {
    const products = await page.$$('li');
    expect(products.length).toBeGreaterThan(0);
  });

  test('Cart navigation works', async ({ page }) => {
    await page.click('text=Go to Cart');
    await page.waitForURL('**/cart');
    // Verify cart page elements
    await expect(page.locator('h1')).toHaveText('Cart Page');
    await expect(page.locator('#cart-items li')).toHaveCount(2);
    await expect(page.locator('#checkout-button')).toBeVisible();
    await expect(page.locator('text=Back to Products')).toBeVisible();
  });
});
