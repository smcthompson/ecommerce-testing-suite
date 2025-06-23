import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = process.env.BASE_URL || 'https://localhost:8080';

// Helper function to create a unique username for each test
const generateUniqueUsername = () => `testUser_${uuidv4()}`;

test.describe('E-Commerce Site Tests', () => {
  let username: string;

  test.beforeEach(async ({ page, request }) => {
    // Generate a unique username for this test
    username = generateUniqueUsername();

    // Log in with the unique user
    await page.goto(BASE_URL);
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', '7357[U53R]');
    await page.click('button[type="submit"]');
    await page.waitForSelector('#product-list li');
  });

  // Clear cart
  test.afterEach(async ({ page }) => {
    const clearCartResponse = await page.request.post(`${BASE_URL}/cart/clear`);
    expect(clearCartResponse.status()).toBe(200);
    const responseBody = await clearCartResponse.json();
    expect(responseBody.message).toBe('Cart cleared successfully');
  });

  test('Product list loads', async ({ page }) => {
    const products = await page.$$('li');
    expect(products.length).toBeGreaterThan(0);
  });

  test('Cart navigation works', async ({ page }) => {
    await page.click('#go-to-cart');
    await page.waitForURL('**/cart');
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
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForURL('**/cart');
    await expect(page.locator('#cart-items li')).toContainText('Laptop - $999 (Qty: 1)');
    await expect(page.locator('#cart-items li')).toHaveCount(1);
  });
});
