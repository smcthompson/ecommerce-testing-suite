import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { expect } from 'chai';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import fs from 'fs';

// Helper function to create a unique username for each test
const generateUniqueUsername = () => `testUser_${uuidv4()}`;

// Load the certificates for the HTTPS agent
const certOptions = {
  key: fs.readFileSync('../certs/iis-localhost.key'),
  cert: fs.readFileSync('../certs/iis-localhost.crt'),
  ca: fs.readFileSync('../certs/iis-localhost.crt'),
};

// Create a custom HTTPS agent with the certificates
const agent = new https.Agent(certOptions);

const baseUrl = process.env.BASE_URL || 'https://localhost:3000';

Given('the API is running', async function () {
  const res = await request(baseUrl)
    .get('/')
    .agent(agent);
  expect(res.status).to.equal(200);
});

Given('I am logged in', async function () {
  // Store cookies for authenticated session
  const loginRes = await request(baseUrl)
    .post('/login')
    .send({ username: generateUniqueUsername(), password: '7357[U53R]' })
    .set('Content-Type', 'application/json')
    .agent(agent);
  
  expect(loginRes.status).to.equal(302);
  this.cookies = loginRes.headers['set-cookie'];
});

When('I request the product list', async function () {
  this.response = await request(baseUrl)
    .get('/products')
    .set('Cookie', this.cookies)
    .agent(agent);
});

When('I request the product list without logging in', async function () {
  this.response = await request(baseUrl)
    .get('/products')
    .agent(agent);
});

Then('I should be redirected to login', function () {
  expect(this.response.status).to.equal(302);
  expect(this.response.headers.location).to.equal('/');
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
    .set('Cookie', this.cookies)
    .agent(agent);
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
    .set('Cookie', this.cookies)
    .send({ product_id: 1, quantity: 1 })
    .set('Content-Type', 'application/json')
    .agent(agent);
});

Then('I should receive a success message', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body.message).to.equal('Item added to cart');
});

Then('the cart page should contain the added item', function () {
  expect(this.response.text).to.match(/Laptop.*\$\d+\s\(Qty: 1\)/);
});

When('I clear the cart', async function () {
  this.response = await request(baseUrl)
    .post('/cart/clear')
    .set('Cookie', this.cookies)
    .agent(agent);
});

Then('I should receive a cart cleared message', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body.message).to.equal('Cart cleared successfully');
});

When('I request the checkout page', async function () {
  this.response = await request(baseUrl)
    .post('/checkout')
    .set('Cookie', this.cookies)
    .agent(agent);
});

Then('I should receive a checkout confirmation', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.text).to.equal('Checkout Complete');
});
