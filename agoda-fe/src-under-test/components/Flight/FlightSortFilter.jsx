import React from "react";
import { useEffect, useRef, useState } from "react";

const FlightSortFilter = ({ onSortChange }) => {
  const [activeTab, setActiveTab] = useState("cheapest");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSelected, setDropdownSelected] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const dropdownRef = useRef(null);

  const tabs = [
    { key: "cheapest", label: "Rẻ nhất", sub: "7.839.162 ₫ • 50h 35ph" },
    { key: "best", label: "Tổng thể tốt nhất", sub: "7.839.162 ₫ • 50h 35ph" },
    { key: "fastest", label: "Nhanh nhất", sub: "22.209.094 ₫ • 13h 30ph" },
  ];

  const dropdownOptions = [
    { key: "cheapest", label: "Rẻ nhất", sub: "Rẻ nhất trước" },
    { key: "best", label: "Tổng thể tốt nhất", sub: "Các chuyến bay ngắn, giá rẻ" },
    { key: "fastest", label: "Nhanh nhất", sub: "Nhanh nhất trước" },
    { key: "departure", label: "Giờ khởi hành", sub: "Sớm nhất trước" },
    { key: "arrival", label: "Giờ đến", sub: "Sớm nhất trước" },
    { key: "stops", label: "Điểm dừng", sub: "Ít điểm dừng nhất trước" },
  ];

  const tabKeys = tabs.map((t) => t.key);
  const effectiveSortKey = dropdownSelected || activeTab;

  useEffect(() => {
    if (showDropdown) {
      const selectedIndex = dropdownOptions.findIndex(
        (opt) => opt.key === effectiveSortKey
      );
      setHoverIndex(selectedIndex >= 0 ? selectedIndex : 0);
    } else {
      setHoverIndex(-1);
    }
  }, [showDropdown, effectiveSortKey]);

  useEffect(() => {
    if (!showDropdown) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHoverIndex((prev) => (prev + 1) % dropdownOptions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHoverIndex((prev) =>
          prev <= 0 ? dropdownOptions.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (hoverIndex >= 0 && hoverIndex < dropdownOptions.length) {
          handleDropdownSelect(dropdownOptions[hoverIndex].key);
        }
      } else if (e.key === "Escape") {
        setShowDropdown(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDropdown, hoverIndex]);

  const handleTabClick = (key) => {
    setActiveTab(key);
    setDropdownSelected(null);
    if (onSortChange) onSortChange(key);
  };

  const handleDropdownSelect = (key) => {
    setShowDropdown(false);
    if (tabKeys.includes(key)) {
      handleTabClick(key);
    } else {
      setDropdownSelected(key);
      if (onSortChange) onSortChange(key);
    }
  };

  const dropdownSelectedOption = dropdownOptions.find(
    (opt) => opt.key === dropdownSelected
  );

  return (
    <div className="flex items-center gap-2 p-2 border-b relative">
      <div
        className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar"
        style={{ flexShrink: 0 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={`px-4 py-2 border rounded text-left min-w-max h-[72px] whitespace-nowrap
              ${
                !dropdownSelected && activeTab === tab.key
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "bg-white text-black border-gray-300"
              }`}
          >
            <div className="font-medium">{tab.label}</div>
            <div className="text-sm opacity-80">{tab.sub}</div>
          </button>
        ))}
      </div>

      <div className="relative flex-grow" style={{ minWidth: 0 }}>
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className={`w-full px-4 py-2 border rounded text-left flex justify-between items-center h-[72px] whitespace-nowrap
            ${
              dropdownSelected
                ? "border-blue-500 bg-blue-500 text-white"
                : "bg-white text-black border-gray-300"
            }`}
          aria-haspopup="listbox"
          aria-expanded={showDropdown}
        >
          <div className="flex flex-col overflow-hidden">
            <span className="font-medium truncate">
              {dropdownSelectedOption ? dropdownSelectedOption.label : "Sắp xếp theo"}
            </span>
            {dropdownSelectedOption && (
              <span className="text-sm opacity-80 truncate">
                {dropdownSelectedOption.sub}
              </span>
            )}
          </div>

          <svg
            className={`ml-2 w-4 h-4 ${
              dropdownSelected ? "text-white" : "text-black"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showDropdown && (
          <div
            role="listbox"
            tabIndex={-1}
            className="absolute top-full left-0 mt-1 bg-white border rounded shadow min-w-[220px] z-50"
            style={{ right: "auto", left: 0 }}
            ref={dropdownRef}
          >
            {dropdownOptions.map((opt, i) => {
              const isSelected = effectiveSortKey === opt.key;
              const isHovered = hoverIndex === i;
              return (
                <div
                  key={opt.key}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleDropdownSelect(opt.key)}
                  onMouseEnter={() => setHoverIndex(i)}
                  className={`px-3 py-2 cursor-pointer flex items-start gap-2
                    ${isSelected ? "bg-blue-100 text-blue-700 font-semibold" : ""}
                    ${isHovered && !isSelected ? "bg-gray-100" : ""}
                  `}
                >
                  <div className="pt-1 w-4">
                    {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                  </div>
                  <div className={isSelected ? "text-blue-600" : ""}>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-sm opacity-70">{opt.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSortFilter;
