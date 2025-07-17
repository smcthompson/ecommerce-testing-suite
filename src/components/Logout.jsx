import useTokenManager from "../hooks/useTokenManager";

const Logout = () => {
  const { handleLogout } = useTokenManager();

  return (
    <form id="logout" onSubmit={(e) => handleLogout(e)}>
      <button type="submit">Logout</button>
    </form>
  );
}

export default Logout;
