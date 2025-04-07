import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="home-title">Welcome to ESGGuardian</h1>
        <p className="home-subtitle">
          Revolutionizing ESG Compliance with Blockchain Transparency.
        </p>
        <div className="home-buttons">
          <Link to="/register" className="home-btn">Get Started</Link>
          <Link to="/dashboard" className="home-btn secondary">View Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
