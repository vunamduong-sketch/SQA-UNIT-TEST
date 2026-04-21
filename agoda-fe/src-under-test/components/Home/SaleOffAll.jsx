import React, { useEffect, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import { getPromotionsAdmin } from "config/api";
import { getImage } from "utils/imageUrl";
import dayjs from "dayjs";
import { PROMOTION_TYPE } from "constants/promotion";
import { Empty } from "antd";
import Skeleton from "react-loading-skeleton";

const SaleOffSection = ({
    title,
    typeQuery,
    typeParam = "",
    promotions,
    isLoading,
}) => (
    <div className="w-[1124px] mx-auto mt-[32px]">
        <h2 className="text-[24px] font-bold">{title}</h2>
        {!isLoading && promotions.length === 0 ? (
            <Empty
                description="Chưa có khuyến mãi"
                className="bg-[#abb6cb1f] mx-0 py-[24px] rounded-[16px] mt-[24px]"
            />
        ) : (
            <Swiper
                slidesPerView={4}
                spaceBetween={30}
                navigation={true}
                modules={[Navigation]}
                className="mt-[24px]"
            >
                {isLoading
                    ? new Array(4).fill(0).map((_, index) => (
                          <SwiperSlide key={index}>
                              <Skeleton
                                  height={154}
                                  className="!rounded-[16px]"
                              />
                          </SwiperSlide>
                      ))
                    : promotions.map((promo) => (
                          <SwiperSlide key={promo.id}>
                              <Link
                                  to={`/promotions/${promo.id}?type=${
                                      typeParam || typeQuery
                                  }`}
                              >
                                  <img
                                      src={getImage(promo.image)}
                                      alt={promo.title}
                                      className="w-full h-[154px] rounded-[16px] object-cover"
                                  />
                              </Link>
                          </SwiperSlide>
                      ))}
            </Swiper>
        )}
    </div>
);

const SaleOffAll = () => {
    const [accom, setAccom] = useState([]);
    const [flight, setFlight] = useState([]);
    const [activity, setActivity] = useState([]);
    const [isLoadingAccom, setIsLoadingAccom] = useState(false);
    const [isLoadingFlight, setIsLoadingFlight] = useState(false);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);

    const handleGetPromotion = async (type, query) => {
        if (type === PROMOTION_TYPE.HOTEL) {
            setIsLoadingAccom(true);
        } else if (type === PROMOTION_TYPE.FLIGHT) {
            setIsLoadingFlight(true);
        } else if (type === PROMOTION_TYPE.ACTIVITY) {
            setIsLoadingActivity(true);
        }
        const res = await getPromotionsAdmin(query);

        if (type === PROMOTION_TYPE.HOTEL) {
            if (res.data) {
                setAccom(res.data);
            }
            setIsLoadingAccom(false);
        } else if (type === PROMOTION_TYPE.FLIGHT) {
            if (res.data) {
                setFlight(res.data);
            }
            setIsLoadingFlight(false);
        } else if (type === PROMOTION_TYPE.ACTIVITY) {
            if (res.data) {
                setActivity(res.data);
            }
            setIsLoadingActivity(false);
        }
    };

    useEffect(() => {
        handleGetPromotion(
            PROMOTION_TYPE.HOTEL,
            `current=1&pageSize=20&promotion_type=${
                PROMOTION_TYPE.HOTEL
            }&min_date=${dayjs(Date.now()).toISOString()}&sort=id-desc`
        );
        handleGetPromotion(
            PROMOTION_TYPE.FLIGHT,
            `current=1&pageSize=20&promotion_type=${
                PROMOTION_TYPE.FLIGHT
            }&min_date=${dayjs(Date.now()).toISOString()}&sort=id-desc`
        );
        handleGetPromotion(
            PROMOTION_TYPE.ACTIVITY,
            `current=1&pageSize=20&promotion_type=${
                PROMOTION_TYPE.ACTIVITY
            }&min_date=${dayjs(Date.now()).toISOString()}&sort=id-desc`
        );
    }, []);

    return (
        <div>
            <SaleOffSection
                title="Chương trình khuyến mại chỗ ở"
                typeQuery="accommodation"
                typeParam="accommodation"
                promotions={accom}
                isLoading={isLoadingAccom}
            />
            <SaleOffSection
                title="Khuyến mại Chuyến bay"
                typeQuery="flight"
                typeParam="flight"
                promotions={flight}
                isLoading={isLoadingFlight}
            />
            <SaleOffSection
                title="Khuyến mại Hoạt động"
                typeQuery="activity"
                typeParam="activity"
                promotions={activity}
                isLoading={isLoadingActivity}
            />
        </div>
    );
};

export default SaleOffAll;
