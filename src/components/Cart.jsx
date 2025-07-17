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
      <h1 className="text-2xl font-bold mb-4">Cart Page</h1>
      {error && <p className="text-red-500">{error}</p>}
      <ul id="cart-items" className="space-y-2 mb-4">
        {items.length > 0 && items[0].name ? (
          items.map((item) => (
            <li key={item.id} className="p-2 border rounded">
              {item.name} - ${item.price} (Qty: {item.quantity})
            </li>
          ))
        ) : (
          <li>No items in cart</li>
        )}
      </ul>
      <div className="space-y-4">
        <form id="checkout" onSubmit={handleCheckout}>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2">
            Proceed to Checkout
          </button>
        </form>
        <form id="cart-clear" onSubmit={handleClearCart}>
          <button type="submit" className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 mb-2">
            Clear Cart
          </button>
        </form>
        <a href="/" data-auth className="block text-blue-500 hover:underline">
          Back to Products
        </a>
      </div>
    </div>
        <Logout />
  );
}

export default Cart;
