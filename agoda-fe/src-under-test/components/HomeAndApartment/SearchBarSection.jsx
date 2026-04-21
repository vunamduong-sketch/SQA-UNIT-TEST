import React from "react";
import { CalendarToday, People, Search } from "@mui/icons-material";
import { useState } from "react";

const SearchBar = () => {
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overnight");
    const [selectedDate1, setSelectedDate1] = useState("22 tháng 8 2025");
    const [selectedDate2, setSelectedDate2] = useState("24 tháng 8 2025");
    const [currentMonth, setCurrentMonth] = useState(8);
    const currentYear = 2025;
    const [activeButton, setActiveButton] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [rooms, setRooms] = useState(1);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    const toggleDatePicker = (button) => {
        setActiveButton(button);
        setIsDatePickerOpen(!isDatePickerOpen);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const incrementRooms = () => setRooms((prev) => prev + 1);
    const decrementRooms = () => setRooms((prev) => (prev > 1 ? prev - 1 : 1));
    const incrementAdults = () => setAdults((prev) => prev + 1);
    const decrementAdults = () => setAdults((prev) => (prev > 1 ? prev - 1 : 1));
    const incrementChildren = () => setChildren((prev) => prev + 1);
    const decrementChildren = () => setChildren((prev) => (prev > 0 ? prev - 1 : 0));

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleDateSelect = (day) => {
        const newDate = `${day} tháng ${currentMonth} ${currentYear}`;
        if (activeButton === "button1") {
            setSelectedDate1(newDate);
        } else if (activeButton === "button2") {
            setSelectedDate2(newDate);
        }
        setIsDatePickerOpen(false);
    };

    const handleNextMonth = () => {
        setCurrentMonth((prevMonth) => (prevMonth < 12 ? prevMonth + 1 : 1));
    };

    const handlePrevMonth = () => {
        setCurrentMonth((prevMonth) => (prevMonth > 1 ? prevMonth - 1 : 12));
    };

    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    };

    const isDateDisabled = (day) => {
        if (activeButton === "button2") {
            const [selectedDay1, , selectedMonth1] = selectedDate1.split(" ");
            const month1 = parseInt(selectedMonth1);

            if (currentMonth > month1) {
                return false;
            }

            return day <= parseInt(selectedDay1);
        }
        return false;
    };

    return (
        <div className="search-bar bg-blue-900 shadow p-4 flex justify-center items-center text-white relative">
            <div className="flex items-center bg-white text-black rounded px-4 py-2 w-full max-w-md">
                <Search className="text-gray-600 mr-2" />
                <input
                    type="text"
                    placeholder="Nhà dân Cactusland - Trần Hưng Đạo"
                    className="border-none outline-none w-full"
                />
            </div>

            <div className="filters flex space-x-4 items-center px-4 py-2">
                <button
                    onClick={() => toggleDatePicker("button1")}
                    className="flex items-center bg-white text-black rounded px-4 py-2"
                >
                    <CalendarToday className="mr-2 text-gray-600" />
                    <span>{selectedDate1}</span>
                </button>

                <button
                    onClick={() => toggleDatePicker("button2")}
                    className="flex items-center bg-white text-black rounded px-4 py-2"
                >
                    <CalendarToday className="mr-2 text-gray-600" />
                    <span>{selectedDate2}</span>
                </button>

                <div className="relative">
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center bg-white text-black rounded px-4 py-2 relative"
                    >
                        <People className="mr-2 text-gray-600" />
                        <span>{adults} người lớn, {rooms} phòng</span>
                    </button>
                </div>
            </div>

            <button className="bg-blue-700 text-white px-4 py-2 rounded">
                Cập nhật
            </button>

            {isDatePickerOpen && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 w-full max-w-md z-50">
                    <div className="flex justify-between border-b mb-4">
                        <button
                            onClick={() => handleTabChange("overnight")}
                            className={`text-sm font-bold px-4 py-2 ${activeTab === "overnight" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
                                }`}
                        >
                            Chỗ Ở Qua Đêm
                        </button>
                        <button
                            onClick={() => handleTabChange("daytime")}
                            className={`text-sm font-bold px-4 py-2 ${activeTab === "daytime" ? "text-red-600 border-b-2 border-red-600" : "text-gray-600"
                                }`}
                        >
                            Chỗ Ở Trong Ngày <span className="text-red-600 text-xs">Mới!</span>
                        </button>
                        <button
                            onClick={() => handleTabChange("flexible")}
                            className={`text-sm font-bold px-4 py-2 ${activeTab === "flexible" ? "text-gray-600 border-b-2 border-gray-600" : "text-gray-600"
                                }`}
                        >
                            Linh hoạt
                        </button>
                    </div>

                    {activeTab === "overnight" && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <button
                                    onClick={handlePrevMonth}
                                    className="text-blue-600 font-bold px-4 py-2 border rounded hover:bg-blue-100"
                                >
                                    Tháng trước
                                </button>
                                <h3 className="text-blue-600 font-bold">Tháng {currentMonth} {currentYear}</h3>
                                <button
                                    onClick={handleNextMonth}
                                    className="text-blue-600 font-bold px-4 py-2 border rounded hover:bg-blue-100"
                                >
                                    Tháng tiếp theo
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-2 text-center">
                                {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, index) => {
                                    const day = index + 1;
                                    const isSelectedForButton1 =
                                        activeButton === "button1" &&
                                        day === parseInt(selectedDate1.split(" ")[0]) &&
                                        currentMonth === parseInt(selectedDate1.split(" ")[2]);
                                    const isSelectedForButton2 =
                                        activeButton === "button2" &&
                                        day === parseInt(selectedDate2.split(" ")[0]) &&
                                        currentMonth === parseInt(selectedDate2.split(" ")[2]);

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleDateSelect(day)}
                                            disabled={isDateDisabled(day)}
                                            className={`py-2 px-4 rounded ${isDateDisabled(day)
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : isSelectedForButton1 || isSelectedForButton2
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {(isDropdownOpen || isDatePickerOpen) && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => {
                        setIsDatePickerOpen(false);
                        setIsDropdownOpen(false);
                    }}
                ></div>
            )}

            {isDropdownOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/200 mt-2 bg-white shadow-lg rounded-lg p-4 w-64 z-50 ml-60">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-black">Phòng</span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={decrementRooms}
                                className="border rounded px-2 py-1 text-gray-600 hover:bg-gray-200"
                            >
                                -
                            </button>
                            <span className="text-black">{rooms}</span>
                            <button
                                onClick={incrementRooms}
                                className="border rounded px-2 py-1 text-gray-600 hover:bg-gray-200"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <span className="text-black">Người lớn</span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={decrementAdults}
                                className="border rounded px-2 py-1 text-gray-600 hover:bg-gray-200"
                            >
                                -
                            </button>
                            <span className="text-black">{adults}</span>
                            <button
                                onClick={incrementAdults}
                                className="border rounded px-2 py-1 text-gray-600 hover:bg-gray-200"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-black">Trẻ em</span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={decrementChildren}
                                className="border rounded px-2 py-1 text-gray-600 hover:bg-gray-200"
                            >
                                -
                            </button>
                            <span className="text-black">{children}</span>
                            <button
                                onClick={incrementChildren}
                                className="border rounded px-2 py-1 text-gray-600 hover:bg-gray-200"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
