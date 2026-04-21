import React from "react";
import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { getFlights, getImageUrl } from "config/api";
import { Spin } from "antd";
import { useSearchParams } from "react-router-dom";

const FlightList = ({
  origin,
  destination,
  departureDate,
  onSelectFlight,
  step,
  selectedOutbound,
  tripType
}) => {
  const [searchParams] = useSearchParams();
  const [openIndexes, setOpenIndexes] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeatClass, setSelectedSeatClass] = useState({});

  useEffect(() => {
    const loadFlights = async () => {
      const o = origin || searchParams.get("origin");
      const d = destination || searchParams.get("destination");
      const date = departureDate || searchParams.get("departureDate");
      if (!o || !d || !date) {
        setFlights([]);
        return;
      }
      try {
        setLoading(true);
        const params = {
          origin: o,
          destination: d,
          departureDate: date
        };
        const res = await getFlights(params);
        const data = res?.data || res?.results || [];
        setFlights(data);
      } catch (err) {
        console.error("Failed to load flights", err);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };
    loadFlights();
  }, [origin, destination, departureDate]);

  const toggleOpen = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return { time: "", date: "" };
    const date = new Date(datetime);
    return {
      time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    };
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getSelectedSeatClass = (flight) => {
    const seatClassParam = searchParams.get("seatClass") || "economy";
    return selectedSeatClass[flight.id] || seatClassParam;
  };

  const getSeatClassPrice = (flight) => {
    if (!flight.seat_classes || flight.seat_classes.length === 0) {
      return flight.base_price;
    }
    const sel = getSelectedSeatClass(flight);
    const matchingSeatClass = flight.seat_classes.find(sc => sc.seat_class === sel);
    if (matchingSeatClass) {
      return matchingSeatClass.price;
    }
    const minPrice = Math.min(...flight.seat_classes.map(sc => sc.price));
    return minPrice;
  };

  const getDiscountedPrice = (flight) => {
    const basePrice = getSeatClassPrice(flight);
    const promotion = flight.promotion;
    if (!promotion) return basePrice;
    if (promotion.discount_amount) {
      return basePrice - promotion.discount_amount;
    }
    if (promotion.discount_percent) {
      return basePrice * (1 - promotion.discount_percent / 100);
    }
    return basePrice;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  const o = origin || searchParams.get("origin");
  const d = destination || searchParams.get("destination");
  const date = departureDate || searchParams.get("departureDate");
  if (!o || !d || !date) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">Vui lòng chọn điểm đi, điểm đến và ngày khởi hành để tìm chuyến bay</p>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">Không tìm thấy chuyến bay phù hợp</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      {flights.map((flight, index) => {
        const isOpen = openIndexes.includes(index);
        const depDateTime = formatDateTime(flight.departure_time);
        const arrDateTime = formatDateTime(flight.arrival_time);
        const originalPrice = getSeatClassPrice(flight);
        const finalPrice = getDiscountedPrice(flight);
        const selSeatClass = getSelectedSeatClass(flight);
        const hasDiscount = flight.has_promotion;

        return (
          <div
            key={flight.id}
            className="border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div
              className="grid grid-cols-12 gap-4 items-center p-4 cursor-pointer"
              onClick={() => toggleOpen(index)}
            >
              <div className="col-span-3 flex items-center space-x-3">
                {flight.airline?.logo && (
                  <img
                    src={getImageUrl(flight.airline.logo)}
                    alt={flight.airline.name}
                    className="w-12 h-12 object-contain"
                  />
                )}
                <div>
                  <p className="font-semibold text-base">{flight.airline?.name}</p>
                  <p className="text-sm text-gray-500">
                    {flight.departure_airport?.code} - {flight.arrival_airport?.code}
                  </p>
                </div>
              </div>

              <div className="col-span-5 text-center">
                <p className="text-xl font-bold">
                  {depDateTime.time} - {arrDateTime.time}
                </p>
                <p className="text-xs text-gray-500">
                  {depDateTime.date} - {arrDateTime.date}
                </p>
                <p className="text-sm text-gray-600">
                  {flight.stops} điểm dừng • {formatDuration(flight.total_duration)}
                </p>
              </div>

              <div className="col-span-3 text-right">
                {hasDiscount ? (
                  <>
                    <p className="text-2xl font-bold text-red-600">{formatPrice(finalPrice)}</p>
                    <p className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(originalPrice)}</p>
                )}
              </div>

              <div className="col-span-1 text-right">
                {isOpen ? (
                  <FaChevronUp className="text-gray-600" />
                ) : (
                  <FaChevronDown className="text-gray-600" />
                )}
              </div>
            </div>

            {isOpen && (
              <div className="bg-gray-50 px-6 py-4 space-y-4 text-sm">
                {flight.legs?.map((leg, i) => (
                  <React.Fragment key={leg.id}>
                    <div className="border rounded p-3 bg-white space-y-1">
                      <p className="font-semibold text-base">
                        {formatDateTime(leg.departure_time).time} → {formatDateTime(leg.arrival_time).time}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(leg.departure_time).date} - {formatDateTime(leg.arrival_time).date}
                      </p>
                      <p className="text-gray-700">
                        <strong>{leg.departure_airport?.name} ({leg.departure_airport?.code})</strong> →{" "}
                        <strong>{leg.arrival_airport?.name} ({leg.arrival_airport?.code})</strong>
                      </p>
                      <p className="text-gray-600">⏱ Thời gian: {formatDuration(leg.duration_minutes)}</p>
                      <p className="text-gray-600">✈️ Mã chuyến bay: {leg.flight_code}</p>
                      {flight.aircraft && (
                        <p className="text-gray-600">🛫 Máy bay: {flight.airline?.name} - {flight.aircraft?.model}</p>
                      )}
                    </div>
                    {i < flight.legs.length - 1 && (
                      (() => {
                        const nextLeg = flight.legs[i + 1];
                        const layoverMinutes = Math.floor((new Date(nextLeg.departure_time) - new Date(leg.arrival_time)) / 60000);
                        if (layoverMinutes > 0) {
                          return (
                            <div className="text-center text-blue-600 font-semibold py-2">
                              Nghỉ giữa các chặng: {formatDuration(layoverMinutes)}
                            </div>
                          );
                        }
                        return null;
                      })()
                    )}
                  </React.Fragment>
                ))}

                {flight.seat_classes && flight.seat_classes.length > 0 && (
                  <div className="border rounded p-3 bg-white">
                    <p className="font-semibold mb-2">Hạng ghế:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {flight.seat_classes.map((sc) => {
                        const isSelected = selSeatClass === sc.seat_class;
                        return (
                          <button
                            key={sc.id}
                            className={`p-2 border rounded text-center w-full transition-all ${isSelected ? "bg-blue-100 border-blue-600 font-bold" : "bg-white hover:bg-gray-100"}`}
                            style={{ outline: isSelected ? "2px solid #2563eb" : "none" }}
                            onClick={() => setSelectedSeatClass(prev => ({ ...prev, [flight.id]: sc.seat_class }))}
                          >
                            <p className="font-medium">
                              {sc.seat_class === "economy" ? "Phổ thông" :
                                sc.seat_class === "business" ? "Thương gia" : "Hạng nhất"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatPrice(sc.price)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Còn {sc.available_seats} ghế
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                      const seatClassObj = flight.seat_classes?.find(sc => sc.seat_class === selSeatClass);
                      if (onSelectFlight) onSelectFlight(flight, seatClassObj);
                    }}
                  >
                    Chọn
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FlightList;
