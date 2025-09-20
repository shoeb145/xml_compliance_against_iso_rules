// src/components/Error/Error.jsx
import React from "react";
import "./Error.css";

const Error = ({ error, onReset }) => {
  return (
    <div className="error fade-in">
      <h2>Analysis Error</h2>
      <p>{error}</p>
      <button onClick={onReset}>Try Again</button>
    </div>
  );
};

export default Error;
