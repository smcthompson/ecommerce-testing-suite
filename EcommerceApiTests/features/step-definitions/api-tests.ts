import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { expect } from 'chai';

const baseUrl = process.env.BASE_URL || 'http://localhost:8080';

Given('the API is running', async function () {
  const res = await request(baseUrl).get('/');
  expect(res.status).to.equal(200);
});

Given('I set a session ID', function () {
  this.sessionId = `test-session-${Date.now()}`; // Generate a unique session ID
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
  this.response = await request(baseUrl)
    .get('/cart')
    .set('X-Session-ID', this.sessionId);
});

Then('I should receive the cart page', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.text).to.include('Cart Page');
});

Then('the cart page should contain no items', function () {
  expect(this.response.text).to.include('No items in cart');
});

When('I add a product to the cart', async function () {
  this.response = await request(baseUrl)
    .post('/cart/add')
    .set('X-Session-ID', this.sessionId)
    .send({ product_id: 1, quantity: 1 }) // Add "Laptop" (id: 3)
    .set('Content-Type', 'application/json');
});

Then('I should receive a success message', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body.message).to.equal('Item added to cart');
});

Then('the cart page should contain the added item', function () {
  expect(this.response.text).to.include('Laptop - $999 (Qty: 1)');
});

When('I clear the cart', async function () {
  this.response = await request(baseUrl)
    .post('/cart/clear')
    .set('X-Session-ID', this.sessionId);
  expect(this.response.status).to.equal(200);
  expect(this.response.body.message).to.equal('Cart cleared');
});

Then('I should receive a cart cleared message', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body.message).to.equal('Cart cleared');
});

When('I request the checkout page', async function () {
  this.response = await request(baseUrl)
    .get('/checkout')
    .set('X-Session-ID', this.sessionId);
});

Then('I should receive a checkout confirmation', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.text).to.include('Checkout Complete');
});
