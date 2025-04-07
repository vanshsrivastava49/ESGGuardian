import React, { useState } from "react";
import axios from "axios";
import "./Validate.css";

const Validate = () => {
  const [agreementId, setAgreementId] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleValidate = async () => {
    setMessage("");
    setResult(null);

    if (!agreementId.trim()) {
      setMessage("Please enter an Agreement ID.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/agreements/validate", {
        agreementId,
      });
      setResult(res.data);
      setMessage("✅ Validation successful");
    } catch (error) {
      setMessage("❌ Validation failed");
      setResult(null);
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

      {result && (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1rem",
            marginTop: "1.5rem",
            borderRadius: "14px",
            boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
          }}
        >
          <h4 style={{ color: "#2c7744", marginBottom: "1rem" }}>Agreement Details</h4>
          <p><strong>Message:</strong> {result.message || "Validated"}</p>
          {result.company && <p><strong>Company:</strong> {result.company}</p>}
          {result.status && <p><strong>Status:</strong> {result.status}</p>}
          {result.compliance && <p><strong>Compliance:</strong> {result.compliance}</p>}
          {result.timestamp && <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>}
        </div>
      )}
    </div>
  );
};

export default Validate;
