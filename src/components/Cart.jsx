import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from './Logout';
import useTokenManager from '../hooks/useTokenManager';
import useCartActions from '../hooks/useCartActions';

const Cart = () => {
  const navigate = useNavigate();
  const { getToken } = useTokenManager();
  const {
    items,
    loading,
    error,
    fetchCartItems,
    handleAddToCart,
    handleRemoveFromCart,
    handleClearCart,
    handleCheckout,
  } = useCartActions();

  useEffect(() => {
    if (!getToken()) navigate('/login');

    fetchCartItems();
  }, []);

  if (loading) return <section><h1>Loading cart...</h1></section>;
  if (error) return <section><h1>Error: {error}</h1></section>;

  return (
    <div>
        {items.length > 0 && items[0].name ? (
      <h1>Cart Page</h1>
      {error && <p>{error}</p>}
      <ul id="cart-items">
          items.map((item) => (
              {item.name} - ${item.price} (Qty: {item.quantity})
            <li key={item.id}>
            </li>
          ))
        ) : (
          <li>No items in cart</li>
        )}
      </ul>
      <nav>
        <form id="checkout" onSubmit={handleCheckout}>
          <button type="submit">
            Proceed to Checkout
          </button>
        </form>
        <form id="cart-clear" onSubmit={handleClearCart}>
          <button type="submit">
            Clear Cart
          </button>
        </form>
        <a href="/">
          Back to Products
        </a>
    </div>
        <Logout />
      </nav>
  );
};

export default Cart;
