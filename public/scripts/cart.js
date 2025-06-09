fetch('/cart/list')
  .then((res) => {
    if (!res.ok) throw new Error('Failed to load cart');
    return res.json();
  })
  .then((items) => {
    const list = document.getElementById('cart-items');
    if (items.length > 0 && items[0].name) {
      list.innerHTML = items
        .map(
          (item) =>
            `<li>${item.name} - $${item.price} (Qty: ${item.quantity})</li>`
        )
        .join('');
    } else {
      list.innerHTML = '<li>No items in cart</li>';
    }
  })
  .catch((err) => {
    alert('Could not load cart.');
  });

document.getElementById('cart-clear').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const res = await fetch('/cart/clear', { method: 'POST' });
    const data = await res.json();
    alert(data.message || data.error);
    document.getElementById('cart-items').innerHTML = '<li>No items in cart</li>';
  } catch (err) {
    alert('Could not clear cart.');
  }
});

document.getElementById('checkout').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const res = await fetch('/checkout', { method: 'POST' });
    const text = await res.text();
    alert(text);
    // Navigate back to products page after checkout
    window.TokenManager.navigate('/');
  } catch (err) {
    alert('Could not complete checkout.');
  }
});
