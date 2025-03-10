# Step 3 Notes

## Project Phase 1: "Automated E-Commerce Testing Suite" (Continued)

### Step 3: Set Up Playwright Tests

**Objective**: Implement headless browser testing for your e-commerce mock site using Playwright in TypeScript to ensure cross-browser compatibility and performance.  
**Tools**: Visual Studio Code, Playwright, Node.js, TypeScript.  
**Context**: Your site is accessible at `http://localhost:8080`, with IIS proxying API requests (e.g., `/products`) to Node.js on port 3000.  
**Steps**:

1. **Set Up a New TypeScript Project**:
   - Open **Visual Studio Code** on your ZenBook Duo. Use the top screen for coding and the bottom screen for terminal output.
   - Create a new directory for Playwright tests:
     - Open a terminal (Ctrl+`) and run:

       ```bash
       mkdir EcommercePlaywrightTests
       cd EcommercePlaywrightTests
       ```

   - Initialize a Node.js project:

     ```bash
     npm init -y
     ```

   - Install TypeScript and Playwright:

     ```bash
     npm install --save-dev typescript @types/node
     npm install --save-dev @playwright/test
     ```

   - Initialize TypeScript:

     ```bash
     npx tsc --init
     ```

     - This creates a `tsconfig.json` file. Edit it to include:

       ```json
       {
         "compilerOptions": {
           "target": "ES2020",
           "module": "commonjs",
           "outDir": "./dist",
           "rootDir": "./tests",
           "strict": true,
           "esModuleInterop": true
         },
         "include": ["tests/**/*"],
         "exclude": ["node_modules"]
       }
       ```

2. **Create Test Directory and Files**:
   - Create a `tests` directory:

     ```bash
     mkdir tests
     ```

   - Create a file named `ecommerce.test.ts` in the `tests` directory with the following content:

     ```typescript
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
         await expect(page).toHaveText('body', /Cart Page/);
       });

       test.afterEach(async ({ page }) => {
         await page.close();
       });
     });
     ```

   - **Explanation**:
     - `test.beforeEach`: Navigates to `http://localhost:8080` before each test.
     - `Product list loads`: Checks for `<li>` elements (product list from `/products` API).
     - `Cart navigation works`: Clicks the "Go to Cart" link and verifies "Cart Page" appears.
     - `test.afterEach`: Closes the page after each test.

3. **Configure Playwright**:
   - Create a `playwright.config.ts` file in the `EcommercePlaywrightTests` root directory:

     ```typescript
     import { defineConfig } from '@playwright/test';

     export default defineConfig({
       testDir: './tests',
       fullyParallel: true,
       projects: [
         {
           name: 'Chromium',
           use: { browserName: 'chromium' },
         },
         {
           name: 'Firefox',
           use: { browserName: 'firefox' },
         },
         {
           name: 'WebKit',
           use: { browserName: 'webkit' },
         },
       ],
       use: {
         headless: true,
         viewport: { width: 1280, height: 720 },
       },
       timeout: 30000,
     });
     ```

   - **Explanation**:
     - Tests run in parallel across Chromium, Firefox, and WebKit (Safari).
     - `headless: true` enables headless mode for faster execution.
     - `timeout: 30000` sets a 30-second timeout per test.

4. **Run the Tests**:
   - Ensure your Node.js server is running (`node app.js` on port 3000) and IIS is active (port 8080 with the updated `web.config`).
   - In the terminal, run:

     ```bash
     npx playwright install
     npx playwright test
     ```

   - This installs the Playwright browsers and executes the tests.
   - Check the terminal output on the bottom screen for results. All tests should pass across all browsers.

---

## Notes for This Step

- **Dual-Screen Workflow**: Use the top screen for editing `ecommerce.test.ts` and `playwright.config.ts` in Visual Studio Code, and the bottom screen for terminal output to monitor test runs.
- **Prerequisites**: Ensure `http://localhost:8080` is accessible, with Node.js on port 3000 handling API requests. The `web.config` rewrite rule should proxy `/products` and `/cart` correctly.
- **Troubleshooting**:
  - If tests fail to start, ensure Playwright browsers are installed (`npx playwright install --with-deps` if needed).
  - If `Product list loads` fails, verify the `/products` API response in the browser (Developer Tools, Network tab) and ensure the rewrite rule is working.
  - If `Cart navigation works` fails, check the "Go to Cart" link text in `index.html` and the `/cart` route in `app.js`.
  - If timeouts occur, increase the `timeout` value in `playwright.config.ts` or ensure Node.js is responsive.

---

## Updates for Blogging

I’ll include the following in the Phase 1 blog post, building on your previous feedback:

- **IIS Setup**: Document the installation of `iisnode-full-v0.2.21-x64.msi`, `iis.net rewrite_amd64_en-US.msi`, and `iis.net requestRouter_amd64.msi` for Node.js integration and URL rewriting.
- **Port Configuration**: Note the use of port 8080 for IIS and port 3000 for Node.js, with the refined `web.config` rewrite rule.
- **Troubleshooting**: Include fixes for 404.4 (default document, handler mappings) and 401.3 (adding `IUSR` permissions).
- **Selenium Adjustments**: Reflect the removal of an unnecessary `using` statement, updated NUnit assertions, and adding `driver.Dispose();` in `[TearDown]`.
- **Playwright Setup**: Add this step with the current instructions.

---

## Next Steps After Step 3

Once the Playwright tests are running successfully:

1. Proceed to **Step 4: Optimize and Benchmark** to improve performance and measure test execution times.
2. Move to **Step 5: Push to GitHub** to version control your project.
3. Draft the **Phase 1 blog post** with all updates and refinements.

Let me know how the Playwright tests go—do they pass across all browsers? If you run into issues (e.g., test failures, setup errors), share the details (terminal output, screenshots, or Developer Tools data), and I’ll help troubleshoot. You’re doing amazing work—let’s keep the momentum going!
