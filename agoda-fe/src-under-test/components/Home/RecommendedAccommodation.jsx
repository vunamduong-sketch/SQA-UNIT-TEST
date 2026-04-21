import React, { useEffect, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { getCities, callFetchHotel } from "config/api";
import { getImage } from "utils/imageUrl";
import { createHotelSlug } from "utils/slugHelpers";
import { formatCurrency } from "utils/formatCurrency";
import Skeleton from "react-loading-skeleton";
import { Empty, Tabs } from "antd";

const RecommendedAccommodation = () => {
    const [cities, setCities] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [loadingCity, setLoadingCity] = useState(true);
    const [loadingHotel, setLoadingHotel] = useState(true);
    const [selectedCityId, setSelectedCityId] = useState(-1);

    const onChange = (key) => {
        setSelectedCityId(key);
    };

    const fetchCities = async (params) => {
        setLoadingCity(true);
        const res = await getCities({ ...params });
        if (res.isSuccess) {
            setCities(res.data);
            if (res.data?.length) {
                setSelectedCityId(res.data[0].id);
            }
        }
        setLoadingCity(false);
    };

    const fetchHotels = async (params) => {
        setLoadingHotel(true);
        const res = await callFetchHotel({ ...params });
        if (res.isSuccess) {
            setHotels(res.data);
        }
        setLoadingHotel(false);
    };

    useEffect(() => {
        fetchCities({
            current: 1,
            pageSize: 6,
        });
    }, []);

    useEffect(() => {
        if (selectedCityId !== -1) {
            fetchHotels({
                current: 1,
                pageSize: 20,
                cityId: selectedCityId,
            });
        }
    }, [selectedCityId]);

    const items = loadingCity
        ? new Array(4).fill(0).map((_, index) => ({
              key: index,
              label: (
                  <Skeleton
                      height={40}
                      width={78}
                      className="!rounded-[16px]"
                  />
              ),
              children: (
                  <Swiper
                      slidesPerView={4}
                      spaceBetween={30}
                      navigation={true}
                      modules={[Navigation]}
                      className="mt-[24px]"
                  >
                      <Skeleton height={154} className="!rounded-[16px]" />
                  </Swiper>
              ),
          }))
        : cities.map((city) => ({
              key: city.id,
              label: city.name,
              children:
                  !loadingHotel && hotels.length === 0 ? (
                      <Empty
                          description="Chưa có khách sạn"
                          className="bg-[#abb6cb1f] mx-0 py-[24px] rounded-[16px] mt-[24px]"
                      />
                  ) : loadingHotel ? (
                      <Swiper
                          slidesPerView={4}
                          spaceBetween={30}
                          navigation={true}
                          modules={[Navigation]}
                          className="mt-[24px]"
                      >
                          {new Array(4).fill(0)?.map((_, index) => (
                              <SwiperSlide key={index}>
                                  <Skeleton
                                      height={154}
                                      className="!rounded-[16px]"
                                  />
                              </SwiperSlide>
                          ))}
                      </Swiper>
                  ) : (
                      <Swiper
                          slidesPerView={4}
                          spaceBetween={30}
                          navigation={true}
                          modules={[Navigation]}
                          className="mt-[24px]"
                      >
                          {hotels.map((hotel) => (
                              <SwiperSlide key={hotel.id}>
                                  <Link
                                      to={`/hotel/${createHotelSlug(
                                          hotel.name,
                                          hotel.id
                                      )}`}
                                      className="relative"
                                  >
                                      <img
                                          src={getImage(
                                              hotel?.images?.[0]?.image
                                          )}
                                          alt={hotel?.name}
                                          className="w-full h-[154px] rounded-[16px] object-cover"
                                      />
                                      <p className="font-bold mt-[12px]">
                                          {hotel.name}
                                      </p>
                                      <div className="flex items-center gap-[4px]">
                                          <div className="flex items-center">
                                              {Array.from({
                                                  length: hotel.avg_star || 0,
                                              }).map((_, i) => (
                                                  <FaStar
                                                      key={i}
                                                      className="text-[#c42c65]"
                                                  />
                                              ))}
                                          </div>
                                          <div className="font-semibold flex items-center gap-[4px] text-[#2067da]">
                                              <FaLocationDot />
                                              {hotel.address || city.name}
                                          </div>
                                      </div>
                                      <p className="text-[12px] text-[#5e6b82]">
                                          Giá mỗi đêm chưa gồm thuế và phí
                                      </p>
                                      <p className="text-[#c53829] text-[16px] font-bold">
                                          VND{" "}
                                          {formatCurrency(
                                              (+hotel.min_price).toFixed(0)
                                          )}
                                      </p>
                                  </Link>
                              </SwiperSlide>
                          ))}
                      </Swiper>
                  ),
          }));

    return (
        <div>
            <div className="w-[1124px] mx-auto mt-[64px]">
                <h2 className="text-[24px] font-bold">
                    Những chỗ nghỉ nổi bật được đề xuất cho quý khách:
                </h2>
                {!loadingCity && cities.length === 0 ? (
                    <Empty
                        description="Chưa có thành phố nào"
                        className="bg-[#abb6cb1f] mx-0 py-[24px] rounded-[16px] mt-[24px]"
                    />
                ) : (
                    <Tabs
                        defaultActiveKey="1"
                        items={items}
                        onChange={onChange}
                    />
                )}
            </div>
        </div>
    );
};

export default RecommendedAccommodation;
