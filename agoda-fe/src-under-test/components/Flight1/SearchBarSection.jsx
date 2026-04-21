import React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

const PopupPortal = ({ children, targetRef, onClose }) => {
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPos({
        left: rect.left,
        top: rect.bottom + window.scrollY,
      });
    }
    const handleScroll = () => onClose?.();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [targetRef, onClose]);

  return ReactDOM.createPortal(
    <div
      style={{ position: "absolute", left: pos.left, top: pos.top, zIndex: 9999 }}
    >
      {children}
    </div>,
    document.body
  );
};

const SearchBarSection = () => {
  const [from, setFrom] = useState("Hồ Chí Minh (SGN)");
  const [to, setTo] = useState("Nhật Chiếu (RIZ)");

  const [departureDate, setDepartureDate] = useState("2025-08-08");
  const [returnDate, setReturnDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const seatClassOptions = [
    "Phổ thông",
    "Phổ thông cao cấp",
    "Thương gia",
    "Hạng nhất",
  ];
  const [seatClass, setSeatClass] = useState("Phổ thông");
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [classHoverIndex, setClassHoverIndex] = useState(-1);

  const calendarRef = useRef(null);
  const guestRef = useRef(null);
  const classRef = useRef(null);

  const handleSearch = () => {
    alert(`
      From: ${from}
      To: ${to}
      Departure: ${departureDate}
      Return: ${returnDate || "Không"}
      Guests: ${adults} NL, ${children} TE, ${infants} SS
      Class: ${seatClass}
    `);
  };

  useEffect(() => {
    if (!showClassPicker) return;

    const selectedIndex = seatClassOptions.findIndex((cls) => cls === seatClass);
    setClassHoverIndex(selectedIndex >= 0 ? selectedIndex : 0);

    const handleKeyDown = (e) => {
      if (!showClassPicker) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setClassHoverIndex((prev) => (prev + 1) % seatClassOptions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setClassHoverIndex((prev) =>
          prev <= 0 ? seatClassOptions.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (classHoverIndex >= 0 && classHoverIndex < seatClassOptions.length) {
          const cls = seatClassOptions[classHoverIndex];
          setSeatClass(cls);
          setShowClassPicker(false);
        }
      } else if (e.key === "Escape") {
        setShowClassPicker(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showClassPicker, classHoverIndex, seatClass]);

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-md overflow-x-auto whitespace-nowrap z-0">
      <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full min-w-[200px]">
        <span>✈️</span>
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="bg-transparent outline-none w-full"
          placeholder="Điểm đi"
        />
      </div>

      <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full min-w-[200px]">
        <span>🛬</span>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="bg-transparent outline-none w-full"
          placeholder="Điểm đến"
        />
      </div>

      <div ref={calendarRef}>
        <div
          className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full min-w-[240px] cursor-pointer"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <span>📅</span>
          <div className="flex flex-col text-sm">
            <span>
              {new Date(departureDate).toLocaleDateString("vi-VN", {
                weekday: "short",
                day: "numeric",
                month: "long",
              })}
            </span>
            {returnDate ? (
              <span className="text-blue-500">
                Khứ hồi: {new Date(returnDate).toLocaleDateString("vi-VN")}
              </span>
            ) : (
              <span className="text-blue-500">+ Thêm ngày về</span>
            )}
          </div>
          {showCalendar ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {showCalendar && (
        <PopupPortal
          targetRef={calendarRef}
          onClose={() => setShowCalendar(false)}
        >
          <div className="bg-white p-4 rounded-lg shadow-lg w-[260px]">
            <label className="block text-sm mb-2">
              Ngày đi:
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="border p-2 rounded w-full mt-1"
              />
            </label>
            <label className="block text-sm">
              Ngày về:
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="border p-2 rounded w-full mt-1"
              />
            </label>
          </div>
        </PopupPortal>
      )}

      <div ref={guestRef}>
        <div
          className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full min-w-[120px] cursor-pointer"
          onClick={() => setShowGuestPicker(!showGuestPicker)}
        >
          <span>👤</span>
          <span>{adults + children + infants} khách</span>
          {showGuestPicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {showGuestPicker && (
        <PopupPortal targetRef={guestRef} onClose={() => setShowGuestPicker(false)}>
          <div className="bg-white p-4 rounded-lg shadow-lg w-[240px]">
            {[
              { label: "Người lớn (12+)", value: adults, setValue: setAdults, min: 1 },
              { label: "Trẻ em (2-11)", value: children, setValue: setChildren, min: 0 },
              { label: "Trẻ sơ sinh (<2)", value: infants, setValue: setInfants, min: 0 },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center mb-2">
                <span className="text-sm">{item.label}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      item.setValue(Math.max(item.min, item.value - 1));
                    }}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{item.value}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      item.setValue(item.value + 1);
                    }}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <button
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded w-full text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowGuestPicker(false);
              }}
            >
              Xong
            </button>
          </div>
        </PopupPortal>
      )}

      <div ref={classRef}>
        <div
          className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full min-w-[210px] cursor-pointer"
          onClick={() => setShowClassPicker(!showClassPicker)}
        >
          <span>{seatClass}</span>
          {showClassPicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {showClassPicker && (
        <PopupPortal targetRef={classRef} onClose={() => setShowClassPicker(false)}>
          <div className="bg-white rounded-lg shadow-lg w-[200px]">
            {seatClassOptions.map((cls, i) => {
              const isSelected = seatClass === cls;
              const isHovered = classHoverIndex === i;
              return (
                <div
                  key={cls}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer
                    ${isSelected ? "text-blue-500 font-semibold" : ""}
                    ${isHovered && !isSelected ? "bg-gray-100" : ""}
                    hover:text-blue-500
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSeatClass(cls);
                    setShowClassPicker(false);
                  }}
                  onMouseEnter={() => setClassHoverIndex(i)}
                >
                  {isSelected && <Check size={16} className="text-blue-500" />}
                  <span>{cls}</span>
                </div>
              );
            })}
          </div>
        </PopupPortal>
      )}

      <button
        className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold"
        onClick={handleSearch}
      >
        Tìm
      </button>
    </div>
  );
};

export default SearchBarSection;
