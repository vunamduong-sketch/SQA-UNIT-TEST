import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { IoIosStar } from "react-icons/io";
import { Tag } from "antd";
import { BsLightningChargeFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "redux/hooks";
import { fetchActivity } from "redux/slice/activitySlide";
import { formatCurrency } from "utils/formatCurrency";

const TopActivity = () => {
    const dispatch = useAppDispatch();
    const activities = useAppSelector((state) => state.activity.data);

    useEffect(() => {
        dispatch(
            fetchActivity({ query: "current=1&pageSize=10&recommended=true" })
        );
    }, []);

    return (
        <div>
            <div className="mt-[32px] max-w-[83.33333%] mx-auto">
                <h2 className="text-[24px] leading-[29px] font-semibold">
                    Các hoạt động hàng đầu gần quý khách
                </h2>
                <div className="mt-[12px]">
                    <Swiper
                        slidesPerView={4}
                        spaceBetween={8}
                        navigation={true}
                        modules={[Navigation]}
                    >
                        {activities.map((item, index) => (
                            <SwiperSlide key={index}>
                                <div className="rounded-[16px] border-[1px] border-[#d5d9e2] overflow-hidden">
                                    <Link to={`/activity/detail/${item.id}`}>
                                        <img
                                            src={`${process.env.REACT_APP_BE_URL}${item?.images?.[0]?.image}`}
                                            className="w-full h-[170px] object-cover"
                                        />
                                        <div className="pt-[12px] px-[16px] pb-[16px]">
                                            <p className="font-semibold text-[20px] leading-[24px] line-clamp-2 min-h-[48px]">
                                                {item.name}
                                            </p>
                                            <div className="flex items-center gap-[4px]">
                                                <IoIosStar className="text-[#b54c01] text-[12px]" />
                                                <p className="font-semibold">
                                                    {item.avg_star?.toFixed(1)}
                                                </p>
                                                <p className="text-[13px] text-[#5e6b82]">
                                                    (49)
                                                </p>
                                                <p className="text-[#5e6b82]">
                                                    •
                                                </p>
                                                <p className="text-[13px] text-[#5e6b82]">
                                                    298 người đã đặt
                                                </p>
                                            </div>
                                            <div className="flex items-center mt-[4px]">
                                                <Tag
                                                    color="blue"
                                                    className="p-[4px]"
                                                >
                                                    <BsLightningChargeFill className="text-[14px]" />
                                                </Tag>
                                                <Tag
                                                    color="blue"
                                                    className="p-[4px] text-[13px] leading-[14px]"
                                                >
                                                    Hủy miễn phí
                                                </Tag>
                                            </div>
                                            <div className="flex justify-end mt-[52px]">
                                                <Tag
                                                    color="#c53829"
                                                    className="p-[4px] text-[13px] leading-[14px] mr-0"
                                                >
                                                    Giảm 0%
                                                </Tag>
                                            </div>
                                            <div className="mt-[4px] flex items-center justify-end gap-[4px]">
                                                <p className="text-[13px] text-end line-through">
                                                    {formatCurrency(
                                                        item.avg_price.toFixed(
                                                            0
                                                        )
                                                    )}{" "}
                                                    ₫
                                                </p>
                                                <div className="flex items-center justify-end gap-[8px]">
                                                    <p className="text-[16px] font-bold text-end text-[#c53829]">
                                                        {formatCurrency(
                                                            item.avg_price.toFixed(
                                                                0
                                                            )
                                                        )}
                                                    </p>
                                                    <p className="text-[12px] mt-[2px] font-semibold text-end text-[#c53829]">
                                                        ₫
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default TopActivity;
