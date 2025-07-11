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
}

// Initialize the TokenManager
const tokenManager = new TokenManager();

// Export for use in other scripts
window.TokenManager = tokenManager;
