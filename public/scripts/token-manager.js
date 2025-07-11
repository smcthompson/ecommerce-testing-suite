class TokenManager {
  constructor() {
    // Initialize token from sessionStorage or fetch from cookie
    this.token = sessionStorage.getItem('jwt') || this.getTokenFromCookie();
    this.listeners = new Set();
    this.initializeCookieSync();
  }

  // Get token from cookie
  getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    const jwtCookie = cookies.find((cookie) => cookie.trim().startsWith('jwt='));
    return jwtCookie ? jwtCookie.split('=')[1] : null;
  }

  // Get the current token
  getToken() {
    return this.token;
  }

  // Set a new token and notify listeners
  setToken(token) {
    this.token = token;
    if (token) {
      sessionStorage.setItem('jwt', token);
    } else {
      sessionStorage.removeItem('jwt');
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    }
    this.notifyListeners();
  }

  // Add a listener for token changes
  addTokenListener(callback) {
    this.listeners.add(callback);
  }

  // Remove a listener
  removeTokenListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners of a token change
  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.token));
  }

  // Periodically sync token with cookie
  initializeCookieSync() {
    setInterval(() => {
      const cookieToken = this.getTokenFromCookie();
      if (cookieToken && cookieToken !== this.token) {
        this.setToken(cookieToken);
      }
    }, 60000); // Sync every 60 seconds
  }

  // Navigate to a URL with the token
  async navigateWithToken(url) {
    try {
      const response = await fetch(url, {
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
      });
      if (response.ok) {
        // Navigate to the URL instead of rewriting the document
        window.location.href = url;
      } else {
        this.setToken(null);
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Navigation error:', err);
      window.location.href = '/';
    }
  }

  // Public method for scripts to navigate with token
  async navigate(url) {
    if (this.isAuthenticatedRoute(url)) {
      await this.navigateWithToken(url);
    } else {
      window.location.href = url;
    }
  }

  // Check if a URL requires authentication
  isAuthenticatedRoute(url) {
    const authRoutes = ['/products', '/cart', '/cart/list', '/cart/add', '/cart/clear', '/checkout'];
    return authRoutes.some((route) => url.includes(route));
  }
}

// Initialize the TokenManager
const tokenManager = new TokenManager();

// Export for use in other scripts
window.TokenManager = tokenManager;
