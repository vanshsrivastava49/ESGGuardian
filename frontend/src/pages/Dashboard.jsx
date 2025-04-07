import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [agreements, setAgreements] = useState([]);

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/agreements/all");
        setAgreements(res.data);
      } catch (error) {
        console.error("Error fetching agreements:", error);
      }
    };

    fetchAgreements();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: "1.75rem",
          color: "#2c7744",
          marginBottom: "1rem",
        }}
      >
        Uploaded ESG Agreements
      </h2>

      <table className="dashboard-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Company</th>
            <th>Validated</th>
            <th>File</th>
            <th>Blockchain Hash</th>
          </tr>
        </thead>
        <tbody>
          {agreements.length > 0 ? (
            agreements.map((a) => (
              <tr key={a._id}>
                <td>{a._id}</td>
                <td>{a.companyName}</td>
                <td>{a.validated ? "Yes" : "No"}</td>
                <td>
                  {a.filePath ? (
                    <a
                      href={`http://localhost:5000/${a.filePath.replace(/\\/g, "/")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1d4ed8", textDecoration: "underline" }}
                    >
                      View File
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{a.fileHash || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "1rem", color: "#64748b" }}>
                No agreements uploaded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
