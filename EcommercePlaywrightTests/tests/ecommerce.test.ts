import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = process.env.BASE_URL || 'https://localhost:8080';

// Helper function to create a unique username for each test
const generateUniqueUsername = () => `testUser_${uuidv4()}`;

test.describe('E-Commerce Site Tests', () => {

  test.beforeEach(async ({ page }) => {
    const response = await fetch(`${BASE_URL}/cart/clear`, {
      method: 'POST',
      headers: { 'X-Session-ID': sessionId },
    });
    const result = await response.json();
    if (response.status !== 200) {
      throw new Error(`Failed to clear cart: ${result.error || response.statusText}`);
    }
    await page.setExtraHTTPHeaders({ 'X-Session-ID': sessionId });
    await page.goto(`${BASE_URL}?session_id=${encodeURIComponent(sessionId)}`);
  let username; // Store the unique username for each test
    // Generate a unique username for this test
    username = generateUniqueUsername();

    // Log in with the unique user
    await page.goto(BASE_URL);
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', '7357[U53R]');
    await page.click('button[type="submit"]');
    await page.waitForSelector('#product-list li');
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
    const cartAddResponse = page.waitForResponse('**/cart/add');
    await page.waitForSelector('li:has-text("Laptop - $999") button', { state: 'visible' });
    await page.click('li:has-text("Laptop - $999") button');
    await cartAddResponse;
    await page.waitForURL('**/cart**');
    await expect(page.locator('#cart-items li')).toContainText('Laptop - $999 (Qty: 1)');
    await expect(page.locator('#cart-items li')).toHaveCount(1);
  });
});
