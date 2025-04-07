import React, { useState } from "react";
import axios from "axios";

const Validate = () => {
  const [agreementId, setAgreementId] = useState("");
  const [result, setResult] = useState(null);

  const handleValidate = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/agreements/validate", { agreementId });
      setResult(res.data);
    } catch (error) {
      setResult({ message: "Validation failed" });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Validate Agreement</h2>
      <input
        type="text"
        value={agreementId}
        onChange={(e) => setAgreementId(e.target.value)}
        placeholder="Enter Agreement ID"
        className="border p-2 rounded"
      />
      <button onClick={handleValidate} className="ml-2 px-4 py-2 bg-green-500 text-white rounded">
        Validate
      </button>
      {result && (
        <div className="mt-4">
          <p className="font-medium">Result: {result.message || "Validated"}</p>
        </div>
      )}
    </div>
  );
};

export default Validate;