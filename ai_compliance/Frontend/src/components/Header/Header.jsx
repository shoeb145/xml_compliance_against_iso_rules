// src/components/Header/Header.jsx
import React from "react";
import "./Header.css";
import CompliancePie from "../Charts/CompliancePie";

const Header = () => {
  return (
    <header className="app-header ">
      <div className="header-content pt-9">
        <h1>AI-Powered Compliance Checker</h1>
        <p className="subtitle">
          Analyze <span className="highlight-blue">Palo Alto XML Configs</span>{" "}
          Against ISO Controls
        </p>
        <p className="tagline">
          Get Instant Compliance Results with Evidence & Insights
        </p>
      </div>
    </header>
  );
};

export default Header;
