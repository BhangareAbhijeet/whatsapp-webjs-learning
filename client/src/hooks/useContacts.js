import { useState } from "react";

function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);

  const addContact = (contact) => {
    setContacts((prev) => [...prev, { ...contact, id: Date.now() }]);
  };

  const deleteContact = (id) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
    setSelectedContacts((prev) => prev.filter((contactId) => contactId !== id));
  };

  const toggleContact = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.filter((contactId) => contactId !== id)
        : [...prev, id]
    );
  };

  return {
    contacts,
    selectedContacts,
    addContact,
    deleteContact,
    toggleContact,
  };
}

export default useContacts;