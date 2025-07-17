import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTokenManager from "./useTokenManager";

const useCartActions = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { getToken } = useTokenManager();

  const fetchCartItems = async () => {
    if (!getToken()) navigate('/login');

    const token = getToken();
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch('/api/cart/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      // if (!res.ok) throw new Error('Failed to load cart');
      const data = await res.json();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(`Could not load cart: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, showAlert = false) => {
    if (!getToken()) navigate('/login');

    const token = getToken();
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      const result = await res.json();
      if (showAlert) alert(result.message || result.error);
      await fetchCartItems();
    } catch (error) {
      setError(`Could not add item to cart: ${err.message}`);
      if (showAlert) alert('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId, showAlert = false) => {
    if (!getToken()) navigate('/login');

    const token = getToken();
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      const result = await res.json();
      if (showAlert) alert(result.message || result.error);
      await fetchCartItems();
    } catch (error) {
      setError(`Could not remove item from cart: ${error.message}`);
      if (showAlert) alert('Failed to remove from cart.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async (showAlert = false) => {
    if (!getToken()) navigate('/login');

    const token = getToken();
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch('/api/cart/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      });
      const data = await res.json();
      if (showAlert) alert(data.message || data.error);
      await fetchCartItems();
    } catch (err) {
      setError(`Could not clear cart: ${err.message}`);
      if (showAlert) alert('Could not clear cart.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!getToken()) navigate('/login');

    const token = getToken();
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        credentials: 'include',
      });
      const text = await res.text();
      alert(text);
      navigate('/');
    } catch (err) {
      alert('Could not complete checkout.');
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    error,
    fetchCartItems,
    handleAddToCart,
    handleRemoveFromCart,
    handleClearCart,
    handleCheckout,
  };
}

export default useCartActions;
