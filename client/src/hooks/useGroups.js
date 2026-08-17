import { useEffect, useState } from "react";
import api from "../services/api";

function useGroups(isConnected) {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    if (!isConnected) {
      setGroups([]);
      setSelectedGroups([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/api/whatsapp/groups");

      if (response.data?.groups) {
        setGroups(response.data.groups);
      }
    } catch (err) {
      console.error(err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups((prev) => prev.filter((id) => id !== groupId));
    } else {
      setSelectedGroups((prev) => [...prev, groupId]);
    }
  };

  const selectAll = () => {
    setSelectedGroups(groups.map((group) => group.id));
  };

  const clearSelection = () => {
    setSelectedGroups([]);
  };

  useEffect(() => {
    let active = true;

    const loadGroups = async () => {
      if (!isConnected) {
        if (active) {
          setGroups([]);
          setSelectedGroups([]);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await api.get("/api/whatsapp/groups");

        if (active && response.data?.groups) {
          setGroups(response.data.groups);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setGroups([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadGroups();

    return () => {
      active = false;
    };
  }, [isConnected]);

  return {
    groups,
    selectedGroups,
    loading,
    toggleGroup,
    selectAll,
    clearSelection,
    fetchGroups,
  };
}

export default useGroups;
