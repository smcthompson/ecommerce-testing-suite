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
  try {
    const res = await request(baseUrl)
      .get('/')
      .agent(agent);
    expect(res.status).to.be.oneOf([200, 302, 401]);
  } catch (error) {
    throw new Error(`API is not running: ${String(error)}`);
  }
});

Given('I am logged in', async function () {
  // Store cookies for authenticated session
  const username = generateUniqueUsername();
  const loginRes = await request(baseUrl)
    .post('/login')
    .send({ username, password: '7357[U53R]' })
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .agent(agent);
  
  expect(loginRes.status).to.equal(200);
  expect(loginRes.body).to.have.property('token');
  this.token = loginRes.body.token;
});

Given('I am logged in via HTML form', async function () {
  const username = generateUniqueUsername();
  const loginRes = await request(baseUrl)
    .post('/login')
    .send({ username, password: '7357[U53R]' })
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Accept', 'text/html')
    .agent(agent);
  
  expect(loginRes.status).to.equal(302);
  expect(loginRes.headers.location).to.equal('/');
  expect(loginRes.headers['set-cookie']).to.be.an('array').with.length.greaterThan(0);
  expect(loginRes.headers['set-cookie'][0]).to.include('jwt=');
  this.cookies = loginRes.headers['set-cookie'];
});

When('I request the product list', async function () {
  this.response = await request(baseUrl)
    .get('/products')
    .set('Authorization', `Bearer ${this.token}`)
    .agent(agent);
});

When('I request the product list without logging in', async function () {
  this.response = await request(baseUrl)
    .get('/products')
    .agent(agent);
});

Then('I should receive the login page', function () {
  expect(this.response.status).to.be.oneOf([200, 401]);
  if (this.response.status === 200) {
    expect(this.response.text).to.include('Login');
  } else {
    expect(this.response.body).to.have.property('error').that.includes('Unauthorized');
  }
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
    .set('Authorization', `Bearer ${this.token}`)
    .agent(agent);
});

When('I request the cart page with cookies', async function () {
  this.response = await request(baseUrl)
    .get('/cart')
    .set('Cookie', this.cookies)
    .agent(agent);
});

Then('I should receive the cart page', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.text).to.include('Cart Page');
});

When('I request the cart list', async function () {
  this.response = await request(baseUrl)
    .get('/cart/list')
    .set('Authorization', `Bearer ${this.token}`)
    .agent(agent);
});

Then('I should receive a list of cart items', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body).to.be.an('array');
});

Then('the cart should be empty', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body).to.be.an('array').that.is.empty;
});

When('I add a product to the cart', async function () {
  this.response = await request(baseUrl)
    .post('/cart/add')
    .set('Authorization', `Bearer ${this.token}`)
    .send({ product_id: 1, quantity: 1 })
    .set('Content-Type', 'application/json')
    .agent(agent);
});

Then('I should receive a success message', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body.message).to.equal('Item added to cart');
});

When('I clear the cart', async function () {
  this.response = await request(baseUrl)
    .post('/cart/clear')
    .set('Authorization', `Bearer ${this.token}`)
    .agent(agent);
});

Then('I should receive a cart cleared message', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body.message).to.equal('Cart cleared successfully');
});

When('I request the checkout page', async function () {
  this.response = await request(baseUrl)
    .post('/checkout')
    .set('Authorization', `Bearer ${this.token}`)
    .agent(agent);
});

Then('I should receive a checkout confirmation', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.text).to.equal('Checkout Complete');
});
