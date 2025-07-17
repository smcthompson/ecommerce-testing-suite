import { useState } from 'react';
import useTokenManager from '../hooks/useTokenManager';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin } = useTokenManager();

  return (
    <section>
      <h1>Login</h1>
      <form onSubmit={(e) => handleLogin(e, username, password)} className="max-w-md mx-auto p-4">
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
