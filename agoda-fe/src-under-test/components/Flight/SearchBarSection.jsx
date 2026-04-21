import React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Select } from "antd";

const { Option } = Select;

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

const SearchBarSection = ({
  defaultOrigin,
  defaultDestination,
  defaultDepartureDate,
  defaultReturnDate,
  defaultPassengers = 1,
  defaultSeatClass = "economy",
  defaultTripType = "one-way",
  defaultPromotionId,
  airports = [],
  origin: propOrigin,
  destination: propDestination
}) => {
  const [origin, setOrigin] = useState(defaultOrigin || "");
  const [destination, setDestination] = useState(defaultDestination || "");

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const displayOrigin = propOrigin !== undefined ? propOrigin : origin;
  const displayDestination = propDestination !== undefined ? propDestination : destination;

  const [departureDate, setDepartureDate] = useState(defaultDepartureDate || "");
  const [returnDate, setReturnDate] = useState(defaultReturnDate || "");
  const [showCalendar, setShowCalendar] = useState(false);
  const [passengers, setPassengers] = useState(parseInt(defaultPassengers) || 1);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const seatClassOptions = [
    { value: "economy", label: "Phổ thông" },
    { value: "business", label: "Thương gia" },
    { value: "first", label: "Hạng nhất" },
  ];

  const seatClassMap = {
    economy: "Phổ thông",
    business: "Thương gia",
    first: "Hạng nhất"
  };

  const [seatClass, setSeatClass] = useState(defaultSeatClass || "economy");
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [classHoverIndex, setClassHoverIndex] = useState(-1);

  const calendarRef = useRef(null);
  const guestRef = useRef(null);
  const classRef = useRef(null);

  useEffect(() => {
    if (defaultOrigin) setOrigin(defaultOrigin);
    if (defaultDestination) setDestination(defaultDestination);
    if (defaultDepartureDate) setDepartureDate(defaultDepartureDate);
    if (defaultReturnDate) setReturnDate(defaultReturnDate);
    if (defaultPassengers) setPassengers(parseInt(defaultPassengers));
    if (defaultSeatClass) setSeatClass(defaultSeatClass);
  }, [defaultOrigin, defaultDestination, defaultDepartureDate, defaultReturnDate, defaultPassengers, defaultSeatClass]);

  const getAirportDisplay = (airportId) => {
    const airport = airports.find(a => a.id === parseInt(airportId));
    return airport ? `${airport.code} - ${airport.city?.name || airport.name}` : "";
  };

  const handleSearch = () => {
    const tripType = returnDate ? "round-trip" : "one-way";
    const params = new URLSearchParams({
      origin: origin || "",
      destination: destination || "",
      departureDate: departureDate || "",
      returnDate: returnDate || "",
      passengers: passengers,
      seatClass: seatClass,
      tripType: tripType
    });
    if (defaultPromotionId) {
      params.append("promotion_id", defaultPromotionId);
    }
    window.location.href = `/flight?${params.toString()}`;
  };

  useEffect(() => {
    if (!showClassPicker) return;

    const selectedIndex = seatClassOptions.findIndex((opt) => opt.value === seatClass);
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
          const opt = seatClassOptions[classHoverIndex];
          setSeatClass(opt.value);
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
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full min-w-[200px]">
          <span className="text-lg">✈️</span>
          <Select
            showSearch
            placeholder="Chọn điểm đi"
            className="w-full"
            size="middle"
            value={displayOrigin ? getAirportDisplay(displayOrigin) : undefined}
            onChange={(val) => setOrigin(val)}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            bordered={false}
            style={{ backgroundColor: "transparent" }}
          >
            {airports.map((a) => (
              <Option key={a.id} value={a.id}>
                {a.code} - {a.city?.name || a.name}
              </Option>
            ))}
          </Select>
        </div>
        <button
          type="button"
          aria-label="Đảo chiều đi/đến"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-800 border border-blue-200 shadow-sm transition mx-1"
          style={{ lineHeight: "1", cursor: "pointer", padding: 0, borderWidth: "1px" }}
          onClick={handleSwap}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 7H17M17 7L14 4M17 7L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 13H3M3 13L6 10M3 13L6 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full min-w-[200px]">
          <span className="text-lg">🛬</span>
          <Select
            showSearch
            placeholder="Chọn điểm đến"
            className="w-full"
            size="middle"
            value={displayDestination ? getAirportDisplay(displayDestination) : undefined}
            onChange={(val) => setDestination(val)}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            bordered={false}
            style={{ backgroundColor: "transparent" }}
          >
            {airports.map((a) => (
              <Option key={a.id} value={a.id}>
                {a.code} - {a.city?.name || a.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div ref={calendarRef}>
        <div
          className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full min-w-[240px] cursor-pointer"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <span>📅</span>
          <div className="flex flex-col text-sm">
            <span>
              {departureDate ? new Date(departureDate).toLocaleDateString("vi-VN", {
                weekday: "short",
                day: "numeric",
                month: "long",
              }) : "Chọn ngày đi"}
            </span>
            {returnDate ? (
              <span className="text-blue-500 flex items-center gap-1">
                Về: {new Date(returnDate).toLocaleDateString("vi-VN")}
                <button
                  type="button"
                  aria-label="Xóa ngày về"
                  className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 font-bold text-base leading-none border border-red-200 shadow-sm transition"
                  style={{ lineHeight: "1", cursor: "pointer", padding: 0, borderWidth: "1px" }}
                  onClick={e => { e.stopPropagation(); setReturnDate(""); }}
                  tabIndex={0}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6" cy="6" r="6" fill="currentColor" fillOpacity="0.12"/>
                    <path d="M4 4l4 4M8 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
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
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="border p-2 rounded w-full mt-1"
                  min={departureDate}
                />
                {returnDate && (
                  <button
                    type="button"
                    aria-label="Xóa ngày về"
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 font-bold text-base leading-none border border-red-200 shadow-sm transition ml-2"
                    style={{ lineHeight: "1", cursor: "pointer", padding: 0, borderWidth: "1px" }}
                    onClick={e => { e.stopPropagation(); setReturnDate(""); }}
                    tabIndex={0}
                  >
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="6" cy="6" r="6" fill="currentColor" fillOpacity="0.12"/>
                      <path d="M4 4l4 4M8 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
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
          <span>{passengers} khách</span>
          {showGuestPicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {showGuestPicker && (
        <PopupPortal targetRef={guestRef} onClose={() => setShowGuestPicker(false)}>
          <div className="bg-white p-4 rounded-lg shadow-lg w-[240px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Số hành khách</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPassengers(Math.max(1, passengers - 1));
                  }}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  -
                </button>
                <span>{passengers}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPassengers(passengers + 1);
                  }}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>
            </div>
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
          className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full min-w-[140px] cursor-pointer"
          onClick={() => setShowClassPicker(!showClassPicker)}
        >
          <span>{seatClassMap[seatClass]}</span>
          {showClassPicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {showClassPicker && (
        <PopupPortal targetRef={classRef} onClose={() => setShowClassPicker(false)}>
          <div className="bg-white rounded-lg shadow-lg w-[200px]">
            {seatClassOptions.map((opt, i) => {
              const isSelected = seatClass === opt.value;
              const isHovered = classHoverIndex === i;
              return (
                <div
                  key={opt.value}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer
                    ${isSelected ? "text-blue-500 font-semibold" : ""}
                    ${isHovered && !isSelected ? "bg-gray-100" : ""}
                    hover:text-blue-500
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSeatClass(opt.value);
                    setShowClassPicker(false);
                  }}
                  onMouseEnter={() => setClassHoverIndex(i)}
                >
                  {isSelected && <Check size={16} className="text-blue-500" />}
                  <span>{opt.label}</span>
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
