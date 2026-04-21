import React, { useEffect, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import { getTopAbroadHotel } from "config/api";
import { Empty } from "antd";
import Skeleton from "react-loading-skeleton";

const ForeignCountryDestination = () => {
    const [cities, setCities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        const res = await getTopAbroadHotel({ limit: 20 });
        if (res.isSuccess) {
            setCities(res.data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <div className="w-[1124px] mx-auto my-[64px]">
                <h2 className="text-[24px] font-bold">
                    Các điểm đến nổi tiếng ngoài Việt Nam
                </h2>
                {!isLoading && cities.length === 0 ? (
                    <Empty
                        description="Chưa có địa điểm nào"
                        className="bg-[#abb6cb1f] mx-0 py-[24px] rounded-[16px] mt-[24px]"
                    />
                ) : (
                    <Swiper
                        slidesPerView={5}
                        spaceBetween={16}
                        navigation={true}
                        modules={[Navigation]}
                        className="mt-[24px]"
                    >
                        {isLoading
                            ? new Array(5).fill(0).map((_, index) => (
                                  <SwiperSlide key={index}>
                                      <Skeleton
                                          height={200}
                                          className="!rounded-[16px]"
                                      />
                                  </SwiperSlide>
                              ))
                            : cities.map((city) => (
                                  <SwiperSlide key={city.id}>
                                      <Link to={`/city/${city.id}`}>
                                          <img
                                              src={`${process.env.REACT_APP_BE_URL}${city.image}`}
                                              alt={city.name}
                                              className="w-full h-[200px] rounded-[16px]"
                                          />
                                          <p className="font-bold text-center">
                                              {city?.name}
                                          </p>
                                          <p className="text-center text-[12px]">
                                              {city.hotelCount} chỗ ở
                                          </p>
                                      </Link>
                                  </SwiperSlide>
                              ))}
                    </Swiper>
                )}
            </div>
        </div>
    );
};

export default ForeignCountryDestination;
