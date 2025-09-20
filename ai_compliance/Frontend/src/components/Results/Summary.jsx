// src/components/Results/Summary.jsx
import React from "react";
import "./Summary.css";

const Summary = ({ summary }) => {
  return (
    <div className="summary">
      <h3>Executive Summary</h3>
      <div className="summary-grid">
        <div className="summary-item">
          <span className="label">Analysis Time</span>
          <span className="value">{summary.time_taken_sec}s</span>
        </div>
        <div className="summary-item">
          <span className="label">Total Controls</span>
          <span className="value">{summary.total_rules}</span>
        </div>
        <div className="summary-item compliant">
          <span className="label">Compliant</span>
          <span className="value">{summary.compliant_rules}</span>
        </div>
        <div className="summary-item non-compliant">
          <span className="label">Non-Compliant</span>
          <span className="value">{summary.non_compliant_rules}</span>
        </div>
        <div className="summary-item score">
          <span className="label">Compliance Score</span>
          <span className="value">{summary.compliance_score}%</span>
        </div>
      </div>
    </div>
  );
};

export default Summary;
