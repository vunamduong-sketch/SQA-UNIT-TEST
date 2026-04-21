import React from "react";
import { useState } from "react";

function FilterSideBar() {
  const [isAirlinesExpanded, setIsAirlinesExpanded] = useState(false);
  const [baggageIncluded, setBaggageIncluded] = useState(false);
  const [departureHour, setDepartureHour] = useState(0);
  const [arrivalHour, setArrivalHour] = useState(0);
  const [durationHours, setDurationHours] = useState(72);
  const [desiredPrice, setDesiredPrice] = useState(30257964);

  const [airlines, setAirlines] = useState({
    "Air China": false,
    "Asiana Airlines": false,
    "China Eastern Airlines": false,
    "China Southern Airlines": false,
    "Sichuan Airlines": false,
    "Vietnam Airlines": false,
  });

  const [stops, setStops] = useState({
    "Bay Thẳng": false,
    "1 Điểm Dừng": false,
    ">2 Điểm Dừng": false,
  });

  const [seatClasses, setSeatClasses] = useState({
    "Nhiều hạng": false,
    "Phổ thông": false,
  });

  const formatHour = (h) => `${h.toString().padStart(2, "0")}:00`;

  const handleAirlinesToggle = () => {
    setIsAirlinesExpanded(!isAirlinesExpanded);
  };

  const areAllAirlinesSelected = Object.values(airlines).every(Boolean);

  const handleToggleAllAirlines = () => {
    const newState = Object.fromEntries(
      Object.keys(airlines).map((key) => [key, !areAllAirlinesSelected])
    );
    setAirlines(newState);
  };

  const handleClearSection = (section) => {
    switch (section) {
      case "baggage":
        setBaggageIncluded(false);
        break;
      case "stops":
        setStops(Object.fromEntries(Object.keys(stops).map(k => [k, false])));
        break;
      case "seatClasses":
        setSeatClasses(Object.fromEntries(Object.keys(seatClasses).map(k => [k, false])));
        break;
      case "schedule":
        setDepartureHour(0);
        setArrivalHour(0);
        break;
      case "duration":
        setDurationHours(72);
        break;
      case "price":
        setDesiredPrice(30257964);
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md space-y-4">
      <div className="p-4 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Được đề xuất</h3>
            <button onClick={() => handleClearSection("baggage")} className="text-blue-500 text-sm hover:underline">Xóa</button>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={baggageIncluded}
              onChange={(e) => setBaggageIncluded(e.target.checked)}
            />
            <span>Đã gồm hành lý ký gửi</span>
          </label>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Hãng hàng không</h3>
            <label className="flex items-center space-x-2 text-sm">
              <span>{areAllAirlinesSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}</span>
              <input
                type="checkbox"
                className="form-switch"
                checked={areAllAirlinesSelected}
                onChange={handleToggleAllAirlines}
              />
            </label>
          </div>

          {Object.entries(airlines)
            .slice(0, isAirlinesExpanded ? undefined : 3)
            .map(([label, checked]) => (
              <label key={label} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={checked}
                  onChange={(e) =>
                    setAirlines((prev) => ({ ...prev, [label]: e.target.checked }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}

          <button onClick={handleAirlinesToggle} className="text-blue-500 text-sm hover:underline mt-2">
            {isAirlinesExpanded ? "Thu gọn" : `Hiện tất cả ${Object.keys(airlines).length} hãng hàng không`}
          </button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Điểm dừng</h3>
            <button onClick={() => handleClearSection("stops")} className="text-blue-500 text-sm hover:underline">Xóa</button>
          </div>
          {Object.entries(stops).map(([label, checked]) => (
            <label key={label} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={checked}
                onChange={(e) =>
                  setStops((prev) => ({ ...prev, [label]: e.target.checked }))
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Lịch trình</h3>
            <button onClick={() => handleClearSection("schedule")} className="text-blue-500 text-sm hover:underline">Xóa</button>
          </div>
          <div className="space-y-2">
            <div>
              <span>Khởi hành: {formatHour(departureHour)}</span>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={departureHour}
                onChange={(e) => setDepartureHour(parseInt(e.target.value))}
                className="w-full h-[5px]"
              />
            </div>
            <div>
              <span>Đến: {formatHour(arrivalHour)}</span>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={arrivalHour}
                onChange={(e) => setArrivalHour(parseInt(e.target.value))}
                className="w-full h-[5px]"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Thời gian</h3>
            <button onClick={() => handleClearSection("duration")} className="text-blue-500 text-sm hover:underline">Xóa</button>
          </div>
          <div>
            <span>Đi {durationHours} tiếng</span>
            <input
              type="range"
              min="0"
              max="72"
              step="1"
              value={durationHours}
              onChange={(e) => setDurationHours(parseInt(e.target.value))}
              className="w-full h-[5px]"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Giá mỗi người</h3>
            <button onClick={() => handleClearSection("price")} className="text-blue-500 text-sm hover:underline">Xóa</button>
          </div>
          <div>
            <span>Lên đến {desiredPrice.toLocaleString("vi-VN")} đ</span>
            <input
              type="range"
              min="0"
              max="30257964"
              step="100000"
              value={desiredPrice}
              onChange={(e) => setDesiredPrice(parseInt(e.target.value))}
              className="w-full h-[5px]"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Khoang hạng</h3>
            <button onClick={() => handleClearSection("seatClasses")} className="text-blue-500 text-sm hover:underline">Xóa</button>
          </div>
          {Object.entries(seatClasses).map(([label, checked]) => (
            <label key={label} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={checked}
                onChange={(e) =>
                  setSeatClasses((prev) => ({ ...prev, [label]: e.target.checked }))
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterSideBar;
