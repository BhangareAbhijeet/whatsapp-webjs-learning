import { useEffect, useState } from "react";
import api from "../services/api";

function useMessages() {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const setImage = (file) => {
    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported file type. Use JPG, JPEG, PNG, or WEBP.");
      return;
    }

    if (file.size > maxSize) {
      setError("Image size must be 10 MB or less.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setPreviewUrl(nextPreviewUrl);
    setError("");
  };

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(null);
    setPreviewUrl("");
    setError("");
  };

  const clearMessage = () => {
    setMessage("");
    removeImage();
  };

  const sendMessages = async (contacts) => {
    if (!message.trim() && !selectedImage) {
      alert("Please enter a message or attach an image.");
      return;
    }

    if (!Array.isArray(contacts) || contacts.length === 0) {
      alert("Please select at least one contact.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("message", message);
      formData.append("contacts", JSON.stringify(contacts));

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await api.post("/api/whatsapp/bulk-send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { success, sent, failed } = response.data;

      if (success) {
        clearMessage();
        alert(`✅ All ${sent} messages sent successfully.`);
      } else {
        alert(
          `⚠️ Message Sending Completed

          ✅ Sent   : ${sent}

          ❌ Failed : ${failed}`,
        );
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send messages.");
    } finally {
      setLoading(false);
    }
  };

  const sendGroupMessages = async (groups) => {
    if (!message.trim() && !selectedImage) {
      alert("Please enter a message or attach an image.");
      return;
    }

    if (!Array.isArray(groups) || groups.length === 0) {
      alert("Please select at least one group.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("message", message);
      formData.append("groups", JSON.stringify(groups));

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await api.post("/api/whatsapp/group-bulk-send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { success, sent, failed } = response.data;

      if (success) {
        clearMessage();
        alert(`✅ All ${sent} group messages sent successfully.`);
      } else {
        alert(
          `⚠️ Group Messaging Completed

          ✅ Sent   : ${sent}

          ❌ Failed : ${failed}`,
        );
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send group messages.");
    } finally {
      setLoading(false);
    }
  };

  return {
    message,
    setMessage,
    selectedImage,
    setSelectedImage: setImage,
    removeImage,
    previewUrl,
    error,
    loading,
    sendMessages,
    sendGroupMessages,
    clearMessage,
  };
}

export default useMessages;
