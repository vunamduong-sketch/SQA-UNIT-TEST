import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { IoIosStar } from "react-icons/io";
import { Tag } from "antd";
import { BsLightningChargeFill } from "react-icons/bs";

const ActivityFoodTab = () => {
    return (
        <div>
            <Swiper
                slidesPerView={4}
                spaceBetween={8}
                navigation={true}
                pagination={{
                    clickable: true,
                }}
                modules={[Navigation, Pagination]}
            >
                {new Array(15).fill(0).map((item, index) => (
                    <SwiperSlide key={index}>
                        <div className="rounded-[16px] overflow-hidden border-[1px] border-[#d5d9e2] hover:shadow-[rgba(4,7,10,0.24)_0px_4px_10px_0px] transition-all duration-200">
                            <img
                                src="https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/10/45/f2/bb.jpg"
                                className="w-full h-[120px] object-cover"
                            />
                            <div className="p-[8px]">
                                <p className="text-[#5e6b82] text-[13px]">
                                    Di chuyển
                                </p>
                                <p className="font-bold leading-[18px]">
                                    Da Nang Airport Transfer to Da Nang Hotel by
                                    Private Car
                                </p>
                                <div className="flex items-center gap-[4px]">
                                    <IoIosStar className="text-[#b54c01] text-[12px]" />
                                    <p className="font-semibold">5</p>
                                    <p className="text-[13px] text-[#5e6b82]">
                                        (49)
                                    </p>
                                    <p className="text-[#5e6b82]">•</p>
                                    <p className="text-[13px] text-[#5e6b82]">
                                        298 người đã đặt
                                    </p>
                                </div>
                                <div className="flex items-center mt-[4px]">
                                    <Tag color="blue" className="p-[4px]">
                                        <BsLightningChargeFill className="text-[14px]" />
                                    </Tag>
                                    <Tag
                                        color="blue"
                                        className="p-[4px] text-[13px] leading-[14px]"
                                    >
                                        Hủy miễn phí
                                    </Tag>
                                </div>
                                <div className="mt-[12px]">
                                    <p className="text-[13px] text-end line-through">
                                        678.497 ₫
                                    </p>
                                    <div className="flex items-center justify-end gap-[8px]">
                                        <p className="text-[16px] font-bold text-end text-[#c53829]">
                                            540.762
                                        </p>
                                        <p className="text-[12px] mt-[2px] font-semibold text-end text-[#c53829]">
                                            ₫
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ActivityFoodTab;
