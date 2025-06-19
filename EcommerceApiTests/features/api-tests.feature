Feature: E-Commerce API Endpoints

  Background: API running and user logged in
    Given the API is running
    And I am logged in

  Scenario: Retrieve product list with authentication
    When I request the product list
    Then I should receive a list of products
    And the list should contain 2 products

  Scenario: Access the cart page with no items
    When I clear the cart
    And I request the cart page
    Then I should receive the cart page
    When I request the cart list
    Then the cart should be empty

  Scenario: Access the cart page with cookies
    Given the API is running
    And I am logged in via HTML form
    When I request the cart page with cookies
    Then I should receive the cart page
    When I request the cart list
    Then the cart should be empty

  Scenario: Add an item to the cart
    When I clear the cart
    And I add a product to the cart
    Then I should receive a success message
    Then I should receive the cart page
    When I request the cart list
    Then I should receive a list of cart items

  Scenario: Clear the cart
    When I add a product to the cart
    And I clear the cart
    Then I should receive a cart cleared message
    Then I should receive the cart page
    When I request the cart list
    Then the cart should be empty

  Scenario: Complete checkout
    When I request the checkout page
    Then I should receive a checkout confirmation

  Scenario: Retrieve cart list
    When I clear the cart
    And I add a product to the cart
    And I request the cart list
    Then I should receive a list of cart items

  Scenario: Logout clears session
    Given the API is running
    And I am logged in via HTML form
    When I logout
    Then I should be logged out
  Scenario: Access protected endpoint without authentication
    Given the API is running
    When I request the product list without logging in
    Then I should receive the login page
