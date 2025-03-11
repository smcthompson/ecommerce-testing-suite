# Step 4 Notes

## Project Phase 1: "Automated E-Commerce Testing Suite" (Continued)

### Step 4: Optimize and Benchmark

**Objective**: Optimize the performance of your e-commerce mock site and benchmark the execution times of your Selenium and Playwright tests to establish a baseline for future improvements.  
**Tools**: Node.js, Visual Studio 2022 (for Selenium), Visual Studio Code (for Playwright), Chrome DevTools, and `autocannon` for load testing.  
**Context**: Your site runs on `http://localhost:8080` (IIS) proxying API requests to Node.js on port 3000. Selenium tests are in `EcommerceSeleniumTests`, and Playwright tests are in `EcommercePlaywrightTests`.  
**Steps**:

1. **Optimize the Node.js Server**:
   - **Enable Compression**:
     - Install the `compression` middleware to reduce response sizes for faster page loads.
     - In the `EcommercePlaywrightTests` directory, run:

       ```bash
       npm install compression
       ```

     - Update `app.js` to use compression:

       ```javascript
       const express = require('express');
       const compression = require('compression');
       const app = express();
       const port = 3000;

       app.use(compression()); // Enable compression for all responses
       app.use(express.static('public'));

       // Mock product data
       const products = [
         { id: 1, name: 'Laptop', price: 999 },
         { id: 2, name: 'Mouse', price: 29 },
       ];

       app.get('/products', (req, res) => res.json(products));
       app.get('/cart', (req, res) => res.send('Cart Page'));
       app.get('/checkout', (req, res) => res.send('Checkout Complete'));

       app.listen(port, () => console.log(`Running on http://localhost:${port}`));
       ```

   - **Restart Node.js**:
     - Stop the server (Ctrl+C) and run `node app.js`.
   - **Test**:
     - Open `http://localhost:8080` in Chrome.
     - Press F12 to open DevTools, go to the Network tab, and refresh the page.
     - Check the `/products` request’s "Content-Encoding" header—it should be `gzip`, indicating compression is working.

2. **Optimize Selenium Tests**:
   - **Reuse Browser Instance**:
     - Modify `Tests.cs` to reuse the ChromeDriver instance across tests, reducing setup/teardown overhead.
     - Update `EcommerceSeleniumTests\Tests.cs`:

       ```csharp
       using NUnit.Framework;
       using OpenQA.Selenium;
       using OpenQA.Selenium.Chrome;

       namespace EcommerceSeleniumTests
       {
           public class Tests
           {
               private static IWebDriver driver;

               [OneTimeSetUp]
               public void OneTimeSetup()
               {
                   driver = new ChromeDriver();
               }

               [SetUp]
               public void Setup()
               {
                   driver.Navigate().GoToUrl("http://localhost:8080");
               }

               [Test]
               public void TestProductListLoads()
               {
                   var products = driver.FindElements(By.TagName("li"));
                   Assert.That(products.Count, Is.GreaterThan(0), "Product list should load");
               }

               [Test]
               public void TestCartNavigation()
               {
                   driver.FindElement(By.LinkText("Go to Cart")).Click();
                   Assert.That(driver.PageSource, Does.Contain("Cart Page"), "Should navigate to cart page");
               }

               [TearDown]
               public void TearDown()
               {
                   // Optional: Clear cookies or reset state if needed
               }

               [OneTimeTearDown]
               public void OneTimeTearDown()
               {
                   driver.Quit();
                   driver.Dispose();
               }
           }
       }
       ```

     - **Changes**:
       - Moved `driver` initialization to `[OneTimeSetUp]` and cleanup to `[OneTimeTearDown]`, so the browser launches once for all tests.
       - Kept `[SetUp]` to navigate to the base URL before each test.
       - Removed per-test cleanup in `[TearDown]` since the browser is reused.

3. **Benchmark Selenium Tests**:
   - **Run with Timing**:
     - Open Visual Studio 2022.
     - In the Test Explorer, select both tests (`TestProductListLoads`, `TestCartNavigation`).
     - Run the tests and note the execution time (displayed in Test Explorer).
     - Expect a reduction in total time due to browser reuse (previously ~5-10 seconds with per-test setup, now likely ~2-5 seconds).
   - **Log Results**:
     - Record the total execution time for future comparison.

