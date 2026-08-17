import "./MessageBox.css";

function MessageBox({
  message,
  setMessage,
  selectedImage,
  setSelectedImage,
  removeImage,
  previewUrl,
  error,
}) {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedImage(file);
    event.target.value = "";
  };

  return (
    <div className="message-box">
      <h2>Message</h2>

      <p>Write your WhatsApp message below.</p>

      <textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="message-actions">
        <label className="upload-button">
          <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileChange} />
          Attach Image
        </label>

        {selectedImage && (
          <button type="button" className="remove-image-button" onClick={removeImage}>
            Remove Image
          </button>
        )}
      </div>

      {selectedImage && (
        <div className="image-preview-card">
          <p className="selected-file-name">Selected File: {selectedImage.name}</p>

          {previewUrl && (
            <div className="image-preview-box">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
        </div>
      )}

      {error && <p className="message-error">{error}</p>}

      <div className="message-footer">
        <span>{message.length}/1000</span>
      </div>
    </div>
  );
}

export default MessageBox;