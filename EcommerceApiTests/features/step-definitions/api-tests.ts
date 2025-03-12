import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { expect } from 'chai';

const baseUrl = 'http://localhost:8080';

Given('the API is running', async function () {
  // Ensure the server is running (assumed to be up for tests)
  const res = await request(baseUrl).get('/');
  expect(res.status).to.equal(200);
});

When('I request the product list', async function () {
  this.response = await request(baseUrl).get('/products');
});

Then('I should receive a list of products', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body).to.be.an('array');
});

Then('the list should contain {int} products', function (count: number) {
  expect(this.response.body).to.have.lengthOf(count);
});

When('I request the cart page', async function () {
  this.response = await request(baseUrl).get('/cart');
});

Then('I should receive the cart page', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.text).to.include('Cart Page');
});

Then('the cart page should contain cart items', function () {
  expect(this.response.text).to.include('Laptop - $999');
  expect(this.response.text).to.include('Mouse - $29');
});

When('I request the checkout page', async function () {
  this.response = await request(baseUrl).get('/checkout');
});

Then('I should receive a checkout confirmation', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.text).to.include('Checkout Complete');
});
