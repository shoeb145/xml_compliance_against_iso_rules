// src/components/Results/Results.jsx
import React, { useEffect, useState } from "react";
import Summary from "./Summary";
import CompliantTable from "./CompliantTable";
import NonCompliantTable from "./NonCompliantTable";
import "./Results.css";

import CompliancePie from "../Charts/CompliancePie.jsx";
import BarChart1 from "../Charts/BarChart.jsx";
import Section from "../Sections/Section.jsx";

const Results = ({ results, onReset }) => {
  const [pieValue, setPieValue] = useState({
    compliant: 0,
    noEvidence: 0,
    notRelevant: 0,
    evidence: 0,
  });
  const [section, setSection] = useState({});

  const allControls = [
    ...results.results.non_compliant,
    ...results.results.compliant,
  ];

  const getSectionName = (sectionNum) => {
    switch (sectionNum) {
      case "4":
        return "Organizational Context & Scope";
      case "5":
        return "Leadership & Management Commitment";
      case "6":
        return "Risk Management & Planning";
      case "7":
        return "Resources & Competence";
      case "8":
        return "Operational Controls & Implementation";
      case "9":
        return "Monitoring & Performance Review";
      case "10":
        return "Continuous Improvement & Corrective Action";
      default:
        return "Unknown Section";
    }
  };

  useEffect(() => {
    if (!results) return;
    const Noevidence = results.results.non_compliant.filter(
      (item) =>
        typeof item.reasoning === "string" &&
        item.reasoning.includes("No evidence found in XML for this rule.")
    ).length;
    const noRelevant = results.results.non_compliant.filter(
      (item) =>
        typeof item.reasoning === "string" &&
        item.reasoning.includes("Rule not relevant to XML configuration.")
    ).length;
    const compliant = results?.results?.compliant?.length;
    const evidence =
      results.results.non_compliant.length - (Noevidence + noRelevant);
    setPieValue({ compliant, Noevidence, noRelevant, evidence });
    const tempSections = {};

    allControls.forEach((item) => {
      const sectionNum = item.control_name.split(".")[0];

      if (!tempSections[sectionNum]) {
        tempSections[sectionNum] = {
          sectionName: getSectionName(sectionNum),
          sectionNumber: sectionNum,
          controls: [],
          compliant: 0,
          failed: 0,
        };
      }
      tempSections[sectionNum].controls.push(item);
      if (item.status === "Compliant") {
        tempSections[sectionNum].compliant++;
      } else {
        tempSections[sectionNum].failed++;
      }
    });
    setSection(tempSections);
  }, [results]);
  console.log(section);
  console.log(results);

  return (
    <div className="results fade-in">
      <h2>Compliance Analysis Report</h2>

      <Summary summary={results.summary} />

      <div className="results-tables flex flex-col">
        {/* <CompliantTable compliantRules={results.results.compliant} />
        <NonCompliantTable nonCompliantRules={results.results.non_compliant} /> */}
        <div className="flex lg:flex-col xl:flex-row md:flex-col items-center justify-center gap-12">
          <CompliancePie pieValue={pieValue} />

          <BarChart1 value={section} />
        </div>
        <div>
          <Section sectionData={section} />
        </div>
      </div>

      <button onClick={onReset} className="reset-button">
        Analyze Another Configuration
      </button>
    </div>
  );
};

export default Results;
