import React from "react";
import NoItemImg from "../../images/cart/no-item.svg";
import { Link } from "react-router-dom";
import { Button, Checkbox, Tabs, Tag } from "antd";
import { PiBuildingApartmentFill } from "react-icons/pi";
import {
    FaCar,
    FaRegCalendarCheck,
    FaStarHalf,
    FaTrashAlt,
} from "react-icons/fa";
import { IoIosStar, IoMdMusicalNote } from "react-icons/io";
import { FaCheck, FaLocationDot, FaUserGroup } from "react-icons/fa6";
import { IoShieldCheckmark } from "react-icons/io5";
import { BiSolidPlaneAlt } from "react-icons/bi";
import { AiOutlineSwapRight } from "react-icons/ai";
import { MdTour } from "react-icons/md";
import { ImSpoonKnife } from "react-icons/im";
import { FaTent } from "react-icons/fa6";
import { PiListChecksFill } from "react-icons/pi";
import ActivityAllTab from "./ActivityTab/ActivityAllTab";
import ActivityTourTab from "./ActivityTab/ActivityTourTab";
import ActivityExperienceTab from "./ActivityTab/ActivityExperienceTab";
import ActivityDriveTab from "./ActivityTab/ActivityDriveTab";
import ActivityFoodTab from "./ActivityTab/ActivityFoodTab";
import ActivityLocationTab from "./ActivityTab/ActivityLocationTab";
import ActivityTravelEssentialTab from "./ActivityTab/ActivityTravelEssentialTab";
import { planForTripsBlueIcon } from "constants/profile";

