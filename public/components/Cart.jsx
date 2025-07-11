function Cart() {
  const [items, setItems] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch('/cart/list', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load cart');
        return res.json();
      })
      .then((data) => setItems(data))
      .catch((err) => setError('Could not load cart.'));
  }, []);

  const handleClearCart = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/cart/clear', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      alert(data.message || data.error);
      setItems([]);
    } catch (err) {
      alert('Could not clear cart.');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/checkout', {
        method: 'POST',
        credentials: 'include',
      });
      const text = await res.text();
      alert(text);
      window.location.href = '/';
    } catch (err) {
      alert('Could not complete checkout.');
    }
  };

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
        {window.HandleLogout && <window.HandleLogout />}
      </div>
    </div>
  );
}
