// src/components/Results/Results.jsx
import React from "react";
import Summary from "./Summary";
import CompliantTable from "./CompliantTable";
import NonCompliantTable from "./NonCompliantTable";
import "./Results.css";

const Results = ({ results, onReset }) => {
  return (
    <div className="results fade-in">
      <h2>Compliance Analysis Report</h2>

      <Summary summary={results.summary} />

      <div className="results-tables">
        <CompliantTable compliantRules={results.results.compliant} />
        <NonCompliantTable nonCompliantRules={results.results.non_compliant} />
      </div>

      <button onClick={onReset} className="reset-button">
        Analyze Another Configuration
      </button>
    </div>
  );
};

export default Results;
