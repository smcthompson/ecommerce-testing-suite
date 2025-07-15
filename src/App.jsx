import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Products from './components/Products';
import Login from './components/Login';
import Cart from './components/Cart';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
