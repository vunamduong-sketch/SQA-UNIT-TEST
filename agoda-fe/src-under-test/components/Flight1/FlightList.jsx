import React from "react";
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import ChinaEA from "../../images/flight/China Eastern Airlines.png";
import ChinaSA from "../../images/flight/China Southern Airlines.jpg";
import VNA from "../../images/flight/Vietnam Airlines.jpg";

const FlightList = () => {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleOpen = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const flights = [
    {
      airline: "China Eastern Airlines",
      logo: ChinaEA,
      time: "19:30 - 16:30",
      route: "SGN - RIZ",
      price: "10.104.858 đ",
      oldPrice: "12.500.000 đ",
      stops: 2,
      totalDuration: "20h 0m",
    },
    {
      airline: "Vietnam Airlines",
      logo: VNA,
      time: "19:30 - 16:30",
      route: "SGN - RIZ",
      price: "10.104.858 đ",
      oldPrice: "12.500.000 đ",
      stops: 2,
      totalDuration: "20h 0m",
    },
    {
      airline: "China Eastern Airlines",
      logo: ChinaSA,
      time: "19:30 - 16:30",
      route: "SGN - RIZ",
      price: "10.104.858 đ",
      oldPrice: "12.500.000 đ",
      stops: 2,
      totalDuration: "20h 0m",
    },
  ];

  const details = {
    "19:30 - 16:30": {
      segments: [
        {
          depTime: "19:30",
          depAirport: "Hồ Chí Minh (SGN) - Sân bay Quốc tế Tân Sơn Nhất",
          arrTime: "23:30",
          arrAirport: "Côn Minh (KMG)",
          duration: "4h 0m",
          aircraft: "China Eastern Airlines - Boeing 737-500",
          class: "Economy",
        },
        {
          depTime: "23:30",
          depAirport: "Côn Minh (KMG)",
          arrTime: "01:35",
          arrAirport: "Vị Hản (WEH)",
          duration: "2h 5m",
          aircraft: "China Eastern Airlines - Boeing 737-500",
          class: "Economy",
        },
        {
          depTime: "15:05",
          depAirport: "Vị Hản (WEH)",
          arrTime: "16:30",
          arrAirport: "Nhật Chiêu (RIZ)",
          duration: "1h 25m",
          aircraft: "China Eastern Airlines - Boeing 737-500",
          class: "Economy",
        },
      ],
    },
  };

  return (
    <div className="space-y-4 p-2">
      {flights.map((flight, index) => {
        const isOpen = openIndexes.includes(index);

        return (
          <div
            key={index}
            className="border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div
              className="grid grid-cols-12 gap-4 items-center p-4 cursor-pointer"
              onClick={() => toggleOpen(index)}
            >
              <div className="col-span-3 flex items-center space-x-3">
                <img
                  src={flight.logo}
                  alt="Airline Logo"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <p className="font-semibold text-base">{flight.airline}</p>
                  <p className="text-sm text-gray-500">{flight.route}</p>
                </div>
              </div>

              <div className="col-span-5 text-center">
                <p className="text-xl font-bold">{flight.time}</p>
                <p className="text-sm text-gray-600">
                  {flight.stops} điểm dừng • {flight.totalDuration}
                </p>
              </div>

              <div className="col-span-3 text-right">
                <p className="text-2xl font-bold text-red-600">{flight.price}</p>
                <p className="text-sm text-gray-500 line-through">
                  {flight.oldPrice}
                </p>
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
                {details[flight.time]?.segments.map((seg, i) => (
                  <div
                    key={i}
                    className="border rounded p-3 bg-white space-y-1"
                  >
                    <p className="font-semibold text-base">
                      {seg.depTime} → {seg.arrTime}
                    </p>
                    <p className="text-gray-700">
                      <strong>{seg.depAirport}</strong> →{" "}
                      <strong>{seg.arrAirport}</strong>
                    </p>
                    <p className="text-gray-600">⏱ Thời gian: {seg.duration}</p>
                    <p className="text-gray-600">🛫 Máy bay: {seg.aircraft}</p>
                    <p className="text-gray-600">💺 Hạng ghế: {seg.class}</p>
                  </div>
                ))}

                <div className="flex gap-4 pt-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Chọn
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Thêm vào xe đẩy hàng
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
