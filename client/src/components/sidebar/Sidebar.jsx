
import "./Sidebar.css";

function Sidebar() {
  const menuItems = [
    { icon: "🏠", label: "Dashboard" },
    { icon: "👥", label: "Contacts" },
    { icon: "📝", label: "Templates" },
    { icon: "📋", label: "Logs" },
    { icon: "⚙️", label: "Settings" },
  ];

  const handleLogout = async () => {
  try {
    const response = await fetch("http://localhost:5001/api/whatsapp/logout", {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Logout successful");
      window.location.href = "/login";
    } else {
      console.error(data);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo">
          <div className="logo-icon">📱</div>
          <div>
            <h2>WA Dashboard</h2>
            <p>WhatsApp Control</p>
          </div>
        </div>
      </div>

      <nav className="menu" aria-label="Sidebar navigation">
        {menuItems.map((item) => (
          <button key={item.label} type="button" className="menu-item">
            <span className="menu-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="profile-card">
          <div className="profile-avatar">A</div>
          <div className="profile-meta">
            <strong>Admin User</strong>
            <span>Online</span>
          </div>
        </div>

        <button type="button" className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
