import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

// Custom Axios instance pointing to your backend
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Adjust if your backend URL is different
});

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token); // Store JWT token
      setMessage("Login successful ✅");
      
      // Optional: Redirect to dashboard or upload page after login
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Login Error:", err);
      setMessage(err.response?.data?.message || "Login failed ❌");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border w-full p-2 rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border w-full p-2 rounded"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Login
        </button>
      </form>
      {message && <p className="mt-3 text-red-500">{message}</p>}
    </div>
  );
};

export default Login;
