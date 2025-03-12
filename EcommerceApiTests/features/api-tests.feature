Feature: E-Commerce API Endpoints

  Scenario: Retrieve product list
    Given the API is running
    When I request the product list
    Then I should receive a list of products
    And the list should contain 2 products

  Scenario: Access the cart page
    Given the API is running
    When I request the cart page
    Then I should receive the cart page
    And the cart page should contain cart items

  Scenario: Complete checkout
    Given the API is running
    When I request the checkout page
    Then I should receive a checkout confirmation
