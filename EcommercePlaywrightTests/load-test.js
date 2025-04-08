const autocannon = require('autocannon');

const instance = autocannon({
  url: 'https://localhost:8080',
  connections: 10,
  duration: 10,
  requests: [
    { method: 'GET', path: '/' },
    { method: 'GET', path: '/products' },
    { method: 'GET', path: '/cart' },
  ],
}, (err, result) => {
  if (err) console.error(err);
  console.log(result);
});

instance.on('start', () => console.log('Load test started'));
instance.on('done', (result) => console.log('Load test completed:', result));
