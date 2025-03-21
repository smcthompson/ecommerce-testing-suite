const express = require('express');
const compression = require('compression');
const knex = require('knex')(require('./knexfile'));
const app = express();
const port = 3000;

app.use(compression());
app.use(express.static('public'));
app.use(express.json()); // For parsing JSON request bodies

// Middleware to mock a session ID (replace with proper session management in future)
app.use((req, res, next) => {
  req.session_id = req.headers['x-session-id'] || 'default-session';
  next();
});

// Get products
app.get('/products', async (req, res) => {
  const products = await knex('products').select('*');
  res.json(products);
});

// Add item to cart
app.post('/cart/add', async (req, res) => {
  console.log('Adding to cart:', { session_id: req.session_id, product_id: req.body.product_id, quantity: req.body.quantity });
  try {
    const existingItem = await knex('cart')
      .where({ session_id: req.session_id, product_id })
      .first();
    if (existingItem) {
      await knex('cart')
        .where({ session_id: req.session_id, product_id })
        .increment('quantity', quantity);
    } else {
      await knex('cart').insert({
        session_id: req.session_id,
        product_id,
        quantity,
      });
    }
    res.status(200).json({ message: 'Item added to cart' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// View cart
app.get('/cart', async (req, res) => {
  try {
    const cartItems = await knex('cart')
      .join('products', 'cart.product_id', 'products.id')
      .where('cart.session_id', req.session_id)
      .select('products.id', 'products.name', 'products.price', 'cart.quantity');
    const cartHtml = cartItems.length > 0
      ? cartItems.map(item => `<li>${item.name} - $${item.price} (Qty: ${item.quantity})</li>`).join('')
      : '<li>No items in cart</li>';
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Cart Page</title></head>
      <body>
        <h1>Cart Page</h1>
        <ul id="cart-items">${cartHtml}</ul>
        <button id="checkout-button">Proceed to Checkout</button>
        <a href="/?session_id=${encodeURIComponent(req.session_id)}">Back to Products</a>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error loading cart');
  }
});

// Clear cart
app.post('/cart/clear', async (req, res) => {
  try {
    await knex('cart').where('session_id', req.session_id).del();
    res.status(200).json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

app.get('/checkout', (req, res) => res.send('Checkout Complete'));

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
