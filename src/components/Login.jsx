import { useState } from 'react';
import useTokenManager from '../hooks/useTokenManager';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useTokenManager();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (!success) {
      alert('Login failed');
    }
  };

  return (
    <section>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
        <input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </section>
  );
};

export default Login;
