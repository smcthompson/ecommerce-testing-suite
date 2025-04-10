Feature: E-Commerce API Endpoints

  Background: API running and user logged in
   Given the API is running
   And I am logged in

  Scenario: Retrieve product list with authentication
    When I request the product list
    Then I should receive a list of products
    And the list should contain 2 products

  Scenario: Access the cart page with no items
    And I clear the cart
    When I request the cart page
    Then I should receive the cart page
    And the cart page should contain no items

  Scenario: Add an item to the cart
    And I clear the cart
    When I add a product to the cart
    Then I should receive a success message
    When I request the cart page
    Then I should receive the cart page
    And the cart page should contain the added item

  Scenario: Clear the cart
    And I add a product to the cart
    When I clear the cart
    Then I should receive a cart cleared message
    When I request the cart page
    Then I should receive the cart page
    And the cart page should contain no items

  Scenario: Complete checkout
    When I request the checkout page
    Then I should receive a checkout confirmation

  Scenario: Access protected endpoint without authentication
    Given the API is running
    When I request the product list without logging in
    Then I should be redirected to login
