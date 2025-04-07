import React, { useState } from "react";
import axios from "axios";
import { uploadAgreementToBlockchain } from "../blockchain/uploadToBlockchain";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file || !companyName) return setMessage("Please provide company name and file");
    const formData = new FormData();
    formData.append("agreement", file);
    formData.append("companyName", companyName);
    try {
      const response = await axios.post("http://localhost:5000/api/agreements/upload", formData);
      setMessage(`Upload successful! Agreement ID: ${response.data.agreementId}`);
      const fileHash = response.data.fileHash || "sampleHash";
      const blockchainResult = await uploadAgreementToBlockchain(fileHash, companyName, "Pending");
      console.log("Blockchain Upload Result:", blockchainResult);
    } catch (err) {
      console.error("Upload Error:", err.response?.data || err.message);
      setMessage("Upload failed");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Upload Agreement</h2>
      <input type="text" placeholder="Company Name" className="border p-2 mr-2" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mr-2" />
      <button onClick={handleUpload} className="px-4 py-2 bg-blue-500 text-white rounded">Upload</button>
      <p className="mt-3 text-red-500">{message}</p>
    </div>
  );
};

export default Upload;