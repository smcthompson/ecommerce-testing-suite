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
    <section>
      <h1>Products</h1>
      {products.length === 0 ? (
        <div>No products found.</div>
      ) : (
        <ul id="product-list">
          {products.map(product => (
            <li key={product.id}>
              <strong>{product.name}</strong>
              <button
                onClick={() => handleAddToCart(product.id)}
              >
                ${product.price}
              </button>
            </li>
          ))}
        </ul>
      )}
      <nav>
        <a href="/cart">Go to Cart</a>
        <Logout />
      </nav>
    </section>
  );
};

export default Products;
