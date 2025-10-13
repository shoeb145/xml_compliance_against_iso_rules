import React, { useEffect, useState } from "react";
import axios from "axios";
import papa from "papaparse";

import "../../components/Results/Results.css";
import ExpandedList from "../../components/CheckList/ExpandedList";

function IsoCheckList(props) {
  const [section, setSection] = useState({});
  const [expanded, setExpanded] = useState({});

  const toggleSection = (sectionNum) => {
    setExpanded((prev) => ({
      ...prev,
      [sectionNum]: !prev[sectionNum], // toggle based on sectionNumber
    }));
  };
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
  const truncateWords = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;

    // Find last space before maxLength
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");

    // If no space found, use character truncate
    if (lastSpace === -1) return truncated + "...";

    return text.slice(0, lastSpace) + "...";
  };
  useEffect(() => {
    const fetch = async () => {
      const URI = "/frontend/data/iso_controls.csv";

      try {
        const data = await axios.get(URI);

        const result = papa.parse(data.data, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim().replace(/\s+/g, "_"),
        });
        const tempSections = {};

        result.data.forEach((item) => {
          const sectionNum = item.Control_ID.split(".")[0];

          if (!tempSections[sectionNum]) {
            tempSections[sectionNum] = {
              sectionName: getSectionName(sectionNum),
              sectionNumber: sectionNum,
              controls: [],
            };
          }
          tempSections[sectionNum].controls.push(item);
        });
        setSection(tempSections);
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, []);

  return (
    <div className="results fade-in w-4/6 mt-11 min-h-screen py-6 overflow-y-auto">
      <h2>Iso CheckList </h2>
      <div className="space-y-3">
        {section &&
          Object.values(section).map((data) => (
            <div
              key={data.sectionNumber}
              className=" rounded-lg shadow-sm border border-zinc-700"
            >
              {/* Section Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer  transition-colors"
                onClick={() => toggleSection(data.sectionNumber)}
              >
                <div className="flex items-center">
                  <svg
                    className={`mr-3 transform transition-transform duration-200 text-gray-500 ${
                      expanded[data.sectionNumber] ? "rotate-180" : ""
                    }`}
                    //   className={`mr-3 transform transition-transform duration-200 text-gray-500`}
                    width={20}
                    height={20}
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-white">
                    Section {data.sectionNumber}: {data.sectionName}
                  </h3>
                </div>
              </div>

              {/* Expanded Controls */}
              {expanded[data.sectionNumber] && (
                <ExpandedList data={data} truncateWords={truncateWords} />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default IsoCheckList;
