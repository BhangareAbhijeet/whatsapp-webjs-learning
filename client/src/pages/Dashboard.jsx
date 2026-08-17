import "./Dashboard.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import StatusCard from "../components/StatusCard/StatusCard";
import MessageBox from "../components/MessageBox/MessageBox";
import ContactList from "../components/ContactList/ContactList";
import GroupList from "../components/GroupList/GroupList";
import SendButton from "../components/SendButton/SendButton";
import Logs from "../components/Logs/Logs";
import QRModal from "../components/QRModal/QRModal";
// import ProgressBar from "../components/ProgressBar/ProgressBar";

//hooks
import useWhatsApp from "../hooks/useWhatsApp";
import useContacts from "../hooks/useContacts";
import useMessages from "../hooks/useMessages";
import useGroups from "../hooks/useGroups";
import { useEffect, useState } from "react";
import socket from "../services/socket";

//socket.io

function Dashboard() {
  const { isConnected, qrImage, logout } = useWhatsApp();
  const {
    contacts,
    selectedContacts,
    deleteContact,
    toggleContact,
    addContact,
    importContacts,
  } = useContacts();
  const {
    message,
    setMessage,
    selectedImage,
    setSelectedImage,
    removeImage,
    previewUrl,
    error,
    loading,
    sendMessages,
    sendGroupMessages,
  } = useMessages();
  const {
    groups,
    selectedGroups,
    loading: groupsLoading,
    toggleGroup,
  } = useGroups(isConnected);
  const [, setStats] = useState({
    sent: 0,
    failed: 0,
    waiting: 0,
  });
  useEffect(() => {
    socket.on("log", (data) => {
      setStats((prev) => {
        const updated = { ...prev };

        if (data.status === "Waiting") {
          updated.waiting++;
        }

        if (data.status === "Sent") {
          updated.sent++;

          if (updated.waiting > 0) {
            updated.waiting--;
          }
        }

        if (data.status === "Failed") {
          updated.failed++;

          if (updated.waiting > 0) {
            updated.waiting--;
          }
        }

        return updated;
      });
    });

    return () => {
      socket.off("log");
    };
  }, []);

  useEffect(() => {
    socket.on("log", (data) => {
      console.log("📩 Log:", data);

      setStats((prev) => {
        const updated = { ...prev };

        switch (data.status) {
          case "Waiting":
            updated.waiting += 1;
            break;

          case "Sent":
            updated.sent += 1;

            if (updated.waiting > 0) {
              updated.waiting -= 1;
            }
            break;

          case "Failed":
            updated.failed += 1;

            if (updated.waiting > 0) {
              updated.waiting -= 1;
            }
            break;

          default:
            break;
        }

        return updated;
      });
    });

    return () => {
      socket.off("log");
    };
  }, []);

  return (
    <div className="dashboard">
      {!isConnected && qrImage && <QRModal qrImage={qrImage} />}

      <Sidebar />

      <div className="main">
        <Header isConnected={isConnected} handleLogout={logout} />
        
        <StatusCard
          totalContacts={contacts.length}
          selectedCount={selectedContacts.length}
          sentCount={0}
          failedCount={0}
          waitingCount={0}
          isConnected={isConnected}
        />

        <div className="content">
          <div className="left">
            <MessageBox
              message={message}
              setMessage={setMessage}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              removeImage={removeImage}
              previewUrl={previewUrl}
              error={error}
            />
          </div>

          <div className="right">
            <GroupList
              groups={groups}
              selectedGroups={selectedGroups}
              toggleGroup={toggleGroup}
              loading={groupsLoading}
            />
          </div>
        </div>

        <div className="contact-form">
          <ContactList
            contacts={contacts}
            deleteContact={deleteContact}
            selectedContacts={selectedContacts}
            toggleContact={toggleContact}
            addContact={addContact}
            importContacts={importContacts}
          />
        </div>

        <SendButton
          loading={loading}
          selectedCount={selectedContacts.length + selectedGroups.length}
          onSend={() => {
            if (selectedGroups.length > 0) {
              setStats({
                sent: 0,
                failed: 0,
                waiting: selectedGroups.length,
              });

              const selected = groups
                .filter((group) => selectedGroups.includes(group.id))
                .map((group) => ({
                  id: group.id,
                  name: group.name,
                }));

              sendGroupMessages(selected);
              return;
            }

            setStats({
              sent: 0,
              failed: 0,
              waiting: selectedContacts.length,
            });

            const selected = contacts.filter((contact) =>
              selectedContacts.includes(contact.id),
            );

            sendMessages(selected);
          }}
        />
        {/* 
        <ProgressBar
          completed={stats.sent + stats.failed}
          total={selectedContacts.length}
        /> */}

        <Logs />
      </div>
    </div>
  );
}
export default Dashboard;
