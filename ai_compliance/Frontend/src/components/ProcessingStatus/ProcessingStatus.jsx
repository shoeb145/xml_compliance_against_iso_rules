// src/components/ProcessingStatus/ProcessingStatus.jsx
import React from "react";
import "./ProcessingStatus.css";

const ProcessingStatus = ({ progress, currentRule, message }) => {
  return (
    <div className="processing fade-in">
      <h2>Analyzing Configuration</h2>
      <div className="processing-spinner"></div>
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-text">{progress}% Complete</div>
        {currentRule && (
          <div className="current-rule">
            <strong>Analyzing:</strong> {currentRule}
          </div>
        )}
        <div className="processing-message">{message}</div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
