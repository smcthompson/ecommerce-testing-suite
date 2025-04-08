using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace EcommerceSeleniumTests
{
    public class Tests
    {
        private static IWebDriver driver;
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
        }

        [SetUp]
        public void Setup()
        {
            driver.Navigate().GoToUrl(BaseUrl);
        }

        [Test]
        public void TestProductListLoads()
        {
            var products = driver.FindElements(By.TagName("li"));
            Assert.That(products, Is.Not.Empty, "Product list should load");
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
