import { callFetchHandbook } from "config/api";
import { callFetchHotelQuery } from "config/api";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createHotelSlug } from "utils/slugHelpers";

const Footer = ({ city }) => {
    const [hotels, setHotels] = useState([]);
    const [handbooks, setHandbooks] = useState([]);

    const handleGetHotel = async (query) => {
        const res = await callFetchHotelQuery(query);
        if (res.isSuccess) {
            setHotels(res.data);
        }
    };

    const handleGetHandbook = async (query) => {
        const res = await callFetchHandbook(query);
        if (res.isSuccess) {
            setHandbooks(res.data);
        }
    };

    useEffect(() => {
        if (city.id) {
            handleGetHotel(
                `current=1&pageSize=100&cityId=${city.id}&recommended=true`
            );
            handleGetHandbook(`current=1&pageSize=100&city_id=${city.id}`);
        }
    }, [city]);

    return (
        <footer className="bg-gray-50 border-t mt-16 py-10">
            <div className="max-w-6xl mx-auto px-4 space-y-12">
                {/* Khách sạn nổi tiếng */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Khách sạn nổi tiếng ở {city.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {hotels.map((hotel, i) => (
                            <div key={i}>
                                <Link
                                    // href={hotel.link}
                                    to={`/hotel/${createHotelSlug(
                                        hotel.name,
                                        hotel.id
                                    )}`}
                                    className="text-blue-600 hover:underline text-base"
                                >
                                    {hotel.name}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Cẩm nang du lịch */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Cẩm nang du lịch {city.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {handbooks.map((handbook, i) => (
                            <div key={i}>
                                <Link
                                    to={`/travel-guide/${handbook?.city?.country?.id}/${handbook?.city?.id}/${handbook?.id}`}
                                    className="text-blue-600 hover:underline text-base"
                                >
                                    {handbook.title}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
