import { useRef, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import "./ContactList.css";
import ContactItem from "./ContactItem";
import ContactForm from "../ContactForm/ContactForm";

const normalizePhoneValue = (value) => {
  const digits = `${value ?? ""}`.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  if (digits.length > 12) {
    return digits.startsWith("91") ? digits.slice(0, 12) : digits.slice(-12);
  }

  return digits;
};

function ContactList({ contacts, deleteContact, selectedContacts, toggleContact, addContact, importContacts }) {
  const csvInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const buildPreviewRows = (rows) => {
    const existingPhones = new Set(contacts.map((contact) => contact.phone));
    const preview = [];

    rows.forEach((row, index) => {
      const nameValue = row?.name ?? row?.Name ?? row?.Name ?? "";
      const phoneValue = row?.phone ?? row?.Phone ?? row?.Phone ?? "";
      const normalizedName = `${nameValue}`.trim();
      const normalizedPhone = normalizePhoneValue(phoneValue);

      let status = "valid";

      if (!normalizedName || !normalizedPhone) {
        status = "invalid";
      } else if (existingPhones.has(normalizedPhone)) {
        status = "duplicate";
      } else {
        existingPhones.add(normalizedPhone);
      }

      preview.push({
        id: `${index}-${Date.now()}`,
        name: normalizedName,
        phone: normalizedPhone,
        rawName: `${nameValue}`.trim(),
        rawPhone: `${phoneValue}`.trim(),
        status,
      });
    });

    return preview;
  };

  const parseFile = async (file) => {
    if (!file) {
      return;
    }

    setIsProcessing(true);
    setStatusMessage({ type: "", text: "" });
    setPreviewRows([]);

    try {
      let parsedRows = [];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".csv")) {
        const result = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: resolve,
            error: reject,
          });
        });

        parsedRows = result.data || [];
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      } else {
        throw new Error("Please upload a CSV or Excel file.");
      }

      const preview = buildPreviewRows(parsedRows);
      setPreviewRows(preview);

      const validCount = preview.filter((row) => row.status === "valid").length;
      const duplicateCount = preview.filter((row) => row.status === "duplicate").length;
      const invalidCount = preview.filter((row) => row.status === "invalid").length;

      setStatusMessage({
        type: validCount ? "info" : "error",
        text: `${validCount} ready to import • ${duplicateCount} duplicate • ${invalidCount} invalid`,
      });
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: error.message || "Unable to read the selected file.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    const validRows = previewRows.filter((row) => row.status === "valid");

    if (!validRows.length) {
      setStatusMessage({ type: "error", text: "No valid contacts are ready to import." });
      return;
    }

    const summary = importContacts(
      validRows.map((row) => ({
        name: row.name,
        phone: row.phone,
      })),
    );

    const duplicateCount = previewRows.filter((row) => row.status === "duplicate").length;
    const invalidCount = previewRows.filter((row) => row.status === "invalid").length;

    setPreviewRows([]);
    setStatusMessage({
      type: "success",
      text: `Imported ${summary.imported} contacts. Duplicates: ${duplicateCount}. Invalid: ${invalidCount}.`,
    });
  };

  const downloadSampleCsv = () => {
    const content = "Name,Phone\nAbhijeet,919372870702\nRahul,919876543211\nSneha,919812345678\n";
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample-contacts.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Name", "Phone"],
      ["Abhijeet", "919372870702"],
      ["Rahul", "919876543211"],
      ["Sneha", "919812345678"],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample-contacts.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="contact-list">
      <div className="contact-section-header">
        <h2>Contacts</h2>
        <p>Manage contacts manually or import them in bulk.</p>
      </div>

      <div className="contact-panel">
        <ContactForm addContact={addContact} />

        <div className="import-card">
          <div className="import-card-header">
            <div>
              <h3>Import Contacts</h3>
              <p>Upload CSV or Excel files with Name and Phone columns.</p>
            </div>
            <div className="import-actions">
              <button type="button" className="secondary-btn" onClick={downloadSampleCsv}>
                Sample CSV
              </button>
              <button type="button" className="secondary-btn" onClick={downloadSampleExcel}>
                Sample Excel
              </button>
            </div>
          </div>

          <div
            className={`dropzone ${isDragging ? "dragging" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) {
                parseFile(file);
              }
            }}
          >
            <p>Drag and drop your file here or use the upload buttons below.</p>
            <div className="upload-buttons">
              <button type="button" className="primary-btn" onClick={() => csvInputRef.current?.click()}>
                Import CSV
              </button>
              <button type="button" className="primary-btn" onClick={() => excelInputRef.current?.click()}>
                Import Excel (.xlsx)
              </button>
            </div>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  parseFile(file);
                }
                event.target.value = "";
              }}
            />
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  parseFile(file);
                }
                event.target.value = "";
              }}
            />
          </div>

          {isProcessing && (
            <div className="progress-card">
              <div className="progress-bar" />
              <span>Processing file...</span>
            </div>
          )}

          {statusMessage.text && (
            <div className={`status-alert ${statusMessage.type}`}>{statusMessage.text}</div>
          )}

          {previewRows.length > 0 && (
            <div className="preview-section">
              <div className="preview-header">
                <h4>Preview</h4>
                <button type="button" className="primary-btn" onClick={handleImport}>
                  Import
                </button>
              </div>

              <div className="preview-table-wrap">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.rawName || row.name}</td>
                        <td>{row.phone}</td>
                        <td>
                          <span className={`status-pill ${row.status}`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="invalid-list">
                <h5>Invalid Rows</h5>
                {previewRows.filter((row) => row.status === "invalid").length > 0 ? (
                  <ul>
                    {previewRows
                      .filter((row) => row.status === "invalid")
                      .map((row) => (
                        <li key={row.id}>{row.rawName || "Unnamed row"} — {row.rawPhone || "Missing phone"}</li>
                      ))}
                  </ul>
                ) : (
                  <p>No invalid rows.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="contact-list-items">
        {contacts.map((contact) => (
          <ContactItem
            key={contact.id}
            contact={contact}
            deleteContact={deleteContact}
            selectedContacts={selectedContacts}
            toggleContact={toggleContact}
          />
        ))}
      </div>
    </div>
  );
}

export default ContactList;