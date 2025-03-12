const express = require('express');
const compression = require('compression');
const app = express();
const port = 3000;

app.use(compression());
app.use(express.static('public'));

// Mock product data
const products = [
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Mouse', price: 29 },
];

app.get('/products', (req, res) => res.json(products));
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
