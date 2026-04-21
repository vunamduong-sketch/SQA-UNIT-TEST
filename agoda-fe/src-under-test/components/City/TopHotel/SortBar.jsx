import React from "react";

// SortBar component
const SortBar = ({ sorts, valueSort, setValueSort }) => (
    <div className="flex gap-2 mb-4">
        {sorts.map((sort, idx) => (
            <button
                key={idx}
                className={`px-3 py-2 rounded ${
                    valueSort === sort.value
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setValueSort(sort.value)}
            >
                {sort.label}
            </button>
        ))}
    </div>
);

export default SortBar;
