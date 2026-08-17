import "./StatusCard.css";

function StatusCard({
  totalContacts,
  selectedCount,
  sentCount = 0,
  failedCount = 0,
  waitingCount = 0,
}) {
  return (

      <div className="stats-grid">

        <div className="stat-card">
          <span>👥</span>
          <h1>{totalContacts}</h1>
          <p>Contacts</p>
        </div>

        <div className="stat-card">
          <span>✅</span>
          <h1>{selectedCount}</h1>
          <p>Selected</p>
        </div>

        <div className="stat-card">
          <span>📨</span>
          <h1>{sentCount}</h1>
          <p>Sent</p>
        </div>

        <div className="stat-card">
          <span>❌</span>
          <h1>{failedCount}</h1>
          <p>Failed</p>
        </div>

        <div className="stat-card">
          <span>⏳</span>
          <h1>{waitingCount}</h1>
          <p>Waiting</p>
        </div>

      </div>

    
  );
}

export default StatusCard;