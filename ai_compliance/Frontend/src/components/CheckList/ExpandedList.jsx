import React from "react";

function ExpandedList({ data, truncateWords }) {
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

              {/* Control Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm font-bold   px-1 py-1 rounded">
                    {control.Checklist_Name}
                  </span>
                  <span className="font-mono text-sm font-bold text-blue-600   py-1 rounded">
                    {control.Control_ID}
                  </span>
                  {/* Status Badge */}
                </div>

                {/* Control Description */}
                <h4 className="font-medium text-gray-300 mb-2 leading-relaxed">
                  {truncateWords(control.Control_Description, 120)}
                </h4>

                {/* Reasoning */}
                <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                  {truncateWords(control.Control_Name, 100)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpandedList;
