  const [products, setProducts] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch('/products', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load products');
const Products = () => {
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => setError('Could not load products.'));
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      const res = await fetch('/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
      <nav className="mb-4">
        <a href="/cart" data-auth className="text-blue-500 hover:underline mr-4">Go to Cart</a>
        {window.HandleLogout && <window.HandleLogout />}
      </nav>
    </div>
  );
};

export default Products;
