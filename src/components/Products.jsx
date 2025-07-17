import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from './Logout';
import useTokenManager from '../hooks/useTokenManager';
import useCartActions from '../hooks/useCartActions';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { getToken } = useTokenManager();
  const { handleAddToCart } = useCartActions();

  useEffect(() => {
    if (!getToken()) navigate('/login');

    const token = getToken();
    if (!token) return;
    setLoading(true);

    fetch('/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setError(null);
      })
      .catch(err => {
        setError(`Could not load products: ${err.message}`);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <section><h1>Loading products...</h1></section>;
  if (error) return <section><h1>Error: {error}</h1></section>;

  return (
    <section>
      <h1>Products</h1>
      {products.length === 0 ? (
        <div>No products found.</div>
      ) : (
        <ul id="product-list">
          {products.map((product) => (
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
