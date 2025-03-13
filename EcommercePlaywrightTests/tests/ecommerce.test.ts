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
    await page.click('#go-to-cart');
    await page.waitForURL('**/cart**');
    await expect(page.locator('h1')).toHaveText('Cart Page');
    await expect(page.locator('#cart-items li')).toContainText('No items in cart');
    await expect(page.locator('#checkout-button')).toBeVisible();
    await expect(page.locator('text=Back to Products')).toBeVisible();
  });

  test('Add item to cart', async ({ page }) => {
    // Click the "Add to Cart" button for the first product (Laptop)
    await page.click('li:has-text("Laptop - $999") button');
    // Navigate to cart
    await page.click('#go-to-cart');
    await page.waitForURL('**/cart**');
    // Verify the cart contains the added item
    await expect(page.locator('#cart-items li')).toContainText('Laptop - $999');
    await expect(page.locator('#cart-items li')).toHaveCount(1);
  });
});
