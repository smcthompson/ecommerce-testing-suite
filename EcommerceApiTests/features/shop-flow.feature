Feature: E-Commerce Shop Flow

  Background: API running and user logged in
    Given the API is running
    And I am logged in

  Scenario: Retrieve product list
    When I request the product list
    Then I should receive a list of 2 products

  Scenario: Add an item to the cart
    When I add products to the cart
    Then I should receive a success message

  Scenario: Request the cart list
    When I add products to the cart
    And I request the cart list
    Then I should receive a list of cart items
    And the cart should contain 2 products

  Scenario: Remove an item from the cart
    When I add products to the cart
    And I remove a product from the cart
    Then I should receive a success message
    When I request the cart list
    Then the cart should contain 1 products

  Scenario: Clear the cart
    When I add products to the cart
    And I clear the cart
    Then I should receive a success message
    When I request the cart list
    Then the cart should be empty

  Scenario: Complete Checkout
    When I check out
    Then I should receive a success message
