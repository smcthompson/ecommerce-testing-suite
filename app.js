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

// Configure HTTP server
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
      // Redirect to /login for unauthenticated HTML requests
      return res.redirect('/login');
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
      return res.redirect('/login');
    }
    return res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Helper function to create a new user
const createUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [newUserId] = await knex('users').insert({
    username,
    password: hashedPassword,
  });

  return { id: newUserId, username, password: hashedPassword };
}

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: `${protocol}://${host}`,
  credentials: true,
}));
app.use(compression());

// Login route (serves index.html to let React handle Login.jsx)
app.get('/api/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to load login page' });
    }
  });
});

// Root route with authentication
app.get('/', authenticateJWT, async (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to load page' });
    }
  });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    if (req.accepts('html')) {
      return res.redirect('/login');
    }
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    let user = await knex('users').where({ username }).first();
    if (!user) {
      user = await createUser(username, password);
    } else if (!(await bcrypt.compare(password, user.password))) {
      if (req.accepts('html')) {
        return res.redirect('/login');
      }
      return res.status(401).json({ error: 'Invalid username or password' });
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
    if (req.accepts('html')) {
      return res.redirect('/login');
    }
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint
  res.clearCookie('jwt');
app.post('/api/logout', (req, res) => {
  if (req.accepts('html')) {
    return res.redirect('/');
  }
  return res.json({ message: 'Logged out successfully' });
});

// Product list
app.get('/api/products', authenticateJWT, async (req, res) => {
  try {
    const products = await knex('products').select('*');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// View cart
app.get('/api/cart', authenticateJWT, async (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({ error: 'Error loading cart page' });
    }
  });
});

// List cart
app.get('/api/cart/list', authenticateJWT, async (req, res) => {
  try {
    const cartItems = await knex('cart')
      .leftJoin('products', 'cart.product_id', 'products.id')
      .where('cart.user_id', req.user_id)
      .select('products.id', 'products.name', 'products.price', 'cart.quantity');
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: 'Error loading cart' });
  }
});

// Add to cart
app.post('/api/cart/add', authenticateJWT, async (req, res) => {
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
app.post('/api/cart/clear', authenticateJWT, async (req, res) => {
  try {
    const deletedRows = await knex('cart').where('user_id', req.user_id).del();
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Checkout
app.post('/api/checkout', authenticateJWT, async (req, res) => {
  res.send('Checkout Complete');
});

// Static files before catch-all route
app.use(express.static('dist'));

https.createServer(httpsOptions, app).listen(port, () => {
});
