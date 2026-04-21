import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import { getTopVietNamHotel } from "config/api";

const ExploreLocationNearby = () => {
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getTopVietNamHotel({ limit: 50 });
                if (res.isSuccess) {
                    setCities(res.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch top VN cities:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <div className="mt-[48px] max-w-[83.33333%] mx-auto">
                <h2 className="text-[24px] leading-[29px] font-semibold">
                    Khám phá các địa điểm xung quanh
                </h2>
                <div className="mt-[12px]">
                    <Swiper
                        slidesPerView={8}
                        spaceBetween={12}
                        navigation={true}
                        modules={[Navigation]}
                        className="mt-[24px]"
                    >
                        {cities.map((item, index) => (
                            <SwiperSlide key={index}>
                                <Link to={`/activity/city/${item.id}`}>
                                    <img
                                        src={`${process.env.REACT_APP_BE_URL}${item.image}`}
                                        className="w-full h-[148px] object-cover rounded-[16px]"
                                    />
                                    <p className="pl-[4px] leading-[18px] text-[14px] mt-[7px] font-semibold">
                                        {item.name}
                                    </p>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default ExploreLocationNearby;
