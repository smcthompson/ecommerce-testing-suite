import useTokenManager from "../hooks/useTokenManager";

const Logout = () => {
  const { logout } = useTokenManager();

  const handleLogout = async (e) => {
    e.preventDefault();
    const success = await logout();

    if (!success) alert("Logout failed");
  };

  return (
    <form id="logout" onSubmit={handleLogout}>
      <button type="submit">Logout</button>
    </form>
  );
}

export default Logout;
