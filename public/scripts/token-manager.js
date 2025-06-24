class TokenManager {
  constructor() {
    // Initialize token from sessionStorage or fetch from cookie
    this.token = sessionStorage.getItem('jwt') || this.getTokenFromCookie();
    this.listeners = new Set();
    this.initializeFetchInterceptor();
    this.initializeNavigationInterceptor();
    this.initializeFormHandlers();
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

  // Intercept fetch to add Authorization header
  initializeFetchInterceptor() {
    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      const headers = {
        ...options.headers,
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...(options.method !== 'GET' && !options.headers?.['Content-Type'] && {
          'Content-Type': 'application/json',
        }),
      };

      try {
        const response = await originalFetch(url, {
          ...options,
          headers,
        });

        // Handle unauthorized or forbidden responses
        if (response.status === 401 || response.status === 403) {
          this.setToken(null);
          window.location.href = '/';
          return response;
        }

        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };
  }

  // Intercept navigation for <a> tags
  initializeNavigationInterceptor() {
    // Handle <a> tag clicks
    document.addEventListener('click', async (event) => {
      const anchor = event.target.closest('a[data-auth]');
      if (anchor) {
        event.preventDefault();
        const href = anchor.getAttribute('href');
        await this.navigateWithToken(href);
      }
    });
  }

  // Handle form submissions (login, logout)
  initializeFormHandlers() {
    document.addEventListener('submit', async (event) => {
      const form = event.target;
      if (form.id === 'login') {
        event.preventDefault();
        const data = new FormData(form);
        try {
          const res = await fetch('/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'text/html',
            },
            body: new URLSearchParams(data).toString(),
          });
          if (res.redirected) {
            // Sync token from cookie after server-side redirect
            const cookieToken = this.getTokenFromCookie();
            if (cookieToken) {
              this.setToken(cookieToken);
            }
            window.location.href = res.url;
          } else {
            const result = await res.text();
            alert('Login failed: ' + result);
          }
        } catch (err) {
          console.error('Login error:', err);
          alert('Login failed');
        }
      } else if (form.id === 'logout') {
        event.preventDefault();
        try {
          const res = await fetch('/logout', {
            method: 'POST',
            headers: {
              Accept: 'text/html',
            },
          });
          if (res.ok) {
            this.setToken(null);
            window.location.href = '/';
          } else {
            alert('Logout failed');
          }
        } catch (err) {
          console.error('Logout error:', err);
          alert('Logout failed');
        }
      }
    });
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
