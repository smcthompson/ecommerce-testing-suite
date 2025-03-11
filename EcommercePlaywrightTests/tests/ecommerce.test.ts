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
    const pageContent = await page.evaluate(() => document.documentElement.innerText);
    expect(pageContent).toMatch(/Cart Page/);
  });
});
