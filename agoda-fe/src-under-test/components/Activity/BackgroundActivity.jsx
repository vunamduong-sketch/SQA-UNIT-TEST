import React from "react";
import backgroundImg from "../../images/activity/background.jpg";
import { Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const BackgroundActivity = () => {
    return (
        <div className="relative">
            <img
                src={backgroundImg}
                className="w-full h-[375px] object-cover"
            />
            <div
                style={{
                    backgroundImage:
                        "linear-gradient(180deg, #fff0 20%, #04070acc 100%)",
                }}
                className="absolute top-0 left-0 right-0 bottom-0"
            ></div>
            <div className="absolute bottom-[64px] left-[50%] translate-x-[-50%] w-[83.33333%]">
                <div className="w-[700px]">
                    <h1
                        style={{
                            textShadow: "rgba(0, 0, 0, 0.25) 0px 10px 20px",
                        }}
                        className="text-white text-[45px] font-bold leading-[54px]"
                    >
                        Tìm cuộc phiêu lưu tiếp theo của quý khách
                    </h1>
                    <p className="mt-[7px] text-white text-[14px] leading-[18px]">
                        Mang đến cho quý khách các hoạt động tốt nhất trên khắp
                        thế giới
                    </p>
                    <div className="mt-[24px] flex items-center gap-[8px]">
                        <Input
                            placeholder="Đà Nẵng"
                            size="large"
                            prefix={<SearchOutlined />}
                            className="rounded-[40px]"
                        />
                        <Button
                            type="primary"
                            className="font-semibold text-center text-white bg-[#2067da]"
                            shape="round"
                            size={"large"}
                        >
                            Tìm kiếm
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackgroundActivity;
