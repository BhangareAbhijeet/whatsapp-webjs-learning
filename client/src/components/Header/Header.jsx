import "./Header.css";

function Header({ isConnected, handleLogout }) {
  return (
    <div className="header">

      <div className="header-left">
        <h1>Dashboard</h1>
        <p>WhatsApp Individual Messaging Dashboard</p>
      </div>

      <div className="header-right">

        <div className="status">
          🟢 WhatsApp Connected
        </div>

        {

          isConnected && (

            <button

              className="logout-btn"

              onClick={handleLogout}

            >

              Logout

            </button>

          )

        }

        <button className="refresh-btn">
          Refresh
        </button>

      </div>

    </div>
  );
}

export default Header;