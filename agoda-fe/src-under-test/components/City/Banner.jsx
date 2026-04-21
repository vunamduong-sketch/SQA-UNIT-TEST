import React, { useState } from "react";
import SearchBar from "../Search/SearchBar";
import { getImage } from "utils/imageUrl";

const Banner = ({ city }) => {
    const [activeInput, setActiveInput] = useState(null); // 'destination' | 'checkin' | 'checkout' | 'occupancy' | null
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const [destination, setDestination] = useState("");

    // Đóng dropdown khi click backdrop
    const handleBackdropClick = () => setActiveInput(null);

    return (
        <div
            className="relative w-full h-[calc(100vh-60px)] flex items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage: `url(${process.env.REACT_APP_BE_URL}${city.image})`,
                backgroundSize: "cover",
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 z-0"></div>
            {/* Backdrop */}
            {activeInput && (
                <div
                    className="fixed inset-0 bg-black opacity-35 z-10"
                    data-selenium="backdrop"
                    onClick={handleBackdropClick}
                />
            )}
            {/* Content */}
            <div className="relative z-20 w-full max-w-4xl mx-auto px-4 flex flex-col items-center text-center text-white">
                <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                    Khách sạn và nơi để ở
                </h1>
                <h2 className="text-base md:text-xl font-medium mb-6 drop-shadow">
                    Tìm kiếm để so sánh giá cả và khám phá ưu đãi tuyệt vời có
                    miễn phí hủy
                </h2>
                <SearchBar
                    activeInput={activeInput}
                    setActiveInput={setActiveInput}
                    checkIn={checkIn}
                    setCheckIn={setCheckIn}
                    checkOut={checkOut}
                    setCheckOut={setCheckOut}
                    destination={destination}
                    setDestination={setDestination}
                    handleBackdropClick={handleBackdropClick}
                />
            </div>
        </div>
    );
};

export default Banner;
