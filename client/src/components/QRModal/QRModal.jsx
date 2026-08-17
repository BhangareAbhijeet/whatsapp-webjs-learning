import "./QRModal.css";

function QRModal({ qrImage }) {

  if (!qrImage) {
    return null;
  }

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>Scan WhatsApp QR</h2>

        <img
          src={qrImage}
          alt="WhatsApp QR"
        />

        <p>
          Open WhatsApp → Linked Devices → Link a Device
        </p>

      </div>

    </div>
  );
}

export default QRModal;