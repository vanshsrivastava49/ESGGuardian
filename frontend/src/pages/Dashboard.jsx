import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [agreements, setAgreements] = useState([]);

  useEffect(() => {
    const fetchAgreements = async () => {
      const res = await axios.get("http://localhost:5000/api/agreements/all");
      setAgreements(res.data);
    };
    fetchAgreements();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Uploaded Agreements</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Company</th>
            <th className="border p-2">Validated</th>
            <th className="border p-2">File Path</th>
            <th className="border p-2">Blockchain Hash</th>
          </tr>
        </thead>
        <tbody>
          {agreements.map((a) => (
            <tr key={a._id}>
              <td className="border p-2">{a._id}</td>
              <td className="border p-2">{a.companyName}</td>
              <td className="border p-2">{a.validated ? "Yes" : "No"}</td>
              <td className="border p-2">{a.filePath}</td>
              <td className="border p-2">{a.fileHash || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;