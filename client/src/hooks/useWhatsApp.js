import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";

function useWhatsApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [qrImage, setQrImage] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get("/api/whatsapp/status");
        setIsConnected(response.data.whatsapp.connected);
      } catch (err) {
        console.log(err);
      }
    };

    checkStatus();
  }, []);

  useEffect(() => {
    const handleStatus = (data) => {
      setIsConnected(data.connected);

      if (data.connected) {
        setQrImage("");
      }
    };

    const handleQr = (data) => {
      if (data?.qr) {
        setQrImage(data.qr);
      }
    };

    socket.on("status", handleStatus);
    socket.on("qr", handleQr);

    return () => {
      socket.off("status", handleStatus);
      socket.off("qr", handleQr);
    };
  }, []);

  const logout = async () => {
    try {
      setIsConnected(false);
      setQrImage("");

      await api.post("/api/whatsapp/logout");
    } catch (err) {
      console.log(err);
    }
  };

  return {
    isConnected,
    qrImage,
    logout,
  };
}

export default useWhatsApp;
