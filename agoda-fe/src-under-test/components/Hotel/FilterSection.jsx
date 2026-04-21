import React from "react";
import { Tune } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { callFetchAmenities, callFetchRoomQuery } from "config/api";

const FilterSection = ({ hotelId, onFilterChange }) => {
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!hotelId) return;

        const fetchAllAmenities = async () => {
            setLoading(true);
            try {
                const resRooms = await callFetchRoomQuery(
                    `hotel_id=${hotelId}`
                );
                const rooms = resRooms?.data || [];

                const amenitySet = new Set();
                const allAmenities = [];

                await Promise.all(
                    rooms.map(async (room) => {
                        const resAmen = await callFetchAmenities(
                            `current=1&pageSize=200&room_id=${room.id}`
                        );
                        const raw = resAmen?.data || resAmen;

                        let amenList = [];
                        if (Array.isArray(raw?.results)) {
                            amenList = raw.results;
                        } else if (Array.isArray(raw)) {
                            amenList = raw;
                        } else if (raw && typeof raw === "object" && raw.id) {
                            amenList = [raw];
                        }

                        amenList.forEach((a) => {
                            if (a?.name && !amenitySet.has(a.name)) {
                                amenitySet.add(a.name);
                                allAmenities.push(a);
                            }
                        });
                    })
                );

                setAmenities(allAmenities);
            } catch (err) {
                console.error("Lỗi khi tải tiện nghi:", err);
                setAmenities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllAmenities();
    }, [hotelId]);

    const toggleShowMoreFilters = () => setShowMoreFilters(!showMoreFilters);

    const toggleFilterSelection = (filter) => {
        let newSelected;
        if (selectedFilters.includes(filter)) {
            newSelected = selectedFilters.filter((f) => f !== filter);
        } else {
            newSelected = [...selectedFilters, filter];
        }
        setSelectedFilters(newSelected);
        if (onFilterChange) onFilterChange(newSelected);
    };

    const clearAllFilters = () => {
        setSelectedFilters([]);
        if (onFilterChange) onFilterChange([]);
    };

    const visibleAmenities = amenities.slice(0, 6);
    const moreAmenities = amenities.slice(6);

    if (loading) return <div>Đang tải tiện nghi...</div>;

    return (
        <div className="filter-section bg-white border border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                    Chọn lọc phòng
                </h2>
                <a
                    href="#"
                    className="text-blue-600 hover:underline text-sm font-bold"
                >
                    Chúng tôi khớp giá!
                </a>
            </div>

            <div className="filters">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <Tune className="text-gray-600" />
                        <span className="text-sm font-bold text-gray-800">
                            Tiện nghi:
                        </span>
                    </div>
                    <button
                        onClick={clearAllFilters}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Xóa hết
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    <span className="text-green-600 font-bold">Mẹo:</span> Hãy
                    chọn các tiện nghi bạn muốn để tìm phòng phù hợp hơn.
                </p>

                {amenities.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                        Không có tiện nghi nào.
                    </p>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-2">
                            {visibleAmenities.map((amenity) => (
                                <button
                                    key={amenity.id || amenity.name}
                                    onClick={() =>
                                        toggleFilterSelection(amenity.name)
                                    }
                                    className={`flex items-center border rounded-full px-4 py-2 text-sm ${
                                        selectedFilters.includes(amenity.name)
                                            ? "bg-blue-600 text-white"
                                            : "bg-white border-gray-300 text-gray-800"
                                    }`}
                                >
                                    {amenity.name}
                                </button>
                            ))}
                        </div>

                        {showMoreFilters && moreAmenities.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {moreAmenities.map((amenity) => (
                                    <button
                                        key={amenity.id || amenity.name}
                                        onClick={() =>
                                            toggleFilterSelection(amenity.name)
                                        }
                                        className={`flex items-center border rounded-full px-4 py-2 text-sm ${
                                            selectedFilters.includes(
                                                amenity.name
                                            )
                                                ? "bg-blue-600 text-white"
                                                : "bg-white border-gray-300 text-gray-800"
                                        }`}
                                    >
                                        {amenity.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="text-center mt-4">
                            {moreAmenities.length > 0 && (
                                <button
                                    onClick={toggleShowMoreFilters}
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    {showMoreFilters
                                        ? "Thu gọn"
                                        : `Xem thêm ${moreAmenities.length} mục`}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FilterSection;
