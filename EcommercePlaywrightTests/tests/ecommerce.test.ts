import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = process.env.BASE_URL || 'https://localhost:8080';

// Helper function to create a unique username for each test
const generateUniqueUsername = () => `testUser_${uuidv4()}`;

test.describe('E-Commerce Site Tests', () => {
  let username: string;

    // Generate a unique username for this test
  test.beforeEach(async ({ page }) => {
    username = generateUniqueUsername();

    // Log in with the unique user
    await page.goto(BASE_URL);
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', '7357[U53R]');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`);
    await page.waitForSelector('#product-list li', { state: 'visible' });
    const items = await page.locator('#product-list li').count();
    expect(items).toBeGreaterThan(0);
  });

  // Clear cart
  test.afterEach(async ({ page }) => {
    try {
      await page.waitForLoadState('networkidle');

      const logoutButton = page.locator('form#logout button');
      const isVisible = await logoutButton.isVisible().catch(() => false);

      if (isVisible) {
        await logoutButton.click();
        await page.waitForURL(`${BASE_URL}/`);
      }

      // Cleanup: clear cookies and local/session storage
      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch (e) {
    }
  });

  test('Login sets cookie and token', async ({ page }) => {
    // Wait until sessionStorage has the jwt token (handles async token injection)
    await page.waitForFunction(() => sessionStorage.getItem('jwt') !== null);

    // Wait until the page has finished loading and is stable
    await page.waitForLoadState('domcontentloaded');

    // Wait for a stable element post-login (replace selector with something meaningful)
    await page.waitForSelector('#logout'); // Adjust as needed

    // Verify the jwt cookie
    const cookies = await page.context().cookies();
    const jwtCookie = cookies.find(cookie => cookie.name === 'jwt');
    expect(jwtCookie).toBeDefined();
    expect(jwtCookie?.value).toBeTruthy();

    // Now it's safe to evaluate in the browser context
    const token = await page.evaluate(() => sessionStorage.getItem('jwt'));
    expect(token).toBeTruthy();
    expect(token).toEqual(jwtCookie?.value);
  });

  test('Product list loads', async ({ page }) => {
    await expect(page.locator('#product-list li')).toHaveCount(2);
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
