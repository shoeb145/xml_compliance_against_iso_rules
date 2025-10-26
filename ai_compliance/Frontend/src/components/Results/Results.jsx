// src/components/Results/Results.jsx
import React, { useEffect, useState, useRef } from "react";
import Summary from "./Summary";
import CompliantTable from "./CompliantTable";
import NonCompliantTable from "./NonCompliantTable";
import "./Results.css";
import jsPDF from "jspdf";
import CompliancePie from "../Charts/CompliancePie.jsx";
import BarChart1 from "../Charts/BarChart.jsx";
import Section from "../Sections/Section.jsx";
import { CSVLink } from "react-csv";
import html2canvas from "html2canvas";

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

      if (!movingSection) return prev;

      const updatedSection = {
        ...movingSection,
        status: updatedResult.updated_rule.status,
        reasoning: updatedResult.updated_rule.reasoning,
        check: "manual",
      };

      const updatedCompliant = [...prev.results.compliant, updatedSection];

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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [loadingPdf]);

  // Update your handleDownloadPdf function:
  const handleDownloadPdf = async () => {
    console.log("🎯 PDF BUTTON CLICKED - Starting PDF generation");

    try {
      setLoadingPdf(true);
      console.log("✅ Loading state set to true");

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      console.log("✅ PDF created, adding content...");

      // ===== HEADER =====
      pdf.setFillColor(10, 24, 41);
      pdf.rect(0, 0, pageWidth, 50, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont(undefined, "bold");
      pdf.text("COMPLIANCE ANALYSIS REPORT", pageWidth / 2, 25, {
        align: "center",
      });
      pdf.setFontSize(12);
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        35,
        { align: "center" }
      );
      yPosition = 60;

      // ===== EXECUTIVE SUMMARY =====
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont(undefined, "bold");
      pdf.text("EXECUTIVE SUMMARY", 20, yPosition);
      yPosition += 15;

      const summaryData = [
        {
          label: "Total Controls",
          value: results.summary.total_rules,
          color: { r: 74, g: 144, b: 226 },
        },
        {
          label: "Compliant",
          value: results.summary.compliant_rules,
          color: { r: 34, g: 197, b: 94 },
        },
        {
          label: "Non-Compliant",
          value: results.summary.non_compliant_rules,
          color: { r: 239, g: 68, b: 68 },
        },
        {
          label: "Compliance Score",
          value: `${results.summary.compliance_score}%`,
          color: { r: 168, g: 85, b: 247 },
        },
      ];

      summaryData.forEach((item, index) => {
        const x = 20 + index * 45;
        pdf.setFillColor(item.color.r, item.color.g, item.color.b);
        pdf.roundedRect(x, yPosition, 40, 25, 3, 3, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(item.label, x + 20, yPosition + 8, { align: "center" });
        pdf.setFontSize(10);
        pdf.setFont(undefined, "bold");
        pdf.text(item.value.toString(), x + 20, yPosition + 18, {
          align: "center",
        });
      });

      yPosition += 40;

      // ===== COMPLIANCE OVERVIEW - CHARTS =====
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont(undefined, "bold");
      pdf.text("COMPLIANCE OVERVIEW", 20, yPosition);
      yPosition += 20;

      try {
        // Create chart images using html2canvas of the actual rendered components
        const pieChartElement = document.querySelector(".recharts-wrapper"); // Select the actual pie chart
        const barChartElement = document.querySelector(
          ".recharts-responsive-container"
        ); // Select the actual bar chart

        let pieChartImg, barChartImg;

        if (pieChartElement) {
          const canvas = await html2canvas(pieChartElement, {
            backgroundColor: "#ffffff",
            scale: 2, // Higher quality
            logging: false,
          });
          pieChartImg = canvas.toDataURL("image/png");
        }

        if (barChartElement) {
          const canvas = await html2canvas(barChartElement, {
            backgroundColor: "#ffffff",
            scale: 2, // Higher quality
            logging: false,
          });
          barChartImg = canvas.toDataURL("image/png");
        }

        // Add charts to PDF
        if (pieChartImg) {
          pdf.addImage(pieChartImg, "PNG", 20, yPosition, 85, 100);
        }

        if (barChartImg) {
          pdf.addImage(barChartImg, "PNG", 110, yPosition, 85, 100);
        }

        yPosition += 110;
      } catch (chartError) {
        console.warn("Chart generation failed, using fallback:", chartError);
        // Fallback: Simple text representation
        pdf.setFontSize(12);
        pdf.text("Compliance Distribution:", 20, yPosition);
        pdf.setFontSize(10);
        pdf.text(`- Compliant: ${pieValue.compliant}`, 25, yPosition + 6);
        pdf.text(
          `- Insufficient Evidence: ${pieValue.evidence}`,
          25,
          yPosition + 12
        );
        pdf.text(`- No Evidence: ${pieValue.Noevidence}`, 25, yPosition + 18);
        pdf.text(`- Not Relevant: ${pieValue.noRelevant}`, 25, yPosition + 24);
        yPosition += 40;
      }

      // Add detailed legend section after charts
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.text("Chart Legend", 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(8);
      pdf.setFont(undefined, "normal");

      // Pie Chart Legend
      pdf.text("Pie Chart Colors:", 25, yPosition);
      yPosition += 5;

      const pieLegendDetails = [
        {
          color: "#009990",
          label: "Compliant - Controls that meet requirements",
        },
        {
          color: "#ED3F27",
          label: "Insufficient Evidence - Some evidence but not conclusive",
        },
        {
          color: "#FEB21A",
          label: "No Evidence Found - No supporting evidence in XML",
        },
        {
          color: "#6b7280",
          label: "Not Relevant - Control not applicable to XML configuration",
        },
      ];

      pieLegendDetails.forEach((item, index) => {
        const lineY = yPosition + index * 4;

        // Color box
        pdf.setFillColor(
          parseInt(item.color.slice(1, 3), 16),
          parseInt(item.color.slice(3, 5), 16),
          parseInt(item.color.slice(5, 7), 16)
        );
        pdf.rect(30, lineY - 1, 3, 3, "F");

        // Label
        pdf.text(item.label, 35, lineY + 1);
      });

      yPosition += pieLegendDetails.length * 4 + 8;

      // Bar Chart Legend
      pdf.text("Bar Chart Colors:", 25, yPosition);
      yPosition += 5;

      const barLegendDetails = [
        {
          color: "#82ca9d",
          label: "Compliant - Number of compliant controls per section",
        },
        {
          color: "#8884d8",
          label: "Failed - Number of non-compliant controls per section",
        },
      ];

      barLegendDetails.forEach((item, index) => {
        const lineY = yPosition + index * 4;

        // Color box
        pdf.setFillColor(
          parseInt(item.color.slice(1, 3), 16),
          parseInt(item.color.slice(3, 5), 16),
          parseInt(item.color.slice(5, 7), 16)
        );
        pdf.rect(30, lineY - 1, 3, 3, "F");

        // Label
        pdf.text(item.label, 35, lineY + 1);
      });

      yPosition += barLegendDetails.length * 4 + 15;

      // ===== DETAILED FINDINGS WITH EVIDENCE =====
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont(undefined, "bold");
      pdf.text("DETAILED FINDINGS", 20, yPosition);
      yPosition += 15;

      console.log(
        `📊 Processing ${allControls.length} controls with evidence...`
      );

      // Helper function to safely process text
      const safeText = (text) => {
        if (text === null || text === undefined) return "N/A";
        return String(text).replace(/[^\x00-\x7F]/g, ""); // Remove non-ASCII characters
      };

      // Loop through all controls and add evidence
      allControls.forEach((rule, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        // Safely get rule properties
        const controlId = safeText(rule.control_id);
        const controlName = safeText(rule.control_name);
        const reasoning = safeText(rule.reasoning);
        const status = safeText(rule.status);

        // Rule Header
        pdf.setFillColor(240, 240, 240); // Individual values
        pdf.roundedRect(20, yPosition, pageWidth - 40, 8, 2, 2, "F");
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont(undefined, "bold");

        const titleText = `${controlId}: ${controlName}`;
        const titleLines = pdf.splitTextToSize(titleText, pageWidth - 50);
        pdf.text(titleLines, 25, yPosition + 5);
        yPosition += titleLines.length * 5 + 2;

        // Status badge - FIXED: Use individual RGB values
        const statusWidth = pdf.getTextWidth(status) + 4;

        // FIXED: Pass individual RGB values
        if (status === "Compliant") {
          pdf.setFillColor(34, 197, 94); // Green
        } else {
          pdf.setFillColor(239, 68, 68); // Red
        }

        pdf.roundedRect(
          pageWidth - 20 - statusWidth,
          yPosition - 8,
          statusWidth,
          6,
          2,
          2,
          "F"
        );
        pdf.setTextColor(255, 255, 255);
        pdf.text(status, pageWidth - 20 - statusWidth + 2, yPosition - 3);
        yPosition += 4;

        // Reasoning
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.setFont(undefined, "normal");

        const reasoningText = `Reasoning: ${reasoning}`;
        const reasoningLines = pdf.splitTextToSize(
          reasoningText,
          pageWidth - 50
        );
        pdf.text(reasoningLines, 25, yPosition);
        yPosition += reasoningLines.length * 4 + 8;

        // Evidence Section
        pdf.setFont(undefined, "bold");
        pdf.text("Supporting Evidence:", 25, yPosition);
        yPosition += 6;

        if (rule.evidence && rule.evidence.length > 0) {
          console.log(
            `📁 Rule ${controlId} has ${rule.evidence.length} evidence items`
          );

          rule.evidence.forEach((evidence, idx) => {
            if (yPosition > 270) {
              pdf.addPage();
              yPosition = 20;
            }

            pdf.setDrawColor(200, 200, 200);
            pdf.setFillColor(248, 249, 250); // Individual values
            pdf.roundedRect(25, yPosition, pageWidth - 50, 25, 2, 2, "FD");
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(8);

            // Path
            pdf.setFont(undefined, "bold");
            pdf.text("Path:", 30, yPosition + 6);
            pdf.setFont(undefined, "normal");
            const pathText = safeText(evidence.path);
            const pathLines = pdf.splitTextToSize(pathText, pageWidth - 80);
            pdf.text(pathLines, 45, yPosition + 6);

            // Value
            pdf.setFont(undefined, "bold");
            pdf.text("Value:", 30, yPosition + 14);
            pdf.setFont(undefined, "normal");
            const valueText = safeText(evidence.value);
            const valueLines = pdf.splitTextToSize(valueText, pageWidth - 80);
            pdf.text(valueLines, 45, yPosition + 14);

            yPosition += 30;
          });
        } else {
          pdf.setFont(undefined, "italic");
          pdf.setTextColor(100, 100, 100);
          pdf.text(
            "No specific evidence found for this control",
            25,
            yPosition
          );
          yPosition += 10;
        }

        yPosition += 15; // Space between rules
      });

      // ===== FOOTER =====
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, 290, {
          align: "center",
        });
        pdf.text("Generated by Compliance Checker", pageWidth / 2, 295, {
          align: "center",
        });
      }

      console.log("💾 Saving PDF...");
      pdf.save("Compliance_Analysis_Report.pdf");
      console.log("✅ PDF saved successfully!");
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      alert(`PDF generation failed: ${error.message}`);
    } finally {
      setLoadingPdf(false);
      console.log("✅ Loading state set to false");
    }
  };

  return (
    <>
      {loadingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 max-w-md w-full mx-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-600 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-transparent border-t-cyan-500 border-r-emerald-500 rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text mb-3 text-center">
              Generating PDF...
            </h3>
            <p className="text-slate-400 text-center text-sm">
              Creating your professional compliance report
            </p>
          </div>
        </div>
      )}

      <div
        ref={printRef}
        className={`${loadingPdf ? "overflow-y-hidden" : ""} results fade-in`}
      >
        <div className="pdf-page-section flex justify-between items-center mb-6 border-b-[1px] border-[--border-light] pb-2">
          <img
            src="/frontend/macksofy_white.png"
            className="h-10 ml-3 object-cover"
            alt="Logo"
          />
          <h2 className="mb-0">Compliance Analysis Report</h2>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadPdf}
              style={{ position: "relative", zIndex: 1000 }}
              className="no-print flex w-36 justify-center items-center h-8 border border-zinc-700 bg-gradient-to-r from-[#19c9c6] via-[#19c9c6] to-[rgb(3,249,179)] text-transparent bg-clip-text rounded-3xl text-sm font-medium hover:text-slate-900 hover:bg-clip-padding hover:ease-in-out hover:duration-300 hover:transition-colors"
            >
              Export to PDF
            </button>

            <CSVLink
              data={allControls || []}
              headers={headers}
              filename={"Compliance-Analysis-Report.csv"}
              className="no-print flex w-36 justify-center items-center h-8 border border-zinc-700 bg-gradient-to-r from-[#19c9c6] via-[#19c9c6] to-[rgb(3,249,179)] text-transparent bg-clip-text rounded-3xl text-sm font-medium hover:text-slate-900 hover:bg-clip-padding hover:ease-in-out hover:duration-300 hover:transition-colors"
            >
              Export to CSV
            </CSVLink>
          </div>
        </div>

        <Summary summary={results.summary} className="pdf-page-section" />

        <div className="results-tables flex flex-col">
          <div className="flex lg:flex-col xl:flex-row md:flex-col items-center justify-center gap-12 pdf-page-section">
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

        <button onClick={onReset} className="no-print reset-button">
          Analyze Another Configuration
        </button>
      </div>
    </>
  );
};

export default Results;
