import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

const Navbar = () => {
  return (
          <nav className="navbar">
          <h1 className="navbar-logo">ESGGuardian</h1>
          <div className="navbar-links">
            <Link to="/upload">Upload</Link>
            <Link to="/validate">Validate</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
            <Link to="/login">Logout</Link>
            </div>
          </nav>
  );
};

export default Navbar;