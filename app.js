const express = require('express');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const knex = require('knex')(require('./knexfile'));
const path = require('path');
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';


// Configre HTTP server
const protocol = process.env.PROTOCOL || 'https';
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;
const apiRoot = `${protocol}://${host}:${port}`;
const httpsOptions = {
  key: fs.readFileSync('certs/iis-localhost.key'),
  cert: fs.readFileSync('certs/iis-localhost.crt'),
};

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    token = req.cookies?.jwt;
  }
  if (!token) {
    if (req.accepts('html')) {
      return res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user_id = decoded.userId;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    if (req.accepts('html')) {
      return res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
    return res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Initialize Express app
const app = express();
// JSON middleware
app.use(express.json());
// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));
// CORS middleware
app.use(cookieParser());
app.use(cors({
  origin: `${protocol}://${host}:${port}`,
  credentials: true,
}));
// Compression middleware
app.use(compression());

// Root route
app.get('/', authenticateJWT, async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'), (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to load product list page' });
    }
  });
});

// Login endpoint with server-side redirect
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate form data
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Check if the user exists
    let user = await knex('users')
      .where({ username, password })
      .first();

    // If user doesn't exist, create a new one
    if (!user) {
      const [newUserId] = await knex('users').insert({
        username,
        password,
      });
      user = { id: newUserId, username, password };
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    if (req.accepts('html')) {
      res.cookie('jwt', token, {
        secure: true,
        sameSite: 'strict',
      });
      return res.redirect('/');
    } else {
      return res.json({ token });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  if (req.accepts('html')) {
    return res.redirect('/');
  }
  return res.json({ message: 'Logged out successfully' });
});

// Product list
app.get('/products', authenticateJWT, async (req, res) => {
  try {
    const products = await knex('products').select('*');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// View cart
app.get('/cart', authenticateJWT, async (req, res) => {

// List cart
app.get('/cart/list', authenticateJWT, async (req, res) => {
  try {
    const cartItems = await knex('cart')
      .leftJoin('products', 'cart.product_id', 'products.id')
      .where('cart.user_id', req.user_id)
      .select('products.id', 'products.name', 'products.price', 'cart.quantity');
    const cartHtml = cartItems.length > 0 && cartItems[0].name
      ? cartItems.map(item => `<li>${item.name} - $${item.price} (Qty: ${item.quantity})</li>`).join('')
      : '<li>No items in cart</li>';
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Cart Page</title></head>
      <body>
        <h1>Cart Page</h1>
        <ul id="cart-items">${cartHtml}</ul>
        <form id="checkout-form" action="/checkout" method="POST">
          <button id="checkout-button">Proceed to Checkout</button>
        </form>
        <form id="clear-cart-form" action="/cart/clear" method="POST">
          <button id="clear-cart-button">Clear Cart</button>
        </form>
        <a href="/">Back to Products</a>
        <form action="/logout" method="POST">
          <button type="submit">Logout</button>
        </form>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error loading cart');
  }
});

// Add to cart
app.post('/cart/add', authenticateJWT, async (req, res) => {
  try {
    const existingItem = await knex('cart')
      .where({ user_id: req.user_id, product_id: req.body.product_id })
      .first();
    if (existingItem) {
      await knex('cart')
        .where({ user_id: req.user_id, product_id: req.body.product_id })
        .increment('quantity', req.body.quantity);
    } else {
      await knex('cart').insert({
        user_id: req.user_id,
        product_id: req.body.product_id,
        quantity: req.body.quantity,
      });
    }
    res.status(200).json({ message: 'Item added to cart' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Clear cart
app.post('/cart/clear', authenticateJWT, async (req, res) => {
  try {
    const deletedRows = await knex('cart').where('user_id', req.user_id).del();
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Checkout
app.post('/checkout', authenticateJWT, async (req, res) => {
  res.send('Checkout Complete');
});

// Static files after routes
app.use(express.static('public'));

https.createServer(httpsOptions, app).listen(port, () => {
});
