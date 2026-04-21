import React from "react";
import { People, Search } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { DatePicker, Select, Popover, List } from "antd";
import dayjs from "dayjs";
import { callSearchRoomQuery, callLocationSuggestions } from "config/api";
import { useAppSelector } from "redux/hooks";

const { Option } = Select;

const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
};

const SearchBar = ({
    onSearch = () => console.log("onSearch not provided"),
    focusDatePicker,
    setFocusDatePicker,
    initialValues = {},
}) => {
    const { hotelDetail } = useAppSelector((state) => state.hotel);
    const [selectedDate1, setSelectedDate1] = useState(null);
    const [selectedDate2, setSelectedDate2] = useState(null);
    const [rooms, setRooms] = useState(1);
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [stayType, setStayType] = useState("overnight");
    const [suggestions, setSuggestions] = useState([]);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [peoplePopoverOpen, setPeoplePopoverOpen] = useState(false);

    useEffect(() => {
        if (initialValues.startDate) setSelectedDate1(initialValues.startDate);
        if (initialValues.endDate) setSelectedDate2(initialValues.endDate);
        if (initialValues.adult) setAdults(parseInt(initialValues.adult) || 2);
        if (initialValues.child)
            setChildren(parseInt(initialValues.child) || 0);
        if (initialValues.room) setRooms(parseInt(initialValues.room) || 1);
        if (initialValues.stay_type) setStayType(initialValues.stay_type);
        if (initialValues.location) setSearchQuery(initialValues.location);
    }, [JSON.stringify(initialValues)]);

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.length > 2) {
            try {
                const response = await callLocationSuggestions(value, "hotel");
                setSuggestions(response?.data || []);
                setPopoverOpen(true);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
            setPopoverOpen(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion.name || suggestion);
        setPopoverOpen(false);
    };

    const increment = (setter) => setter((prev) => prev + 1);
    const decrement = (setter, min = 0) =>
        setter((prev) => (prev > min ? prev - 1 : min));

    const handleRangeChange = (dates, dateStrings) => {
        setSelectedDate1(dateStrings[0] || null);
        setSelectedDate2(dateStrings[1] || null);
        if (dateStrings[0] && dateStrings[1]) {
            setFocusDatePicker(false);
        }
    };

    useEffect(() => {
        setSearchQuery(hotelDetail.name);
    }, [hotelDetail]);

    const handleSearch = async () => {
        try {
            const endDate =
                stayType === "dayuse" ? selectedDate1 : selectedDate2;
            const query = `hotel_name=${encodeURIComponent(
                searchQuery
            )}&adults=${adults}&children=${children}&start_date=${selectedDate1}&end_date=${endDate}&stay_type=${stayType}`;
            const response = await callSearchRoomQuery(query);

            const hotelInfo = response.data || null;
            const roomsData = hotelInfo?.rooms || [];

            onSearch({
                hotelId: hotelInfo?.id || "default-id",
                hotel: hotelInfo,
                rooms: roomsData,
                startDate: selectedDate1,
                endDate: endDate,
                capacity: adults + children,
                adults,
                children,
                roomsCount: rooms,
                stay_type: stayType,
            });
        } catch (err) {
            console.error("Search failed:", err);
            const endDate =
                stayType === "dayuse" ? selectedDate1 : selectedDate2;
            onSearch({
                hotelId: "default-id",
                hotel: null,
                rooms: [],
                startDate: selectedDate1,
                endDate: endDate,
                adults,
                children,
                roomsCount: rooms,
                stay_type: stayType,
            });
        }
    };

    return (
        <div className="search-bar sticky z-[5] top-0 left-0 bg-blue-900 shadow py-[24px]">
            <div className="max-w-6xl mx-auto flex justify-center items-center gap-3 text-white">
                <div className="w-30">
                    <Select
                        defaultValue={stayType}
                        value={stayType}
                        onChange={(val) => {
                            setStayType(val);
                            setSelectedDate1(null);
                            setSelectedDate2(null);
                        }}
                        className="w-full"
                        size="large"
                    >
                        <Option value="overnight">Qua đêm</Option>
                        <Option value="dayuse">Trong ngày</Option>
                    </Select>
                </div>
                <div className="w-[350px] max-w-md">
                    <Popover
                        content={
                            suggestions.length > 0 ? (
                                <List
                                    size="small"
                                    dataSource={suggestions}
                                    renderItem={(item) => (
                                        <List.Item
                                            onClick={() =>
                                                handleSuggestionClick(item)
                                            }
                                            style={{ cursor: "pointer" }}
                                        >
                                            {item.name || item}
                                        </List.Item>
                                    )}
                                />
                            ) : null
                        }
                        trigger="focus"
                        open={popoverOpen && suggestions.length > 0}
                        onOpenChange={setPopoverOpen}
                        placement="bottomLeft"
                    >
                        <div className="flex items-center bg-white text-black rounded px-4 py-2">
                            <Search className="text-gray-600 mr-2" />
                            <input
                                type="text"
                                placeholder="Nhập tên khách sạn..."
                                value={searchQuery}
                                onChange={handleInputChange}
                                className="border-none outline-none w-full"
                            />
                        </div>
                    </Popover>
                </div>
                <div className="flex-1 max-w-sm">
                    {stayType === "dayuse" ? (
                        <DatePicker
                            format="YYYY-MM-DD"
                            value={selectedDate1 ? dayjs(selectedDate1) : null}
                            onChange={(date) => {
                                const dateString = date
                                    ? date.format("YYYY-MM-DD")
                                    : null;
                                setSelectedDate1(dateString);
                                setSelectedDate2(dateString);
                                if (dateString) {
                                    setFocusDatePicker(false);
                                }
                            }}
                            autoFocus={focusDatePicker}
                            open={focusDatePicker}
                            onFocus={() => setFocusDatePicker(true)}
                            placeholder="Chọn ngày"
                            className="bg-white text-black rounded w-full py-2"
                            disabledDate={disabledDate}
                            allowClear
                        />
                    ) : (
                        <DatePicker.RangePicker
                            format="YYYY-MM-DD"
                            value={
                                selectedDate1 && selectedDate2
                                    ? [
                                          selectedDate1
                                              ? dayjs(selectedDate1)
                                              : null,
                                          selectedDate2
                                              ? dayjs(selectedDate2)
                                              : null,
                                      ]
                                    : []
                            }
                            autoFocus={focusDatePicker}
                            open={focusDatePicker}
                            onFocus={() => setFocusDatePicker(true)}
                            onChange={handleRangeChange}
                            placeholder={[
                                "Chọn ngày nhận phòng",
                                "Chọn ngày trả phòng",
                            ]}
                            className="bg-white text-black rounded w-full py-2"
                            disabledDate={disabledDate}
                            allowClear
                        />
                    )}
                </div>

                <div className="w-[250px]">
                    <Popover
                        content={
                            <div className="p-4 w-64">
                                <div className="flex justify-between items-center mb-2">
                                    <span>Phòng</span>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() =>
                                                decrement(setRooms, 1)
                                            }
                                            className="border rounded px-2 py-1"
                                        >
                                            -
                                        </button>
                                        <span>{rooms}</span>
                                        <button
                                            onClick={() => increment(setRooms)}
                                            className="border rounded px-2 py-1"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span>Người lớn</span>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() =>
                                                decrement(setAdults, 1)
                                            }
                                            className="border rounded px-2 py-1"
                                        >
                                            -
                                        </button>
                                        <span>{adults}</span>
                                        <button
                                            onClick={() => increment(setAdults)}
                                            className="border rounded px-2 py-1"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Trẻ em</span>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() =>
                                                decrement(setChildren, 0)
                                            }
                                            className="border rounded px-2 py-1"
                                        >
                                            -
                                        </button>
                                        <span>{children}</span>
                                        <button
                                            onClick={() =>
                                                increment(setChildren)
                                            }
                                            className="border rounded px-2 py-1"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                        trigger="click"
                        open={peoplePopoverOpen}
                        onOpenChange={setPeoplePopoverOpen}
                        placement="bottom"
                    >
                        <button className="flex items-center bg-white text-black rounded px-4 py-2 w-full justify-center">
                            <People className="mr-2 text-gray-600" />
                            <span>
                                {adults} người lớn, {rooms} phòng
                            </span>
                        </button>
                    </Popover>
                </div>

                <div className="w-32">
                    <button
                        onClick={handleSearch}
                        className="bg-blue-700 text-white px-4 py-2 rounded w-full hover:bg-blue-800"
                    >
                        Cập nhật
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
