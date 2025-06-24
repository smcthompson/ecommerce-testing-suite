fetch('/products')
  .then((res) => {
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
  })
  .then((data) => {
    const list = document.getElementById('product-list');
    data.forEach((p) => {
      const li = document.createElement('li');
      li.textContent = `${p.name} - $${p.price}`;
      const button = document.createElement('button');
      button.textContent = 'Add to Cart';
      button.addEventListener('click', async () => {
        try {
          const res = await fetch('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ product_id: p.id, quantity: 1 }),
          });
          const result = await res.json();
          alert(result.message || result.error);
        } catch (error) {
          console.error('Error adding to cart:', error);
          alert('Failed to add to cart.');
        }
      });
      li.appendChild(button);
      list.appendChild(li);
    });
  })
  .catch((error) => {
    console.error('Error loading products:', error);
    alert('Could not load products.');
  });
