const express = require('express');
const compression = require('compression');
const app = express();
const port = 3000;

app.use(compression()); // Enable compression for all responses
app.use(express.static('public'));

// Mock product data
const products = [
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Mouse', price: 29 },
];

app.get('/products', (req, res) => res.json(products));
app.get('/cart', (req, res) => res.send('Cart Page'));
app.get('/checkout', (req, res) => res.send('Checkout Complete'));

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
