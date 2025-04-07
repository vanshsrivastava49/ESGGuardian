import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Upload from "./pages/Upload";
import Validate from "./pages/Validate";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
      <Route path="/" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/validate" element={<Validate />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />}/>
        <Route path="/login" element={<Login />}/>
      </Routes>
    </Router>
  );
};

export default App;