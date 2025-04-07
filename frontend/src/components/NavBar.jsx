import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold">ESGGuardian</h1>
      <div className="space-x-4">
        <Link to="/upload" className="hover:underline">Upload</Link>
        <Link to="/validate" className="hover:underline">Validate</Link>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/register" className="hover:underline">Register</Link>
        <Link to="/login" className="hover:underline">Login</Link>
        <Link to="/login" className="hover:underline">Logout</Link>
      </div>
    </nav>
  );
};

export default Navbar;