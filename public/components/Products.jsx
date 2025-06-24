function Products() {
  const [products, setProducts] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch('/products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => setError('Could not load products.'));
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      const res = await fetch('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      const result = await res.json();
      alert(result.message || result.error);
    } catch (error) {
      alert('Failed to add to cart.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <nav className="mb-4">
        <a href="/cart" data-auth className="text-blue-500 hover:underline mr-4">Go to Cart</a>
        <form id="logout" method="POST" action="/logout" className="inline">
          <button type="submit" className="text-blue-500 hover:underline">Logout</button>
        </form>
      </nav>
      {error && <p className="text-red-500">{error}</p>}
      <ul id="product-list" className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="flex justify-between items-center p-2 border rounded">
            <span>{p.name} - ${p.price}</span>
            <button
              onClick={() => handleAddToCart(p.id)}
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
            >
              Add to Cart
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