const Cart = () => {
    const items = [
        {
            key: "1",
            label: <div>Tất cả</div>,
            children: <ActivityAllTab />,
        },
        {
            key: "2",
            label: (
                <div className="flex items-center gap-[8px]">
                    <MdTour className="text-[20px]" />
                    Chuyến tham quan
                </div>
            ),
            children: <ActivityTourTab />,
        },
        {
            key: "3",
            label: (
                <div className="flex items-center gap-[8px]">
                    <IoMdMusicalNote className="text-[20px]" />
                    Trải nghiệm
                </div>
            ),
            children: <ActivityExperienceTab />,
        },
        {
            key: "4",
            label: (
                <div className="flex items-center gap-[8px]">
                    <FaCar className="text-[20px]" />
                    Di chuyển
                </div>
            ),
            children: <ActivityDriveTab />,
        },
        {
            key: "5",
            label: (
                <div className="flex items-center gap-[8px]">
                    <ImSpoonKnife className="text-[20px]" />
                    Ẩm thực
                </div>
            ),
            children: <ActivityFoodTab />,
        },
        {
            key: "6",
            label: (
                <div className="flex items-center gap-[8px]">
                    <FaTent className="text-[20px]" />
                    Điểm tham quan
                </div>
            ),
            children: <ActivityLocationTab />,
        },
        {
            key: "7",
            label: (
                <div className="flex items-center gap-[8px]">
                    <PiListChecksFill className="text-[20px]" />
                    Hành trang du lịch
                </div>
            ),
            children: <ActivityTravelEssentialTab />,
        },
    ];

    return (
        <div>
            <div className="max-w-[1240px] mx-auto mt-[24px] mb-[16px]">
                {/* <div className="p-[16px] text-[24px] border-[1px] border-[#d5d9e2] rounded-[4px]">
                    Xe đẩy hàng của quý khách
                </div>
                <div className="flex flex-col items-center mt-[16px]">
                    <img src={NoItemImg} className="w-[92px] h-[92px]" />
                    <p className="mt-[48px] text-[24px] font-bold">
                        Xe đẩy hàng của quý khách chẳng có gì bên trong
                    </p>
                    <p className="mt-[16px]">
                        Hãy mua khách sạn, chuyến bay, ô tô và điểm thu hút để
                        lập kế hoạch cho chuyến đi tiếp theo
                    </p>
                    <div className="w-full mt-[64px] mb-[96px] text-center py-[6px] rounded-[3px] text-white bg-[#2067da] border-[1px] border-[#2067da]">
                        <Link>Tạo tài khoản</Link>
                    </div>
                </div> */}
                <div className="grid grid-cols-3 gap-[12px]">
                    <div className="col-start-1 col-span-2">
                        <div className="p-[16px] text-[24px] border-[1px] border-[#d5d9e2] rounded-[4px]">
                            Xe đẩy hàng của quý khách (6)
                        </div>
                        {new Array(3).fill(0).map((item, index) => (
                            <div
                                key={index}
                                className="p-[12px] mt-[16px] border-[1px] border-[#d5d9e2] rounded-[8px]"
                            >
                                <div className="flex items-center justify-between">
                                    <Tag
                                        color="geekblue"
                                        className="flex items-center gap-[3px] w-fit"
                                    >
                                        <PiBuildingApartmentFill className="text-[16px]" />
                                        Căn hộ
                                    </Tag>
                                    <div className="flex items-center gap-[3px] text-[14px] cursor-pointer font-bold text-[#5e6b82]">
                                        <FaTrashAlt />
                                        Xóa
                                    </div>
                                </div>
                                <div className="mt-[12px] flex items-start gap-[12px]">
                                    <img
                                        src="https://pix8.agoda.net/hotelImages/10954459/-1/f291df6e56661ae54b0daa6a067dbe16.jpg?ca=10&ce=1&ar=1x1&s=600x"
                                        className="w-[64px] h-[64px] object-cover rounded-[4px]"
                                    />
                                    <div>
                                        <p className="font-bold">
                                            Khách sạn Sài Gòn's Book Đà Lạt
                                            (Saigon’s Book Da Lat Hotel)
                                        </p>
                                        <div className="flex items-center gap-[4px]">
                                            <div className="flex">
                                                <IoIosStar className="text-[#b54c01] text-[12px]" />
                                                <IoIosStar className="text-[#b54c01] text-[12px]" />
                                                <IoIosStar className="text-[#b54c01] text-[12px]" />
                                                <FaStarHalf className="text-[#b54c01] text-[12px]" />
                                            </div>
                                            <div className="flex items-center gap-[3px] text-[#5e6b82] text-[14px]">
                                                <FaLocationDot className="text-[14px]" />
                                                Đà Lạt
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-[8px]">
                                            <p className="text-[#2067da] text-[14px]">
                                                8.8 Tuyệt vời
                                            </p>
                                            <p className="text-[#5e6b82] text-[14px]">
                                                2.524 nhận xét
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <hr className="mt-[12px]" />
                                <div className="flex items-end justify-between mt-[12px]">
                                    <div className="flex items-start gap-[12px]">
                                        <Checkbox
                                            onChange={(e) =>
                                                console.log(e.target.checked)
                                            }
                                            className="mt-[2px]"
                                        ></Checkbox>
                                        <div>
                                            <p className="text-[#2067da] text-[16px] font-bold">
                                                2 x Phòng Superior 2 giường
                                            </p>
                                            <p className="flex items-center gap-[4px] text-[13px]">
                                                <FaRegCalendarCheck className="text-[14px]" />
                                                1 tháng 7 năm 2025 - 3 tháng 7
                                                năm 2025
                                            </p>
                                            <p className="flex items-center gap-[4px] text-[13px]">
                                                <FaUserGroup className="text-[14px]" />
                                                Khách: 2 người lớn, 1 trẻ em
                                            </p>
                                            <p className="text-[#007e3e] flex items-center gap-[4px] text-[13px]">
                                                <FaCheck className="text-[14px]" />
                                                Thanh toán tại nơi ở
                                            </p>
                                            <p className="text-[#007e3e] flex items-center gap-[4px] text-[13px]">
                                                <IoShieldCheckmark className="text-[14px]" />
                                                Miễn phí hủy bỏ trước khi nhận
                                                phòng
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-end gap-[8px]">
                                            <p className="text-[24px] font-bold">
                                                2.482.536
                                            </p>
                                            <p className="text-[12px]">₫</p>
                                        </div>
                                        <p className="text-[12px] text-end text-[#5e6b82]">
                                            Bao gồm thuế và phí
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {new Array(3).fill(0).map((item, index) => (
                            <div
                                key={index}
                                className="p-[12px] mt-[12px] border-[1px] border-[#d5d9e2] rounded-[8px]"
                            >
                                <div className="flex items-center justify-between">
                                    <Tag
                                        color="geekblue"
                                        className="flex items-center gap-[3px] w-fit"
                                    >
                                        <BiSolidPlaneAlt className="text-[16px]" />
                                        Chuyến bay
                                    </Tag>
                                    <div className="flex items-center gap-[3px] text-[14px] cursor-pointer font-bold text-[#5e6b82]">
                                        <FaTrashAlt />
                                        Xóa
                                    </div>
                                </div>
                                <div className="mt-[12px]">
                                    <div className="flex items-center gap-[8px]">
                                        <p className="font-bold">
                                            Hà Nội (HAN)
                                        </p>
                                        <AiOutlineSwapRight className="text-[18px]" />
                                        <p className="font-bold">
                                            Đà Lạt (DLI)
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-[8px]">
                                        <img
                                            src="https://img.agoda.net/images/mvc/default/airlines/QH_v3.png?s=1024x"
                                            className="w-[20px] h-[20px] object-cover"
                                        />
                                        <p className="text-[14px]">
                                            T4, ngày 2 tháng 7 năm 2025 • 06:15
                                            — 16:20
                                        </p>
                                    </div>
                                    <p className="text-[13px] text-[#5e6b82]">
                                        VietJet Air • Economy Class • 1h 20ph •
                                        Bay thẳng
                                    </p>
                                </div>
                                <hr className="mt-[12px]" />
                                <div className="flex items-start justify-between mt-[12px]">
                                    <div className="flex items-start gap-[12px]">
                                        <Checkbox
                                            onChange={(e) =>
                                                console.log(e.target.checked)
                                            }
                                            className="mt-[2px]"
                                        ></Checkbox>
                                        <div>
                                            <p className="text-[#2067da] text-[16px] font-bold">
                                                2 x Hành khách
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-end gap-[8px]">
                                            <p className="text-[24px] font-bold">
                                                2.482.536
                                            </p>
                                            <p className="text-[12px]">₫</p>
                                        </div>
                                        <p className="text-[12px] text-end text-[#5e6b82]">
                                            Bao gồm thuế và phí
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="py-[16px] my-[16px]">
                            <p className="text-center text-[#5e6b82] text-[14px]">
                                Kết thúc xe đẩy hàng của quý khách
                            </p>
                            <p className="text-center font-semibold text-[#2067da] text-[13px]">
                                Điều khoản và Điều kiện
                            </p>
                        </div>
                        <div className="p-[16px] mt-[16px] border-[1px] border-[#d5d9e2] rounded-[8px]">
                            <div className="flex items-center gap-[8px]">
                                <p className="text-[22px] font-semibold">
                                    Hoạt động không thể bỏ qua ở Đà Nẵng
                                </p>
                                <Tag color="#007e3e" className="mt-[5px]">
                                    Giảm đến 5%
                                </Tag>
                            </div>
                            <Tabs
                                defaultActiveKey="1"
                                tabPosition={"top"}
                                items={items}
                            />
                            <div className="flex items-center gap-[8px] mt-[32px]">
                                <p className="text-[22px] font-semibold">
                                    Hoàn tất chuyến đi với
                                </p>
                            </div>
                            <div className="grid grid-cols-7 mt-[12px] gap-[8px]">
                                {planForTripsBlueIcon.map((item, index) => (
                                    <Link
                                        key={index}
                                        to={item.link}
                                        style={{
                                            background:
                                                "linear-gradient(rgb(190, 228, 196) 0%, rgba(231, 255, 220, 0) 100%)",
                                        }}
                                        className="rounded-[16px] p-[12px] border-[1px] border-[#5e6b8252] hover:shadow-[rgba(4,7,10,0.24)_0px_4px_10px_0px] transition-all duration-200"
                                    >
                                        {item.icon}
                                        <p className="mt-[16px] leading-[18px] font-semibold">
                                            {item.text}
                                        </p>
                                        <p className="leading-[18px] font-semibold">
                                            {item.subtext}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col-start-3 col-span-1">
                        <div className="sticky top-[24px] py-[16px] px-[12px] border-[1px] border-[#d5d9e2] rounded-[4px]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="leading-[16px]">Tổng giá</p>
                                    <p className="mt-[3px] text-[12px] text-[#707070]">
                                        1 món hàng, bao gồm thuế và phí
                                    </p>
                                </div>
                                <div className="flex gap-[8px]">
                                    <p className="text-[#e12d2d] text-[18px]">
                                        3.633.451
                                    </p>
                                    <p className="text-[#e12d2d] text-[14px] mt-[2px]">
                                        ₫
                                    </p>
                                </div>
                            </div>
                            {/* <div className="mt-[12px] font-semibold text-center py-[10px] px-[48px] text-white bg-[#2067da] border-[1px] border-[#2067da] text-[16px] rounded-[32px] cursor-pointer">
                                Tiếp theo
                            </div> */}
                            <Button
                                type="primary"
                                className="mt-[12px] w-full font-semibold text-center text-white bg-[#2067da]"
                                shape="round"
                                size={"large"}
                            >
                                Tiếp theo
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
