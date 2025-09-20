// src/components/Header/Header.jsx
import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <header className="app-header">
      <h1>IsOCheckAI</h1>
      <p>AI-Powered Compliance Checker</p>
      <p className="subtitle">
        Analyze Palo Alto XML Configs Against ISO Controls
      </p>
      <p className="tagline">
        Get Instant Compliance Results with Evidence & Insights
      </p>
    </header>
  );
};

export default Header;
