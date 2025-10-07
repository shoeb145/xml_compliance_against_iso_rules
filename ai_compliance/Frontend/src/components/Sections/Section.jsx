import React, { useState } from "react";
import ExpandedSection from "./ExpandedSection";

function Section({ sectionData }) {
  const [expanded, setExpanded] = useState({});
  const toggleSection = (sectionNum) => {
    setExpanded((prev) => ({
      ...prev,
      [sectionNum]: !prev[sectionNum], // toggle based on sectionNumber
    }));
  };

  const priority = (state, evdlength) => {
    if (state == "Non-relevant") {
      return "LOW PRIORITY";
    } else if (state == "Non-compliant" && evdlength == 0) {
      return "MEDIUM PRIORITY";
    } else {
      return "HIGH PRIORITY";
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
  return (
    <div className="space-y-3">
      {sectionData ? (
        <div>CheckList loading...</div>
      ) : (
        Object.values(sectionData).map((data) => (
          <div
            key={data.sectionNumber}
            className=" rounded-lg shadow-sm border border-zinc-700 mb-4"
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

              <div className="flex items-center gap-4">
                {/* Passed Count */}
                <div className="flex items-center gap-1 px-3 py-1  text-green-800 rounded-full text-sm font-medium">
                  <svg
                    width={14}
                    height={14}
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                  <span>{data.compliant} passed</span>
                </div>

                {/* Failed Count */}
                <div className="flex items-center gap-1 px-3 py-1  text-red-800 rounded-full text-sm font-medium">
                  <svg
                    width={14}
                    height={14}
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                  <span>{data.failed} failed</span>
                </div>
              </div>
            </div>

            {/* Expanded Controls */}
            {expanded[data.sectionNumber] && (
              <ExpandedSection
                data={data}
                priority={priority}
                truncateWords={truncateWords}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Section;
