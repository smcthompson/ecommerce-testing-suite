import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from './Logout';
import useTokenManager from '../hooks/useTokenManager';

const Products = () => {
  const { getToken } = useTokenManager();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(err.message);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <section><h1>Loading products...</h1></section>;
  if (error) return <section><h1>Error: {error}</h1></section>;

  const handleAddToCart = async (productId) => {
    try {
      const res = await fetch('/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
