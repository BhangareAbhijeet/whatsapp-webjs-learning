import { useState } from "react";
import "./ContactForm.css";

function ContactForm({ addContact }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    let cleanPhone = phone.replace(/\D/g, "");

    // जर 10 digit नंबर असेल तर India country code add करा
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }

    // Basic validation
    if (cleanPhone.length !== 12) {
      alert("Please enter a valid Indian mobile number.");
      return;
    }

    addContact({
      name: name.trim(),
      phone: cleanPhone,
    });

    setName("");
    setPhone("");
  };

  return (
    <div className="contact-form-card">
      <h2>Add Contact</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Phone Number"
          value={phone}
          maxLength={15}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button type="submit">Add Contact</button>
      </form>
    </div>
  );
}

export default ContactForm;
