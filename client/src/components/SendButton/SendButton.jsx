import "./SendButton.css";

function SendButton({ loading, onSend, selectedCount }) {
  return (
    <div className="send-button">
      <button onClick={onSend} disabled={loading}>
        {loading ? "Sending..." : `Send (${selectedCount})`}
      </button>
    </div>
  );
}

export default SendButton;
