import { useEffect, useState } from "react";
import api from "../services/api";

// ======================================================
// WHATSAPP PROFILE HOOK
// Fetch WhatsApp profile from backend
// ======================================================

function useWhatsappProfile(isConnected) {

  // Store WhatsApp profile data
  const [profile, setProfile] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    // If WhatsApp is disconnected,
    // remove old profile from frontend
    if (!isConnected) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {

      try {

        setLoading(true);

        // ==================================================
        // CALL BACKEND PROFILE API
        // ==================================================

        const response = await api.get(
          "/api/whatsapp/profile"
        );

        // Store profile data in React state
        if (response.data?.success) {
          setProfile(response.data.profile);
        }

      } catch (error) {

        console.error(
          "❌ Profile fetch failed:",
          error
        );

        setProfile(null);

      } finally {

        setLoading(false);

      }
    };

    // Fetch profile after WhatsApp connection
    fetchProfile();

  }, [isConnected]);

  return {
    profile,
    loading,
  };
}

export default useWhatsappProfile;