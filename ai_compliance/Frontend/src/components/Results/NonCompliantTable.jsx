// src/components/Results/NonCompliantTable.jsx
import React from "react";
import "./Tables.css";

const NonCompliantTable = ({ nonCompliantRules }) => {
  return (
    <div className="non-compliant-table">
      <h3>❌ Non-Compliant Controls ({nonCompliantRules.length})</h3>
      {nonCompliantRules.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Control ID</th>
                <th>Control Name</th>
                <th>Compliance Issue</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {nonCompliantRules.map((rule, index) => (
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
          <p>Excellent! No non-compliant controls found.</p>
        </div>
      )}
    </div>
  );
};

export default NonCompliantTable;
