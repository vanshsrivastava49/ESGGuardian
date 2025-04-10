import React, { useState } from "react";
import axios from "axios";
import { getAgreementByFileHash } from "../blockchain/web3"; // ✅ Web3 logic
import "./Validate.css";

const Validate = () => {
  const [agreementId, setAgreementId] = useState("");
  const [blockchainData, setBlockchainData] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleValidate = async () => {
    setMessage("");
    setBlockchainData(null);
    setMlResult(null);

    if (!agreementId.trim()) {
      setMessage("Please enter an Agreement ID (file hash).");
      return;
    }

    try {
      // ✅ Step 1: Get agreement metadata from blockchain
      const blockchainRes = await getAgreementByFileHash(agreementId);
      setBlockchainData(blockchainRes);

      // ✅ Step 2: Send to Flask API for ML validation
      const mlRes = await axios.post(
        "http://localhost:5000/api/agreements/validate",
        { agreementId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setMlResult(mlRes.data);

      setMessage("Validation successful!");
    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(`Validation failed: ${error.response.data.error}`);
      } else {
        setMessage("Validation failed: Server or blockchain error");
      }
    }
  };

  return (
    <div className="validate-section">
      <h2>Validate ESG Agreement</h2>

      <input
        type="text"
        value={agreementId}
        onChange={(e) => setAgreementId(e.target.value)}
        placeholder="Enter Agreement ID"
      />

      <button onClick={handleValidate}>Validate</button>

      {message && (
        <p style={{ textAlign: "center", marginTop: "1rem", fontWeight: "500" }}>{message}</p>
      )}

      {blockchainData && (
        <div className="blockchain-result">
          <h3>📦 Blockchain Metadata</h3>
          <p><strong>File Hash:</strong> {blockchainData.fileHash}</p>
          <p><strong>Company:</strong> {blockchainData.companyName}</p>
          <p><strong>Uploader:</strong> {blockchainData.uploader}</p>
          <p><strong>Validated:</strong> {blockchainData.validated ? "Yes" : "No"}</p>
          <p><strong>Timestamp:</strong> {new Date(blockchainData.timestamp * 1000).toLocaleString()}</p>
        </div>
      )}

      {mlResult && (
        <div className="ml-result">
          <h3>🤖 ESG ML Validation</h3>
          <p><strong>Agreement ID:</strong> {agreementId}</p>
          <p><strong>ESG Score:</strong> {mlResult.esg_score}</p>
          <p><strong>Violated Norms:</strong></p>
          <ul>
            {mlResult.violated_norms?.map((norm, idx) => (
              <li key={idx}>{norm}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Validate;