4. **Optimize Playwright Tests**:
   - **Enable Parallel Execution**:
     - The `playwright.config.ts` already has `fullyParallel: true`, so tests run in parallel across browsers. No changes needed here.
   - **Reduce Overhead**:
     - Remove the `afterEach` hook since Playwright automatically closes pages between tests in headless mode.
     - Update `EcommercePlaywrightTests\tests\ecommerce.test.ts`:

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
           await page.waitForURL('**/cart');
           const pageContent = await page.evaluate(() => document.body?.innerText || document.documentElement.innerText);
           expect(pageContent).toMatch(/Cart Page/);
         });
       });
       ```

     - **Changes**:
       - Removed `test.afterEach` since Playwright handles page cleanup automatically.

5. **Benchmark Playwright Tests**:
   - **Run with Timing**:
     - In the `EcommercePlaywrightTests` directory, run:

       ```bash
       npx playwright test --reporter=line
       ```

     - The `line` reporter shows execution times for each test.
     - Expect ~2-5 seconds total across all browsers (Chromium, Firefox, WebKit) due to parallel execution.
   - **Log Results**:
     - Record the total execution time for future comparison.

6. **Load Test the Node.js Server**:
   - **Install `autocannon`**:
     - In the `EcommercePlaywrightTests` directory, run:

       ```bash
       npm install autocannon
       ```

   - **Create a Load Test Script**:
     - Create `load-test.js` in `EcommercePlaywrightTests`:

       ```javascript
       const autocannon = require('autocannon');

       const instance = autocannon({
         url: 'http://localhost:8080',
         connections: 10,
         duration: 10,
         requests: [
           { method: 'GET', path: '/' },
           { method: 'GET', path: '/products' },
           { method: 'GET', path: '/cart' },
         ],
       }, (err, result) => {
         if (err) console.error(err);
         console.log(result);
       });

       instance.on('start', () => console.log('Load test started'));
       instance.on('done', (result) => console.log('Load test completed:', result));
       ```

   - **Run the Load Test**:
     - Ensure Node.js (`node app.js`) and IIS are running.
     - Run:

       ```bash
       node load-test.js
       ```

     - Review the output for:
       - **Requests per second (RPS)**: Expect ~100-500 RPS on your local machine.
       - **Latency**: Average response time (e.g., ~10-50ms).
     - **Log Results**:
       - Record RPS and latency for future comparison.

---

## Notes for This Step

- **Performance Goals**:
  - Selenium: Reduce setup/teardown overhead by reusing the browser.
  - Playwright: Leverage parallel execution to minimize test time.
  - Node.js: Use compression to improve response times under load.
- **Troubleshooting**:
  - If Selenium tests are slower than expected, ensure ChromeDriver is up to date (`Install-Package Selenium.WebDriver.ChromeDriver -Force` in NuGet).
  - If Playwright tests fail, check Node.js and IIS logs for errors.
  - If `autocannon` reports high latency, investigate Node.js performance (e.g., slow database mocks, inefficient routes).

---

## Updates for Blogging

I’ll include in the Phase 1 blog post:

- **Playwright Test Adjustment**: Note the decision to keep `/cart` as bare text for now, with a plan to refactor tests when UI elements are added.
- **Selenium Optimizations**: Highlight browser reuse and updated assertions.
- **Performance Metrics**: Include benchmark results for Selenium, Playwright, and Node.js load tests.
- Previous updates (IIS modules, port 3000, Playwright `toHaveText` correction).

---

## Next Steps After Step 4

Once optimization and benchmarking are complete:

1. Proceed to **Step 5: Push to GitHub** to version control your project.
2. Draft the **Phase 1 blog post** with all updates and refinements.

Let me know how the optimization and benchmarking go—share the execution times for Selenium and Playwright, as well as the `autocannon` results. If you encounter any issues, provide the details, and I’ll assist. You’re almost at the finish line for Phase 1—great work!
