import { Before, Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { expect } from 'chai';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import fs from 'fs';

// Helper function to create a unique username for each test
const generateUniqueUsername = () => `testUser_${uuidv4()}`;

// Load certificates for HTTPS agent
const certOptions = {
  key: fs.readFileSync('../certs/iis-localhost.key'),
  cert: fs.readFileSync('../certs/iis-localhost.crt'),
  ca: fs.readFileSync('../certs/iis-localhost.crt'),
};

// Create a custom HTTPS agent with the certificates
const agent = new https.Agent(certOptions);
const baseUrl = process.env.BASE_URL || 'https://localhost:3000';

Before(function (scenario) {
  this.scenario = scenario.pickle;
});

Given('the API is running', async function () {
  try {
    const res = await request(baseUrl)
      .get('/')
      .agent(agent);
    expect(res.status).to.be.oneOf([200, 302, 401]);
  } catch (error) {
    throw new Error(`API is not running: ${error}`);
  }
});

Given('I am logged in', async function () {
  const username = generateUniqueUsername();
  const loginRes = await request(baseUrl)
    .send({ username, password: '7357[U53R]' })
    .post('/api/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .agent(agent);
  
  expect(loginRes.status).to.equal(200);
  expect(loginRes.body).to.have.property('token');
  this.token = loginRes.body.token;
});

When('I request the product list', async function () {
  this.response = await request(baseUrl)
    .get('/api/products')
    .set('Authorization', `Bearer ${this.token}`)
    .agent(agent);
});

Then('I should receive a list of {int} products', function (count: number) {
  expect(this.response.status).to.equal(200);
  expect(this.response.body).to.be.an('array');
  expect(this.response.body).to.have.lengthOf(count);
});

When('I add products to the cart', async function () {
  let req = request(baseUrl)
    .post('/api/cart/add')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${this.token}`)
    .send({ product_id: 1, quantity: 2 })
    .agent(agent);

  // Conditionally add Accept header for specific scenario
  if (this.scenario && this.scenario.name === 'Add to cart with invalid token') {
    req = req.set('Accept', 'application/json');
  }

  this.response = await req;
});

Then('I should receive a success message', function () {
  expect(this.response.status).to.equal(200);
  switch (this.scenario.name) {
    case 'Add an item to the cart':
      expect(this.response.body.message).to.equal('Item added to cart');
      break;
    case 'Remove an item from the cart':
      expect(this.response.body.message).to.equal('Item removed from cart');
      break;
    case 'Clear the cart':
      expect(this.response.body.message).to.equal('Cart cleared successfully');
      break;
    case 'Complete Checkout':
      expect(this.response.body.message).to.equal('Checkout Complete');
      break;
  }
});

When('I request the cart list', async function () {
  this.response = await request(baseUrl)
    .get('/api/cart/list')
    .set('Authorization', `Bearer ${this.token}`)
    .agent(agent);
});

Then('I should receive a list of cart items', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body).to.be.an('array');
});

Then('the cart should contain {int} products', function (count: number) {
  expect(this.response.body[0].quantity).to.equal(count);
});

When('I remove a product from the cart', async function () {
  this.response = await request(baseUrl)
    .post('/api/cart/remove')
    .set('Authorization', `Bearer ${this.token}`)
    .set('Content-Type', 'application/json')
    .send({ product_id: 1, quantity: 1 })
    .agent(agent);
  });
  
    .set('Content-Type', 'application/json')
    .agent(agent);
  When('I clear the cart', async function () {
    this.response = await request(baseUrl)
      .post('/api/cart/clear')
      .set('Authorization', `Bearer ${this.token}`)
      .set('Content-Type', 'application/json')
      .send({})
      .agent(agent);
});

Then('the cart should be empty', function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body).to.be.an('array').that.is.empty;
});

  this.response = await request(baseUrl)
    .post('/api/checkout')
    .set('Authorization', `Bearer ${this.token}`)
    .agent(agent);
});

});

  this.response = await request(baseUrl)
    .post('/api/cart/add')
    .set('Authorization', `Bearer ${this.token}`)
    .agent(agent);
});

});

When('I logout', async function () {
  this.response = await request(baseUrl)
    .post('/logout')
    .set('Cookie', this.cookies)
    .agent(agent);
});

Then('I should be logged out', function () {
  expect(this.response.status).to.equal(302);
  expect(this.response.headers.location).to.equal('/');
  expect(this.response.headers['set-cookie']).to.be.an('array');
  expect(this.response.headers['set-cookie'][0]).to.include('jwt=;');
});
