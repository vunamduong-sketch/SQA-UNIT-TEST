import React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAirlines } from "config/api";

function FilterSideBar({ onFilterChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAirlinesExpanded, setIsAirlinesExpanded] = useState(false);

  const [filters, setFilters] = useState({
    baggageIncluded: false,
    departureHour: 0,
    arrivalHour: 0,
    durationHours: 72,
    desiredPrice: 30257964,
    selectedAirlines: {},
    stops: {
      "0": false,
      "1": false,
      ">2": false,
    },
    seatClasses: {
      economy: false,
      business: false,
      first: false,
    },
  });

  const [airlinesList, setAirlinesList] = useState([]);

  useEffect(() => {
    const loadAirlines = async () => {
      try {
        const res = await getAirlines();
        const data = res?.data || [];
        setAirlinesList(data);

        const initial = {};
        data.forEach(airline => {
          initial[airline.id] = false;
        });
        setFilters(prev => ({ ...prev, selectedAirlines: initial }));
      } catch (err) {
        console.error("Failed to load airlines", err);
      }
    };
    loadAirlines();
  }, []);

  useEffect(() => {
    const buildFilterParams = () => {
      const params = new URLSearchParams();
      const searchParamsCopy = new URLSearchParams(searchParams);
      ["origin", "destination", "departureDate", "returnDate", "passengers", "seatClass", "tripType"].forEach(key => {
        const value = searchParamsCopy.get(key);
        if (value) {
          params.set(key, value);
        }
      });

      if (filters.baggageIncluded) {
        params.set("baggageIncluded", "true");
      }

      const selectedAirlineIds = Object.entries(filters.selectedAirlines)
        .filter(([_, checked]) => checked)
        .map(([id, _]) => id);

      if (selectedAirlineIds.length > 0) {
        selectedAirlineIds.forEach(id => {
          params.append("airlines[]", id);
        });
      }

      const selectedStops = Object.entries(filters.stops)
        .filter(([_, checked]) => checked)
        .map(([value, _]) => value);

      if (selectedStops.length > 0) {
        selectedStops.forEach(value => {
          params.append("stops[]", value);
        });
      }

      const selectedSeatClasses = Object.entries(filters.seatClasses)
        .filter(([_, checked]) => checked)
        .map(([value, _]) => value);

      if (selectedSeatClasses.length > 0) {
        selectedSeatClasses.forEach(value => {
          params.append("seatClasses[]", value);
        });
      }

      if (filters.departureHour > 0) {
        params.set("departureHour", filters.departureHour.toString());
      }
      if (filters.arrivalHour > 0) {
        params.set("arrivalHour", filters.arrivalHour.toString());
      }
      if (filters.durationHours < 72) {
        params.set("maxDuration", (filters.durationHours * 60).toString());
      }
      if (filters.desiredPrice < 30257964) {
        params.set("maxPrice", filters.desiredPrice.toString());
      }

      return params;
    };

    const params = buildFilterParams();
    setSearchParams(params, { replace: true });

    if (onFilterChange) {
      onFilterChange(Object.fromEntries(params));
    }
  }, [filters, setSearchParams, onFilterChange]);

  const formatHour = (h) => `${h.toString().padStart(2, "0")}:00`;

  const handleAirlinesToggle = () => {
    setIsAirlinesExpanded(!isAirlinesExpanded);
  };

  const areAllAirlinesSelected = Object.values(filters.selectedAirlines).every(Boolean);

  const handleToggleAllAirlines = () => {
    const newState = {};
    Object.keys(filters.selectedAirlines).forEach(id => {
      newState[id] = !areAllAirlinesSelected;
    });
    setFilters(prev => ({ ...prev, selectedAirlines: newState }));
  };

  const handleClearSection = (section) => {
    switch (section) {
      case "baggage":
        setFilters(prev => ({ ...prev, baggageIncluded: false }));
        break;
      case "airlines":
        const clearedAirlines = {};
        Object.keys(filters.selectedAirlines).forEach(id => {
          clearedAirlines[id] = false;
        });
        setFilters(prev => ({ ...prev, selectedAirlines: clearedAirlines }));
        break;
      case "stops":
        setFilters(prev => ({ ...prev, stops: { "0": false, "1": false, ">2": false } }));
        break;
      case "seatClasses":
        setFilters(prev => ({ ...prev, seatClasses: { economy: false, business: false, first: false } }));
        break;
      case "schedule":
        setFilters(prev => ({ ...prev, departureHour: 0, arrivalHour: 0 }));
        break;
      case "duration":
        setFilters(prev => ({ ...prev, durationHours: 72 }));
        break;
      case "price":
        setFilters(prev => ({ ...prev, desiredPrice: 30257964 }));
        break;
      default:
        break;
    }
  };

  const stopsLabels = {
    "0": "Bay Thẳng",
    "1": "1 Điểm Dừng",
    ">2": ">2 Điểm Dừng",
  };

  const seatClassLabels = {
    economy: "Phổ thông",
    business: "Thương gia",
    first: "Hạng nhất",
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
              checked={filters.baggageIncluded}
              onChange={(e) => setFilters(prev => ({ ...prev, baggageIncluded: e.target.checked }))}
            />
            <span>Đã gồm hành lý ký gửi</span>
          </label>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Hãng hàng không</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => handleClearSection("airlines")} className="text-blue-500 text-sm hover:underline">Xóa</button>
              <label className="flex items-center space-x-2 text-sm">
                <span>{areAllAirlinesSelected ? "Bỏ chọn" : "Chọn tất cả"}</span>
                <input
                  type="checkbox"
                  className="form-switch"
                  checked={areAllAirlinesSelected}
                  onChange={handleToggleAllAirlines}
                />
              </label>
            </div>
          </div>

          {airlinesList
            .slice(0, isAirlinesExpanded ? undefined : 3)
            .map((airline) => (
              <label key={airline.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={filters.selectedAirlines[airline.id] || false}
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      selectedAirlines: { ...prev.selectedAirlines, [airline.id]: e.target.checked }
                    }))
                  }
                />
                <span>{airline.name}</span>
              </label>
            ))}

          {airlinesList.length > 3 && (
            <button onClick={handleAirlinesToggle} className="text-blue-500 text-sm hover:underline mt-2">
              {isAirlinesExpanded ? "Thu gọn" : `Hiện tất cả ${airlinesList.length} hãng hàng không`}
            </button>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Điểm dừng</h3>
            <button onClick={() => handleClearSection("stops")} className="text-blue-500 text-sm hover:underline">Xóa</button>
          </div>
          {Object.entries(filters.stops).map(([value, checked]) => (
            <label key={value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={checked}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    stops: { ...prev.stops, [value]: e.target.checked }
                  }))
                }
              />
              <span>{stopsLabels[value]}</span>
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
              <span>Khởi hành: {formatHour(filters.departureHour)}</span>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={filters.departureHour}
                onChange={(e) => setFilters(prev => ({ ...prev, departureHour: parseInt(e.target.value) }))}
                className="w-full h-[5px]"
              />
            </div>
            <div>
              <span>Đến: {formatHour(filters.arrivalHour)}</span>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={filters.arrivalHour}
                onChange={(e) => setFilters(prev => ({ ...prev, arrivalHour: parseInt(e.target.value) }))}
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
            <span>Đi {filters.durationHours} tiếng</span>
            <input
              type="range"
              min="0"
              max="72"
              step="1"
              value={filters.durationHours}
              onChange={(e) => setFilters(prev => ({ ...prev, durationHours: parseInt(e.target.value) }))}
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
            <span>Lên đến {filters.desiredPrice.toLocaleString("vi-VN")} đ</span>
            <input
              type="range"
              min="0"
              max="30257964"
              step="100000"
              value={filters.desiredPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, desiredPrice: parseInt(e.target.value) }))}
              className="w-full h-[5px]"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Khoang hạng</h3>
            <button onClick={() => handleClearSection("seatClasses")} className="text-blue-500 text-sm hover:underline">Xóa</button>
          </div>
          {Object.entries(filters.seatClasses).map(([value, checked]) => (
            <label key={value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={checked}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    seatClasses: { ...prev.seatClasses, [value]: e.target.checked }
                  }))
                }
              />
              <span>{seatClassLabels[value]}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterSideBar;
