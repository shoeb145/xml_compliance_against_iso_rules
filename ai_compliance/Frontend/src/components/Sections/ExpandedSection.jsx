import React, { useState } from "react";
import AddImage from "../AddImage/AddImage";

function ExpandedSection({ data, priority, truncateWords }) {
  const [showUploader, setShowUploader] = useState({});
  const toggleUploader = (idx) => {
    setShowUploader((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
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
                        priority(control.status, control.evidence.length) ===
                        "HIGH"
                          ? "bg-red-100 text-red-800"
                          : priority(
                              control.status,
                              control.evidence.length
                            ) === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {priority(control.status, control.evidence.length)}{" "}
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
                          .getElementById(`modal_${data.sectionNumber}_${idx}`)
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
                        <h2 className="text-lg font-semibold mb-2">Evidence</h2>
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
                              <span className="text-green-500">Path:</span>{" "}
                              {evi.path}
                            </p>
                          </div>
                        ))}
                      </div>
                      <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                      </form>
                    </dialog>
                  </div>
                )}
              </div>

              {/* Right Status Indicator */}
              <div className="flex-shrink-0 text-right flex flex-col justify-between ">
                {control.status === "Compliant" ? (
                  <span className="text-green-600 font-semibold text-sm">
                    ✓ PASS
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold text-sm">
                    ✗ FAIL
                  </span>
                )}

                {control.status != "Compliant" && (
                  <div>
                    <button
                      className="mt-16 border border-zinc-700 bg-gradient-to-r from-[#19c9c6] via-[#19c9c6] to-[rgb(3,249,179)] text-transparent bg-clip-text p-2 rounded-3xl text-sm font-medium hover:text-slate-900 hover:bg-clip-padding  hover:ease-in-out hover:duration-300 hover:transition-colors"
                      onClick={() => toggleUploader(idx)}
                    >
                      {showUploader[idx] ? "Close Uploader " : "Add Evidence"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            {showUploader[idx] && <AddImage />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpandedSection;
