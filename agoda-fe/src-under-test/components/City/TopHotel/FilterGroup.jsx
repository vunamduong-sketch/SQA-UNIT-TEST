import React from "react";

const FilterGroup = ({ title, group, filterSearch, setFilterSearch }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
            <div className="font-semibold text-gray-800 mb-3">{title}</div>
            <div className="flex flex-col gap-2">
                {group.options.map((opt, idx) => (
                    <label
                        key={idx}
                        className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition"
                    >
                        <input
                            type="radio"
                            name={group.key}
                            className="w-5 h-5 accent-blue-600 transition"
                            checked={filterSearch[group.key] === opt.value}
                            onChange={(e) =>
                                setFilterSearch({
                                    ...filterSearch,
                                    [group.key]: opt.value,
                                })
                            }
                        />
                        <span className="text-gray-700">{opt.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default FilterGroup;
