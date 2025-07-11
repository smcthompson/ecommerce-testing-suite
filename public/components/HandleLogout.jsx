function HandleLogout() {
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch('/logout', { method: 'POST', credentials: 'include' });
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      sessionStorage.removeItem('jwt');
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    } catch (err) {
      alert('Logout failed');
    }
  };
  return (
    <form id="logout" className="inline" onSubmit={handleLogout}>
      <button type="submit" className="text-blue-500 hover:underline">Logout</button>
    </form>
  );
}

// UMD export for browser
window.HandleLogout = HandleLogout;
