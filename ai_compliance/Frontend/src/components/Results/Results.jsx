// src/components/Results/Results.jsx
import React, { useEffect, useState, useRef } from "react";
import Summary from "./Summary";
import CompliantTable from "./CompliantTable";
import NonCompliantTable from "./NonCompliantTable";
import "./Results.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import CompliancePie from "../Charts/CompliancePie.jsx";
import BarChart1 from "../Charts/BarChart.jsx";
import Section from "../Sections/Section.jsx";
import { CSVLink, CSVDownload } from "react-csv";

const Results = ({ results, onReset, taskId, setResults }) => {
  const [pieValue, setPieValue] = useState({
    compliant: 0,
    noEvidence: 0,
    notRelevant: 0,
    evidence: 0,
  });
  const [section, setSection] = useState({});
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const printRef = useRef(null);
  const headers = [
    { label: "Control ID", key: "control_id" },
    { label: "Control Name", key: "control_name" },
    { label: "Description", key: "control_description" },
    { label: "Reasoning", key: "reasoning" },
    { label: "Status", key: "status" },
    { label: "Check", key: "check" },
  ];
  const [expandAll, setExpandAll] = useState(false);
  const onImageUpload = (updatedResult) => {
    console.log(results);
    if (updatedResult.updated_rule.status !== "Compliant") return;

    setResults((prev) => {
      const updatedNonCompliant = prev.results.non_compliant.filter(
        (section) =>
          section.control_name !== updatedResult.updated_rule.control_name
      );

      const movingSection = prev.results.non_compliant.find(
        (section) =>
          section.control_name === updatedResult.updated_rule.control_name
      );

      if (!movingSection) return prev; // safety check

      // Update its status & reasoning
      const updatedSection = {
        ...movingSection,
        status: updatedResult.updated_rule.status,
        reasoning: updatedResult.updated_rule.reasoning,
        check: "manual",
      };

      const updatedCompliant = [...prev.results.compliant, updatedSection];

      // 🧮 Update summary
      const totalRules =
        prev.summary.total_rules ||
        prev.results.compliant.length + prev.results.non_compliant.length;
      const compliantRules = updatedCompliant.length;
      const nonCompliantRules = updatedNonCompliant.length;

      const complianceScore = ((compliantRules / totalRules) * 100).toFixed(1);

      return {
        ...prev,
        results: {
          compliant: updatedCompliant,
          non_compliant: updatedNonCompliant,
        },
        summary: {
          ...prev.summary,
          compliant_rules: compliantRules,
          non_compliant_rules: nonCompliantRules,
          total_rules: totalRules,
          compliance_score: parseFloat(complianceScore),
        },
      };
    });
  };

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
  useEffect(() => {
    if (loadingPdf) {
      // Disable scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scrolling
      document.body.style.overflow = "auto";
    }

    // Cleanup just in case
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [loadingPdf]);

  const handleDownloadPdf = async () => {
    setLoadingPdf(true);
    setExpandAll(true);

    if (!printRef.current) return;
    try {
      // Save current expanded state
      const prevExpanded = { ...expandedSections };

      // Open all sections temporarily
      const allExpanded = {};
      Object.values(section).forEach(
        (data) => (allExpanded[data.sectionNumber] = true)
      );
      setExpandedSections(allExpanded);

      // Wait a tick to

      // Wait a tick to let React render all expanded sections
      await new Promise((resolve) => setTimeout(resolve, 100));

      const pdf = new jsPDF("p", "px", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const container = printRef.current;

      // Clone container to avoid messing with live DOM
      const clone = container.cloneNode(true);
      clone.style.position = "absolute";
      clone.style.left = "-9999px"; // off-screen
      clone.style.width = container.offsetWidth + "px";
      document.body.appendChild(clone);

      // Hide unwanted elements
      clone
        .querySelectorAll(".modal, .modal-backdrop, dialog")
        .forEach((el) => {
          el.style.display = "none";
        });

      // Capture full height
      const totalHeight = clone.scrollHeight;
      const scale = 1; // higher resolution
      const pageHeightPx = (pdfHeight / pdfWidth) * clone.offsetWidth;

      let yOffset = 0;
      let isFirstPage = true;

      while (yOffset < totalHeight) {
        const canvas = await html2canvas(clone, {
          scale,
          useCORS: true,
          backgroundColor: "#0a1829",
          y: yOffset,
          height: pageHeightPx,
          windowWidth: clone.scrollWidth,
          windowHeight: pageHeightPx,
          ignoreElements: (el) =>
            el.classList.contains("modal") ||
            el.classList.contains("modal-backdrop") ||
            el.classList.contains("no-print"),
        });

        const imgData = canvas.toDataURL("image/png");
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth;
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (!isFirstPage) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

        yOffset += pageHeightPx;
        isFirstPage = false;
      }

      clone.remove(); // clean up
      pdf.save("ComplianceReport.pdf");
      setExpandedSections(prevExpanded);
      setLoadingPdf(false);
      setExpandAll(false);
    } catch (error) {
      setExpandedSections(prevExpanded);
      setLoadingPdf(false);
      setExpandAll(false);
      console.lof(error);
    }
  };

  return (
    <>
      {loadingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <span className=" text-xl bg-gradient-to-r from-[#19c9c6] via-[#19c9c6] to-[rgb(3,249,179)] text-transparent bg-clip-text  ">
            Generating PDF...
          </span>
        </div>
      )}

      <div
        ref={printRef}
        className={` ${
          loadingPdf ? "overflow-y-hidden" : ""
        } results fade-in  `}
      >
        <div className="pdf-page-section flex justify-between items-center mb-6 border-b-[1px] border-[--border-light] pb-2 ">
          <img
            src="/frontend/macksofy_white.png"
            className="h-10 ml-3 object-cover"
            alt="Logo"
          />
          <h2 className="mb-0">Compliance Analysis Report</h2>

          <CSVLink
            data={allControls || []}
            headers={headers}
            onClick={handleDownloadPdf}
            filename={"Compliance-Analysis-Report.csv"}
            className={` no-print flex w-36  justify-center items-center h-8 border border-zinc-700 bg-gradient-to-r from-[#19c9c6] via-[#19c9c6] to-[rgb(3,249,179)] text-transparent bg-clip-text  rounded-3xl text-sm font-medium hover:text-slate-900 hover:bg-clip-padding  hover:ease-in-out hover:duration-300 hover:transition-colors`}
            target="_blank"
          >
            Export to CSV/PDF
          </CSVLink>
        </div>
        <Summary summary={results.summary} className=" pdf-page-section" />

        <div className="results-tables flex flex-col ">
          {/* <CompliantTable compliantRules={results.results.compliant} />
        <NonCompliantTable nonCompliantRules={results.results.non_compliant} /> */}
          <div className=" flex lg:flex-col xl:flex-row md:flex-col items-center justify-center gap-12 pdf-page-section">
            <CompliancePie pieValue={pieValue} />

            <BarChart1 value={section} />
          </div>
          <div>
            <Section
              sectionData={section}
              taskId={taskId}
              onImageUpload={onImageUpload}
              expandAll={expandAll}
              expanded={expandedSections}
              setExpanded={setExpandedSections}
            />
          </div>
        </div>

        <button onClick={onReset} className={`no-print reset-button`}>
          Analyze Another Configuration
        </button>
      </div>
    </>
  );
};

export default Results;
