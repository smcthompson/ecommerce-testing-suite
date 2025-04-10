using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;

namespace EcommerceSeleniumTests
{
    public class Tests
    {
        private static IWebDriver driver;
        private WebDriverWait wait;
        private const string BaseUrl = "https://localhost:8080";

        [OneTimeSetUp]
        public void OneTimeSetup()
        {
            var options = new ChromeOptions();
            // Accept self-signed certificates
            options.AcceptInsecureCertificates = true;
            // Additional configuration to trust the specific certificate
            options.AddArgument("--ignore-certificate-errors");
            // Specify the certificate (optional, but helps with specific cert trust)
            string parentDir = Directory.GetParent(Directory.GetCurrentDirectory())!.Parent!.Parent!.Parent!.FullName;
            string certPath = Path.Combine(parentDir, "certs", "iis-localhost.crt");
            string keyPath = Path.Combine(parentDir, "certs", "iis-localhost.key");

            if (File.Exists(certPath) && File.Exists(keyPath))
            {
                // Note: ChromeOptions doesn't directly import certs like this, but we can ensure the browser trusts it
                options.AddArgument($"--ssl-key-log-file={keyPath}");
            }
            else
            {
                throw new FileNotFoundException("Certificate files not found in ./certs folder");
            }

            driver = new ChromeDriver(options);
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        }

        [SetUp]
        public void Setup()
        {
            driver.Navigate().GoToUrl(BaseUrl);
        }

        [Test]
        public void TestLoginFlow()
        {
            // Verify login page loads initially
            Assert.That(driver.PageSource, Does.Contain("login"), "Should load login page");

            // Perform login
            PerformLogin();

            // Wait for redirect and verify products page
            wait.Until(d => d.Url == BaseUrl + "/");
            Assert.That(driver.PageSource, Does.Contain("products"), "Should redirect to products page after login");
        }

        [Test]
        public void TestLogoutFlow()
        {
            // Login first
            PerformLogin();

            // Perform logout
            wait.Until(d => driver.FindElement(By.CssSelector("form[action='/logout'] button"))).Click();

            // Wait for redirect and verify login page
            wait.Until(d => d.PageSource.Contains("login"));
            Assert.That(driver.PageSource, Does.Contain("login"), "Should redirect to login page after logout");
        }

        [Test]
        public void TestProductListLoads()
        {
            // Perform login
            PerformLogin();
            
            // Find product listing and verify it's not empty
            var products = wait.Until(d => d.FindElements(By.CssSelector("#product-list"))).Count > 0;
            Assert.That(products, Is.True, "Product list should load and contain items");
        }

        [Test]
        public void TestAddToCart()
        {
            // Perform login
            PerformLogin();

            // Add item to cart
            wait.Until(d => d.FindElement(By.CssSelector("#product-list li button"))).Click();

           // Verify alert message for item added to cart
            IAlert alert = wait.Until(d => driver.SwitchTo().Alert());
            Assert.That(alert, Is.Not.Null);
            Assert.That(alert.Text, Does.Contain("Item added to cart"));
            alert.Accept();
        }

        [Test]
        public void TestCartNavigationAndContents()
        {
            // Perform login
            PerformLogin();

            // Navigate to cart
            wait.Until(d => driver.FindElement(By.LinkText("Go to Cart"))).Click();
            
            // Verify cart page
            wait.Until(d => d.Url.Contains("/cart"));
            Assert.That(driver.PageSource, Does.Contain("Cart Page"), "Should navigate to cart page");

            // Verify empty cart message
            var cartItems = driver.FindElements(By.CssSelector("#cart-items li"));
            Assert.That(cartItems[0].Text, Does.Contain("No items in cart"), "Cart should be empty initially");
        }

        [Test]
        public void TestClearCart()
        {
            // Perform login
            PerformLogin();
            
            // Add item to cart first
            wait.Until(d => d.FindElement(By.CssSelector("#product-list li button"))).Click();
            wait.Until(d => driver.SwitchTo().Alert()).Accept();
            
            // Go to cart and clear
            wait.Until(d => driver.FindElement(By.LinkText("Go to Cart"))).Click();
            wait.Until(d => driver.FindElement(By.Id("clear-cart-button"))).Click();

            // Verify cart is empty
            wait.Until(d => d.Url.Contains("/cart/clear"));
            Assert.That(driver.PageSource, Does.Contain("Cart cleared successfully"), "Should show cart cleared message");
        }

        private string generateUniqueUsername() => $"testUser_{Guid.NewGuid()}";

        private void PerformLogin()
        {
            // Create a new user with a randomly generated guid as the username
            wait.Until(d => driver.FindElement(By.Name("username"))).SendKeys(generateUniqueUsername());
            wait.Until(d => driver.FindElement(By.Name("password"))).SendKeys("7357[U53R]");
            wait.Until(d => driver.FindElement(By.CssSelector("button[type='submit']"))).Click();
            wait.Until(d => d.Url == BaseUrl + "/");
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
