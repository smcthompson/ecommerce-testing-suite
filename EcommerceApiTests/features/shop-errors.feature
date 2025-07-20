Feature: E-Commerce Shop Errors

  Background: API running
    Given the API is running

  Scenario: Add to cart with invalid token
    When I add products to the cart
    Then I should receive an error message

  Scenario: Add invalid product to cart
    When I am logged in
    And I add an invalid product to the cart
    Then I should receive an error message

  Scenario: Remove invalid product from cart
    When I am logged in
    And I remove an invalid product from the cart
    Then I should receive an error message
