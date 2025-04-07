import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      setMessage(res.data.message || "Registration successful ✅");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error("Registration Error:", err);
      setMessage(err.response?.data?.message || "Registration failed ❌");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          name="name"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="register-input"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="register-input"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="register-input"
          required
        />
        <button type="submit" className="register-button">
          Register
        </button>
      </form>
      {message && <p className="register-message">{message}</p>}
    </div>
  );
};

export default Register;
