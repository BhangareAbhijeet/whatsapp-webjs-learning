function ContactItem({ contact , deleteContact , selectedContacts, toggleContact}) {
  return (
    <div className="contact-item">

      <div className="contact-info">

        <input
            type="checkbox"
            checked={selectedContacts.includes(contact.id)}
            onChange={() => toggleContact(contact.id)}
        />

        <div>
          <h4>{contact.name}</h4>
          <p>{contact.phone}</p>
        </div>

      </div>

      <button className="delete-btn" onClick={()=>deleteContact(contact.id)}>
        Delete
      </button>

    </div>
  );
}

export default ContactItem;