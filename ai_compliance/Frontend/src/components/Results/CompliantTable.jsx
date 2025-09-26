// src/components/Results/CompliantTable.jsx
import React from "react";
import "./Tables.css";

const CompliantTable = ({ compliantRules }) => {
  const headers = [
    { label: "Control ID", key: "control_id" },
    { label: "Control Name", key: "control_name" },
    { label: "Description", key: "control_description" },
    { label: "Reasoning", key: "reasoning" },
    { label: "Status", key: "status" },
  ];

  return (
    <div className="compliant-table">
      <h3>
        ✅ Compliant Controls ({compliantRules.length}){" "}
        <svg
          title="Stack Overflow"
          data-slot="icon"
          fill="none"
          stroke-width="1.5"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
          ></path>
        </svg>
      </h3>

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
