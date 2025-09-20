// src/components/Results/CompliantTable.jsx
import React from "react";
import "./Tables.css";

const CompliantTable = ({ compliantRules }) => {
  return (
    <div className="compliant-table">
      <h3>✅ Compliant Controls ({compliantRules.length})</h3>
      {compliantRules.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Control ID</th>
                <th>Control Name</th>
                <th>Compliance Reasoning</th>
                <th>Supporting Evidence</th>
              </tr>
            </thead>
            <tbody>
              {compliantRules.map((rule, index) => (
                <tr key={index}>
                  <td>{rule.control_id}</td>
                  <td>{rule.control_name}</td>
                  <td className="reasoning-cell">{rule.reasoning}</td>
                  <td>
                    {rule.evidence && rule.evidence.length > 0 ? (
                      <div className="evidence">
                        {rule.evidence.map((evidence, idx) => (
                          <div key={idx} className="evidence-item">
                            <div>
                              <strong>Path:</strong> {evidence.path}
                            </div>
                            <div>
                              <strong>Value:</strong> {evidence.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "No specific evidence"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-results">
          <p>No compliant controls found in this configuration.</p>
        </div>
      )}
    </div>
  );
};

export default CompliantTable;
