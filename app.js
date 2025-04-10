const express = require('express');
const compression = require('compression');
const cors = require('cors');
const session = require('express-session');
const { ConnectSessionKnexStore } = require('connect-session-knex');
const knex = require('knex')(require('./knexfile'));
const path = require('path');
const https = require('https');
const fs = require('fs');


// Configre HTTP server
const protocol = process.env.PROTOCOL || 'https';
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;
const apiRoot = `${protocol}://${host}:${port}`;
const httpsOptions = {
  key: fs.readFileSync('certs/iis-localhost.key'),
  cert: fs.readFileSync('certs/iis-localhost.crt'),
};

// Configure session store
const store = new ConnectSessionKnexStore({
  knex,
  tablename: 'sessions',
  createTable: true,
  sidfieldname: 'sid',
  logErrors: (err) => {
    console.error('Session store error:', err);
  },
});
// Add logging for session store operations
store.on('error', (err) => {
  console.error("on('error')", err);
});

// Initialize Express app
const app = express();
// JSON middleware
app.use(express.json());
// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));
// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  },
}));
// CORS middleware
app.use(cors({
  origin: `${protocol}://${host}:${port}`,
  credentials: true,
}));
// Middleware to set user_id and session_id in req
app.use((req, res, next) => {
  req.user_id = req.session.userId || null;
  req.session_id = req.session.id;
  next();
});
// Compression middleware
app.use(compression());

// Root route
app.get('/', async (req, res) => {
  // Check if the user is not logged in
  if (!req.session.userId) {
    return res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }

  // If user is logged in, serve the product list page
  res.sendFile(path.join(__dirname, 'public', 'products.html'),
    (err) => {
      if (err) {
        res.status(500).send('Error loading product list page');
      }
    }
  );
});

  try {
    // Check if the user exists
    let user = await knex('users')
      .where({ username, password })
      .first();
      });
    }

    req.session.userId = user.id;

    // Explicitly save the session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      res.redirect('/');
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item to cart' });
// Product list
app.get('/products', async (req, res) => {
    const products = await knex('products').select('*');
    res.json(products);
  }
});

// View cart
app.get('/cart', async (req, res) => {
  try {
    const cartItems = await knex('cart')
      .leftJoin('products', 'cart.product_id', 'products.id')
      .where('cart.user_id', req.user_id)
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
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error loading cart');
  }
});

// Add to cart
app.post('/cart/add', async (req, res) => {
// Clear cart
app.post('/cart/clear', async (req, res) => {
  try {
    const deletedRows = await knex('cart').where('user_id', req.user_id).del();
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

app.get('/checkout', (req, res) => res.send('Checkout Complete'));
// Static files after routes
app.use(express.static('public'));

https.createServer(httpsOptions, app).listen(port, () => {
});
