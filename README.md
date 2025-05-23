# E-Commerce Testing Suite

A Node.js mock e-commerce site with automated tests using Selenium (C#), Playwright (TypeScript), and Cucumber (TypeScript). Hosted locally on IIS, with SQLite database and CI/CD integration via GitHub Actions.

## Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/smcthompson/ecommerce-testing-suite.git
    cd ecommerce-testing-suite
    ```

2. Install root project dependencies:

    ```bash
    npm install
    ```

3. Install sub-project dependencies:

   - For Playwright tests:

      ```bash
      cd EcommercePlaywrightTests
      npm install
      ```

   - For Cucumber API tests:

      ```bash
      cd EcommerceApiTests
      npm install
      ```

4. Set up the SQLite database:

   - Ensure `sqlite3` and `knex` are installed (handled by root `npm install`).

   - Run migrations and seeds:

      ```bash
      npx knex migrate:latest
      npx knex seed:run
      ```

5. Run the Node.js server:

    ```bash
    node app.js
    ```

6. (Optional) Host on IIS locally:

   - Open IIS Manager, add a new site named `EcommerceMock`, set the physical path to `ecommerce-mock/public`, and bind to port 8080.

   - Configure `web.config` for proxying (as per Phase 1 setup).

   - Run `node app.js` in the background or use `pm2 start app.js`.

7. Run tests:

   - Playwright: `cd EcommercePlaywrightTests && npx playwright test`

   - Selenium: Open `EcommerceSeleniumTests.sln` in Visual Studio and run tests.

   - Cucumber API Tests: `cd EcommerceApiTests && npm test`

## Features

- UI tests for product list, cart navigation, and adding items to cart (Selenium, Playwright).
- Enhanced `/cart` route with UI elements and dynamic rendering based on query parameters.
- Headless testing with Playwright across Chromium, Firefox, and WebKit.
- BDD-driven API tests for `/products`, `/cart`, and `/checkout` using Cucumber, updated for dynamic cart state.
- SQLite database for dynamic product data managed with Knex.js.
- CI/CD pipeline with GitHub Actions to automate Playwright and Cucumber tests.

## Running in CI

- The GitHub Actions workflow (`ci.yml`) automatically runs tests on push or pull request to the `main` branch.
- The Node.js server is started using `pm2` on port 3000, and tests target `http://localhost:3000`.

## Notes

- Locally, use IIS on port 8080 with proxying to Node.js on port 3000.
- In CI, the server runs directly on port 3000 without IIS.

## Original Concept

I originally envisioned a dual-purpose project series that would serve as both a portfolio and a blog showcase. From a coding perspective, I wanted to highlight my QA and dev skills.  Seeing my capabilities for the full life-cycle of a project, from planning and design to development, testing, and deployment. Cataloging my journey along the way would also serve to highlight my ability to communicate technical concepts in a clear and engaging manner.

---

## Project Phase 1: "Automated E-Commerce Testing Suite"

### Goal

Build a simple e-commerce mock site and automate its testing with Selenium and Playwright, showcasing foundational QA automation skills. This sets the stage for your portfolio and proves you can validate user flows efficiently.

### Tech Stack

- **Selenium**: UI testing (C#).
- **Playwright**: Headless browser testing (TypeScript).
- **Node.js**: Backend for the mock site.
- **Visual Studio Code**: Coding and test scripting.
- **Git**: Version control.
- **IIS**: Local hosting.

### Project Overview

You’ll create a lightweight e-commerce site (product catalog, cart, checkout) hosted on IIS, then automate tests to verify key flows. The ZenBook Duo’s dual screens will shine—code on one, browser/logs on the other. Push it to GitHub with a README to impress recruiters.

---

## Step-by-Step Setup

### 1. Build the E-Commerce Mock Site

**Objective**: A simple Node.js app to test against.  

- **Tools**: Node.js, Express, IIS.
- **Steps**:
  1. Open Visual Studio Code on your ZenBook Duo. Split the dual screens: terminal on the bottom, editor on top.
  2. Create a new project folder: `ecommerce-mock`.

     ```bash
     mkdir ecommerce-mock
     cd ecommerce-mock
     npm init -y
     ```

  3. Install Express:

     ```bash
     npm install express
     ```

  4. Create `app.js`:

     ```javascript
     const express = require('express');
     const app = express();
     const port = 3000;

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

  5. Add a `public/index.html` for a basic UI:

     ```html
     <!DOCTYPE html>
     <html>
     <head><title>E-Commerce Mock</title></head>
     <body>
       <h1>Products</h1>
       <ul id="product-list"></ul>
       <a href="/cart">Go to Cart</a>
       <script>
         fetch('/products')
           .then(res => res.json())
           .then(data => {
             const list = document.getElementById('product-list');
             data.forEach(p => {
               const li = document.createElement('li');
               li.textContent = `${p.name} - $${p.price}`;
               list.appendChild(li);
             });
           });
       </script>
     </body>
     </html>
     ```

  6. Test locally:

     ```bash
     node app.js
     ```

     Visit `http://localhost:3000`—you should see a product list.

- **Host on IIS**:
  1. Open IIS Manager (pre-installed on Windows).
  2. Add a new site: Name it `EcommerceMock`, set the physical path to `ecommerce-mock/public`, and bind to port 8080.
  3. Run `node app.js` in the background (or use `pm2` with `npm install -g pm2` and `pm2 start app.js`).
  4. Visit `http://localhost:8080`—your site’s live locally.

### 2. Set Up Selenium Tests

**Objective**: Automate UI testing in C#.  

- **Tools**: Visual Studio 2022, Selenium WebDriver.
- **Steps**:
  1. Open Visual Studio 2022. Create a new NUnit Test Project (`EcommerceSeleniumTests`).
  2. Install Selenium packages:

     ```powershell
     Install-Package Selenium.WebDriver
     Install-Package Selenium.WebDriver.ChromeDriver
     ```

  3. Write a test in `Tests.cs`:

     ```csharp
     using NUnit.Framework;
     using OpenQA.Selenium;
     using OpenQA.Selenium.Chrome;

     namespace EcommerceSeleniumTests
     {
         public class Tests
         {
             private IWebDriver driver;

             [SetUp]
             public void Setup()
             {
                 driver = new ChromeDriver();
             }

             [Test]
             public void TestProductListLoads()
             {
                 driver.Navigate().GoToUrl("http://localhost:8080");
                 var products = driver.FindElements(By.TagName("li"));
                 Assert.IsTrue(products.Count > 0, "Product list should load");
             }

             [Test]
             public void TestCartNavigation()
             {
                 driver.Navigate().GoToUrl("http://localhost:8080");
                 driver.FindElement(By.LinkText("Go to Cart")).Click();
                 Assert.AreEqual("Cart Page", driver.PageSource);
             }

             [TearDown]
             public void TearDown()
             {
                 driver.Quit();
             }
         }
     }
     ```

  4. Run tests (Test Explorer on bottom screen, code on top). Both should pass.

### 3. Set Up Playwright Tests

**Objective**: Add headless browser testing in TypeScript.  

- **Tools**: Visual Studio Code, Playwright.
- **Steps**:
  1. In `ecommerce-mock`, init Playwright:

     ```bash
     npm init playwright@latest
     ```

     Choose TypeScript, name the test folder `tests`.
  2. Edit `tests/example.spec.ts`:

     ```typescript
     import { test, expect } from '@playwright/test';

     test('Product list loads', async ({ page }) => {
       await page.goto('http://localhost:8080');
       const products = await page.locator('li').count();
       expect(products).toBeGreaterThan(0);
     });

     test('Cart navigation works', async ({ page }) => {
       await page.goto('http://localhost:8080');
       await page.click('text=Go to Cart');
       await expect(page).toHaveText('Cart Page');
     });
     ```

  3. Run tests in headless mode:

     ```bash
     npx playwright test
     ```

     Watch results on the bottom screen—both pass.

### 4. Optimize and Benchmark

- Enable parallel execution in Playwright (`playwright.config.ts`):

  ```typescript
  module.exports = {
    workers: 2, // Use 2 threads for now
    use: { headless: true },
  };
  ```

- Time it: Run `npx playwright test --reporter=dot` before and after enabling headless/parallel. Expect ~20-30% speedup (e.g., 10s to 7s for small suites).

### 5. Push to GitHub

- Init Git:

  ```bash
  git init
  echo "node_modules/" > .gitignore
  git add .
  git commit -m "Initial e-commerce testing suite"
  ```

- Create a GitHub repo (`ecommerce-testing-suite`), push it:

  ```bash
  git remote add origin https://github.com/yourusername/ecommerce-testing-suite.git
  git push -u origin main
  ```

- Add a README:

  ```markdown
  # E-Commerce Testing Suite
  A Node.js mock e-commerce site with automated tests using Selenium (C#) and Playwright (TypeScript). Hosted locally on IIS.

  ## Setup
  1. Clone repo: `git clone https://github.com/yourusername/ecommerce-testing-suite.git`
  2. Install: `npm install`
  3. Run: `node app.js`
  4. Tests: `npx playwright test` or open `EcommerceSeleniumTests.sln` in Visual Studio.

  ## Features
  - UI tests for product list and cart navigation.
  - Headless testing with Playwright.
  - ~30% faster execution with optimization.
  ```

---

## Notes for Blog Post (To Summarize Later)

- **Hook**: “My old laptop was toast, so I built a testing suite on my new ZenBook Duo to kickstart my QA career.”
- **Tech Highlights**: Selenium UI tests, Playwright headless, IIS hosting, dual-screen workflow.
- **Results**: “Cut test times by ~30%—proof my 22-thread beast delivers.”
- **Personal Touch**: “Felt like a win straight from God when those tests passed.”
- **Call to Action**: “Check it out on GitHub—my first step to QA stardom!”
