import React from "react";
import whyAgoda1Img from "../../images/activity/why-agoda-1.png";
import whyAgoda2Img from "../../images/activity/why-agoda-2.png";
import whyAgoda3Img from "../../images/activity/why-agoda-3.png";

const WhyChooseAgoda = () => {
    const items = [
        {
            img: whyAgoda1Img,
            text: "Hơn 300.000 trải nghiệm",
            description:
                "Đặt mọi chuyến tham quan hoặc vé tham quan tại khắp nơi trên thế giới",
        },
        {
            img: whyAgoda2Img,
            text: "Nhanh chóng và linh hoạt",
            description:
                "Đặt vé trực tuyến trong vài phút với nhiều hoạt động được hủy miễn phí",
        },
        {
            img: whyAgoda3Img,
            text: "Trải nghiệm du lịch hợp nhất",
            description:
                "Lên kế hoạch liền mạch cho các chuyến bay, khách sạn và hoạt động với sự hỗ trợ khách hàng hàng đầu và nhất quán",
        },
    ];

    return (
        <div>
            <div className="mt-[48px] mb-[64px] max-w-[83.33333%] mx-auto">
                <h2 className="text-[24px] leading-[29px] font-semibold">
                    Tại sao chọn Agoda?
                </h2>
                <div className="mt-[16px] grid grid-cols-3 gap-[24px]">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="bg-[#eff4fc] rounded-[16px] py-[12px] px-[16px]"
                        >
                            <img src={item.img} className="w-[64px] h-[64px]" />
                            <div className="mt-[12px]">
                                <p className="leading-[20px] text-[16px] font-semibold text-[#252c38]">
                                    {item.text}
                                </p>
                                <p className="text-[12px] leading-[15px] text-[#252c38]">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WhyChooseAgoda;
