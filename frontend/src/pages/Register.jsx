import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Custom Axios instance pointing to your backend
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", form);
      setMessage("Registration successful ✅");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error("Registration Error:", err);
      setMessage(err.response?.data?.message || "Registration failed ❌");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <div className="logo">ESGGuardian</div>
          <h1>Create your account</h1>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit">Register</button>

            {message && <p className="message">{message}</p>}

            <div className="divider">
              <span>or</span>
            </div>

            <div className="signup-link">
              Already have an account? <a href="/login">Sign in</a>
            </div>
          </form>
        </div>

        <div className="login-image">
          <div className="image-content">
            <h2>Welcome to ESGGuardian</h2>
            <p>Secure your ESG journey with a platform designed for compliance, trust, and sustainability.</p>
            <p>Join a decentralized future of ESG transparency and accountability.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          font-family: "Outfit", sans-serif;
          margin: 0;
          margin-top:10px;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: #333;
        }

        .login-container {
          position: relative;
          display: flex;
          width: 900px;
          height: 600px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .login-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('https://plus.unsplash.com/premium_photo-1681400678259-255b10890b08?q=80&w=2079&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
          background-size: cover;
          background-position: center;
          opacity: 0.20;
          z-index: 0;
        }

        .login-form,
        .login-image {
          position: relative;
          z-index: 1;
        }

        .login-form {
          flex: 1;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
          margin-top: 30px;
          margin-left: 80px;
          color: #2c7744;
        }

        h1 {
          margin-bottom: 30px;
          font-size: 24px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }

        button {
          width: 100%;
          padding: 14px;
          background-color: #2c7744;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 20px;
        }

        .divider {
          text-align: center;
          margin: 10px 0;
          position: relative;
        }

        .divider::before {
          content: "";
          position: absolute;
          top: 20%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: #ddd;
          z-index: 1;
        }

        .divider span {
          background-color: #ddd;
          padding: 0 10px;
          position: relative;
          z-index: 2;
          font-weight: 500;
          color: #020202;
        }

        .signup-link {
          text-align: center;
          margin-top: 10px;
          font-size: 16px;
        }

        .signup-link a {
          color: #1c5b30;
          text-decoration: none;
          font-weight: 500;
        }

        .login-image {
          flex: 1;
          background: linear-gradient(135deg, #2c7744, #5a9367);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          padding: 40px;
        }

        .image-content h2 {
          font-size: 24px;
          margin-bottom: 30px;
          text-align: center;
        }

        .image-content p {
          font-size: 16px;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 30px;
        }

        .message {
          text-align: center;
          color: #2c7744;
          font-weight: 500;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
};

export default Register;
