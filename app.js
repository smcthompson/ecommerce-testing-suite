const express = require('express');
const compression = require('compression');
const knex = require('knex')(require('./knexfile'));
const app = express();
const port = 3000;

app.use(compression());
app.use(express.static('public'));

app.get('/products', async (req, res) => {
  const products = await knex('products').select('*');
  res.json(products);
});

app.get('/cart', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Cart Page</title></head>
    <body>
      <h1>Cart Page</h1>
      <ul id="cart-items">
        <li>Laptop - $999</li>
        <li>Mouse - $29</li>
      </ul>
      <button id="checkout-button">Proceed to Checkout</button>
      <a href="/">Back to Products</a>
    </body>
    </html>
  `);
});
app.get('/checkout', (req, res) => res.send('Checkout Complete'));

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
