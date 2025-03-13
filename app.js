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
  // For now, we'll assume cart items are passed via query params or mocked
  const cartItems = req.query.items ? JSON.parse(req.query.items) : [];
  const cartHtml = cartItems.length > 0
    ? cartItems.map(item => `<li>${item.name} - $${item.price}</li>`).join('')
    : '<li>No items in cart</li>';
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Cart Page</title></head>
    <body>
      <h1>Cart Page</h1>
      <ul id="cart-items">${cartHtml}</ul>
      <button id="checkout-button">Proceed to Checkout</button>
      <a href="/">Back to Products</a>
    </body>
    </html>
  `);
});
app.get('/checkout', (req, res) => res.send('Checkout Complete'));

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
