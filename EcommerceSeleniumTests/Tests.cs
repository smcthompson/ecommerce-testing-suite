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
