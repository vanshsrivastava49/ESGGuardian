import React, { useState } from "react";
import axios from "axios";
import { uploadAgreementToBlockchain } from "../blockchain/uploadToBlockchain";
import "./Upload.css";

// Function to calculate SHA-256 file hash
const calculateFileHash = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};

const Upload = () => {
  const [companyName, setCompanyName] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [esgStatus] = useState("Compliant");

  const handleUpload = async () => {
    if (!file || !companyName) return setMessage("Please provide company name and file");

    try {
      // 1️⃣ Calculate file hash
      const fileHash = await calculateFileHash(file);

      // 2️⃣ Upload to blockchain first
      setMessage("⛓️ Uploading to blockchain...");
      const blockchainResult = await uploadAgreementToBlockchain(fileHash, companyName, esgStatus);

      if (!blockchainResult.success) {
        setMessage(`❌ Blockchain Error: ${blockchainResult.error}`);
        return;
      }

      // 3️⃣ Upload file to backend (MongoDB)
      setMessage("📤 Uploading file to server...");
      const formData = new FormData();
      formData.append("agreement", file);
      formData.append("companyName", companyName);
      formData.append("fileHash", fileHash); // now passing hash

      const response = await axios.post("http://localhost:5000/api/agreements/upload", formData);

      setMessage(
        `✅ Upload complete!\n🧾 Tx Hash: ${blockchainResult.txHash}\n📁 File ID: ${response.data.agreementId}`
      );

    } catch (err) {
      console.error("Upload Error:", err);
      setMessage("❌ Upload failed. Check console.");
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-heading">Upload Agreement</h2>
      <input
        type="text"
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className="upload-input"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="upload-file"
      />
      <button onClick={handleUpload} className="upload-button">
        Upload
      </button>
      {message && <p className="upload-message">{message}</p>}
    </div>
  );
};

export default Upload;
