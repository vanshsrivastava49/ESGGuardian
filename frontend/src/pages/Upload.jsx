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
  const [esgStatus] = useState("Compliant"); // You can allow user to select later

  const handleUpload = async () => {
    if (!file || !companyName) return setMessage("Please provide company name and file");

    try {
      // 1. Calculate file hash
      const fileHash = await calculateFileHash(file);

      // 2. Upload to backend
      const formData = new FormData();
      formData.append("agreement", file);
      formData.append("companyName", companyName);
      const response = await axios.post("http://localhost:5000/api/agreements/upload", formData);
      console.log("Backend response: ",response.data);
      setMessage(`✅ Uploaded! ID: ${response.data.agreementId}`);

      // 3. Upload to blockchain
      const blockchainResult = await uploadAgreementToBlockchain(fileHash, companyName, esgStatus);
      if (blockchainResult.success) {
        setMessage((prev) => prev + `\n🧾 Blockchain Tx: ${blockchainResult.txHash}`);
      } else {
        setMessage((prev) => prev + `\n⚠️ Blockchain Error: ${blockchainResult.error}`);
      }

    } catch (err) {
      console.error("Upload Error:", err);
      setMessage("❌ Upload failed");
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
