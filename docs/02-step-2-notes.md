# Step 2 Notes

## Project Phase 1: "Automated E-Commerce Testing Suite" (Continued)

### Step 2: Set Up Selenium Tests

**Objective**: Automate UI testing for your e-commerce mock site using Selenium WebDriver in C#.  
**Tools**: Visual Studio 2022, Selenium WebDriver.  
**Context**: Your site runs on `http://localhost:8080`, with IIS proxying API requests (e.g., `/products`) to Node.js on port 3000.  
**Steps**:

1. Open **Visual Studio 2022** on your ZenBook Duo. Use the dual screens: code editor on the top screen, Test Explorer on the bottom.
2. Create a new **NUnit Test Project** named `EcommerceSeleniumTests`:
   - In Visual Studio, go to **File** > **New** > **Project**.
   - Search for “NUnit Test Project” (under C#), select it, and name it `EcommerceSeleniumTests`.
   - Click **Create**.
3. Install the required Selenium packages:
   - Open the **NuGet Package Manager Console** (Tools > NuGet Package Manager > Package Manager Console).
   - Run the following commands:

     ```powershell
     Install-Package Selenium.WebDriver
     Install-Package Selenium.WebDriver.ChromeDriver
     ```

   - These install Selenium WebDriver and the ChromeDriver for browser automation.
4. Write a test in the default `Tests.cs` file to validate the e-commerce site:
   - Replace the contents of `Tests.cs` with the following code:

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
                 Assert.IsTrue(driver.PageSource.Contains("Cart Page"), "Should navigate to cart page");
             }

             [TearDown]
             public void TearDown()
             {
                 driver.Quit();
             }
         }
     }
     ```

   - **Explanation**:
     - `[SetUp]`: Initializes a new ChromeDriver instance before each test.
     - `TestProductListLoads`: Navigates to `http://localhost:8080`, checks if the product list (`<li>` elements) loads (expecting at least one product from the `/products` API proxied to port 3000).
     - `TestCartNavigation`: Navigates to the site, clicks the "Go to Cart" link (`/cart`), and verifies the cart page loads by checking for "Cart Page" (proxied to port 3000).
     - `[TearDown]`: Closes the browser after each test.
5. Run the tests:
   - Open the **Test Explorer** (View > Test Explorer, or Ctrl+E, T).
   - Ensure your Node.js app is running (`node app.js` on port 3000) and IIS is active (port 8080 with the updated `web.config`).
   - Click **Run All Tests** in Test Explorer (on the bottom screen).
   - Both tests should pass:
     - `TestProductListLoads` confirms the product list loads (via the proxied `/products` API).
     - `TestCartNavigation` confirms the cart link navigation works (via the proxied `/cart` route).

---

## Notes for This Step

- **Dual-Screen Workflow**: Use the top screen for coding in Visual Studio 2022 and the bottom screen for Test Explorer and browser output. This helps you monitor test results while debugging.
- **Prerequisites**: Ensure `http://localhost:8080` is accessible (which it is), with Node.js running on port 3000 to handle API requests. The `web.config` rewrite rule should proxy `/products` and `/cart` correctly.
- **Troubleshooting**:
  - If ChromeDriver fails to launch, ensure Google Chrome is installed and the ChromeDriver version matches (NuGet typically handles this).
  - If tests fail to find elements, inspect `index.html` in the browser (via Developer Tools, F12) to confirm `<li>` tags and the "Go to Cart" link are present. Check the Network tab for `/products` and `/cart` requests to ensure they’re hitting `http://localhost:3000`.
  - If tests fail due to timeouts, ensure Node.js is running and the rewrite rule is active.

---

## Updates for Blogging

I’ll include the following in the Phase 1 blog post to reflect your real-world setup:

- **IIS Configuration**: Mention the need to install `iisnode-full-v0.2.21-x64.msi`, `iis.net rewrite_amd64_en-US.msi`, and `iis.net requestRouter_amd64.msi` for Node.js integration and URL rewriting.
- **Port Setup**: Document the use of port 8080 for IIS and port 3000 for Node.js, with the `web.config` rewrite rule proxying API requests.
- **Troubleshooting**: Highlight the steps to fix the 404.4 error (default document, handler mappings) and the 401.3 error (adding `IUSR` permissions).
- **Code Adjustments**: Include the updated `web.config` and note the option to adjust `index.html` for direct fetching if needed.

---

## Next Steps After Step 2

Once the Selenium tests are running successfully:

1. Proceed to **Step 3: Set Up Playwright Tests** to add headless browser testing in TypeScript.
2. Continue with the remaining steps (Optimize and Benchmark, Push to GitHub).
3. Draft the **Phase 1 blog post** incorporating the updates you’ve provided.

Let me know how the Selenium tests go—do they pass? If you encounter issues (e.g., test failures, setup errors), share the details (screenshots, error messages, or Developer Tools output), and I’ll assist. Once this step is complete, we’ll move to the next phase of your project. You’re crushing it—let’s automate those tests!

## Final Question

selenium tests passed!  I did have to tweak a few things:

- there was an unnecessary `using` statement
- the assertions were updated per NUnit suggestions
- the `[TearDown]` needed a `driver.Dispose();` per NUnit suggestions

Now let's proceed to Step 3!

## Final Response

Fantastic—congratulations on getting the Selenium tests to pass! It’s great that you identified and tweaked those details:

- Removing an unnecessary `using` statement to keep the code clean.
- Updating assertions based on NUnit suggestions for better reliability.
- Adding `driver.Dispose();` in `[TearDown]` per NUnit recommendations to properly clean up resources.

I’ll incorporate these refinements into the documentation for the Phase 1 blog post to reflect your real-world adjustments. Now, let’s proceed to **Step 3: Set Up Playwright Tests** in your "Automated E-Commerce Testing Suite" project. This step will introduce headless browser testing using Playwright in TypeScript, complementing your Selenium setup. Here are the instructions tailored to your current environment (IIS on port 8080 proxying to Node.js on port 3000).
