import React, { useState } from "react";

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
      {sectionData &&
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
              <div className="border-t border-gray-200 h-96 scroll-smooth scrollContainer  overflow-y-scroll ">
                <div className="p-4 space-y-4">
                  {data.controls?.map((control, idx) => (
                    <div
                      key={idx}
                      className=" rounded-md border border-zinc-700 p-4 shadow-sm"
                    >
                      {/* Control Header */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Status Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {control.status === "Compliant" ? (
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <svg
                                width={12}
                                height={12}
                                fill="none"
                                strokeWidth="3"
                                stroke="white"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m4.5 12.75 6 6 9-13.5"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <svg
                                width={12}
                                height={12}
                                fill="none"
                                strokeWidth="3"
                                stroke="white"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18 18 6M6 6l12 12"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Control Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-bold text-blue-600  px-2 py-1 rounded">
                              {control.control_name}
                            </span>

                            {/* Status Badge */}
                            {control.status === "Compliant" ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                PASSED
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  priority(
                                    control.status,
                                    control.evidence.length
                                  ) === "HIGH"
                                    ? "bg-red-100 text-red-800"
                                    : priority(
                                        control.status,
                                        control.evidence.length
                                      ) === "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {priority(
                                  control.status,
                                  control.evidence.length
                                )}{" "}
                              </span>
                            )}
                          </div>

                          {/* Control Description */}
                          <h4 className="font-medium text-gray-300 mb-2 leading-relaxed">
                            {truncateWords(control.control_description, 120)}
                          </h4>

                          {/* Reasoning */}
                          <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                            {truncateWords(control.reasoning, 100)}
                          </p>

                          {/* Evidence Info */}
                          {control.evidence && control.evidence.length > 0 && (
                            <div className="flex items-center gap-1 text-sm text-green-600">
                              <svg
                                width={16}
                                height={16}
                                fill="none"
                                strokeWidth="2"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 14.625 3h-3.25"
                                />
                              </svg>

                              {/* Open the modal using document.getElementById('ID').showModal() method */}
                              <button
                                onClick={() =>
                                  document
                                    .getElementById(
                                      `modal_${data.sectionNumber}_${idx}`
                                    )
                                    .showModal()
                                }
                              >
                                {control.evidence.length} evidence items found
                              </button>

                              <dialog
                                id={`modal_${data.sectionNumber}_${idx}`}
                                className="modal"
                              >
                                <div className="modal-box">
                                  <h2 className="text-lg font-semibold mb-2">
                                    Evidence
                                  </h2>
                                  {control.evidence.map((evi, eviIdx) => (
                                    <div
                                      key={eviIdx}
                                      className="m-1 ml-2 flex flex-col items-start border-b border-zinc-700 pb-2"
                                    >
                                      <h3 className="font-semibold text-gray-200">
                                        #{eviIdx + 1}
                                      </h3>
                                      <h4 className="mt-1">
                                        Value:
                                        <span className="text-white ml-1">
                                          {evi.value}
                                        </span>
                                      </h4>
                                      <p className="text-white text-xs pt-1">
                                        <span className="text-green-500">
                                          Path:
                                        </span>{" "}
                                        {evi.path}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                <form
                                  method="dialog"
                                  className="modal-backdrop"
                                >
                                  <button>close</button>
                                </form>
                              </dialog>
                            </div>
                          )}
                        </div>

                        {/* Right Status Indicator */}
                        <div className="flex-shrink-0 text-right">
                          {control.status === "Compliant" ? (
                            <span className="text-green-600 font-semibold text-sm">
                              ✓ PASS
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold text-sm">
                              ✗ FAIL
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

export default Section;
