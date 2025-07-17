import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useTokenManager = () => {
  const [token, setToken] = useState(sessionStorage.getItem('jwt') || null);
  const navigate = useNavigate();

  const getToken = () => token;

  const handleLogin = async (e, username, password) => {
    e.preventDefault();
    const success = await login(username, password);

    if (!success) alert('Login failed');
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    const success = await logout();

    if (!success) alert("Logout failed");
  };

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token } = await response.json();
        sessionStorage.setItem('jwt', token);
        setToken(token);
        navigate('/');

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);

      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        sessionStorage.removeItem('jwt');
        setToken(null);
        navigate('/login');
        const data = await response.json();
        alert(data.message);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Logout error:', error);

      return false;
    }
  };

  return { getToken, handleLogin, handleLogout };
};

export default useTokenManager;
