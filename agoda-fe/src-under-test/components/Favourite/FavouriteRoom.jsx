import React from "react";
import { Link } from "react-router-dom";
import { IoIosStar } from "react-icons/io";
import { FaStarHalf } from "react-icons/fa";

const FavouriteRoom = () => {
    return (
        <div>
            <div className="max-w-[1100px] mx-auto mt-[24px] mb-[96px]">
                <h1 className="text-[18px] font-semibold">
                    Danh sach yeu thich
                </h1>
                <p>2 muc</p>
                <div className="mt-[36px] grid grid-cols-4 gap-[24px]">
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://pix8.agoda.net/hotelImages/65343180/0/fae25be9b085520005aae3858db8c919.jpg?ce=2&s=312x235&ar=16x9"
                            className="h-[150px] w-full object-cover"
                        />
                        <div className="py-[16px] px-[12px]">
                            <p className="text-[16px] leading-[20px]">
                                Tru by Hilton Ha Long Hon Gai Centre
                            </p>
                            <p className="mt-[4px] text-[12px] text-[#737373]">
                                Cang Hon Gai, Ha Long
                            </p>
                            <div className="flex">
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <FaStarHalf className="text-[#ffa726]" />
                            </div>
                            <div className="mt-[12px]">
                                <hr />
                                <div className="flex items-center justify-between py-[8px]">
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            9,1
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            Tren ca tuyet voi
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            8
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            nhan xet
                                        </p>
                                    </div>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[13px] text-[#737373]">
                                        Moi dem tu
                                    </p>
                                    <p className="line-through text-[#737373]">
                                        1.055.715
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[12px] text-[#737373]">
                                        VND
                                    </p>
                                    <p className="text-[20px] text-[#e12d2d]">
                                        659.291
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://pix8.agoda.net/hotelImages/65343180/0/fae25be9b085520005aae3858db8c919.jpg?ce=2&s=312x235&ar=16x9"
                            className="h-[150px] w-full object-cover"
                        />
                        <div className="py-[16px] px-[12px]">
                            <p className="text-[16px] leading-[20px]">
                                Tru by Hilton Ha Long Hon Gai Centre
                            </p>
                            <p className="mt-[4px] text-[12px] text-[#737373]">
                                Cang Hon Gai, Ha Long
                            </p>
                            <div className="flex">
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <FaStarHalf className="text-[#ffa726]" />
                            </div>
                            <div className="mt-[12px]">
                                <hr />
                                <div className="flex items-center justify-between py-[8px]">
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            9,1
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            Tren ca tuyet voi
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            8
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            nhan xet
                                        </p>
                                    </div>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[13px] text-[#737373]">
                                        Moi dem tu
                                    </p>
                                    <p className="line-through text-[#737373]">
                                        1.055.715
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[12px] text-[#737373]">
                                        VND
                                    </p>
                                    <p className="text-[20px] text-[#e12d2d]">
                                        659.291
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://pix8.agoda.net/hotelImages/65343180/0/fae25be9b085520005aae3858db8c919.jpg?ce=2&s=312x235&ar=16x9"
                            className="h-[150px] w-full object-cover"
                        />
                        <div className="py-[16px] px-[12px]">
                            <p className="text-[16px] leading-[20px]">
                                Tru by Hilton Ha Long Hon Gai Centre
                            </p>
                            <p className="mt-[4px] text-[12px] text-[#737373]">
                                Cang Hon Gai, Ha Long
                            </p>
                            <div className="flex">
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <FaStarHalf className="text-[#ffa726]" />
                            </div>
                            <div className="mt-[12px]">
                                <hr />
                                <div className="flex items-center justify-between py-[8px]">
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            9,1
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            Tren ca tuyet voi
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            8
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            nhan xet
                                        </p>
                                    </div>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[13px] text-[#737373]">
                                        Moi dem tu
                                    </p>
                                    <p className="line-through text-[#737373]">
                                        1.055.715
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[12px] text-[#737373]">
                                        VND
                                    </p>
                                    <p className="text-[20px] text-[#e12d2d]">
                                        659.291
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://pix8.agoda.net/hotelImages/65343180/0/fae25be9b085520005aae3858db8c919.jpg?ce=2&s=312x235&ar=16x9"
                            className="h-[150px] w-full object-cover"
                        />
                        <div className="py-[16px] px-[12px]">
                            <p className="text-[16px] leading-[20px]">
                                Tru by Hilton Ha Long Hon Gai Centre
                            </p>
                            <p className="mt-[4px] text-[12px] text-[#737373]">
                                Cang Hon Gai, Ha Long
                            </p>
                            <div className="flex">
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <FaStarHalf className="text-[#ffa726]" />
                            </div>
                            <div className="mt-[12px]">
                                <hr />
                                <div className="flex items-center justify-between py-[8px]">
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            9,1
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            Tren ca tuyet voi
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            8
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            nhan xet
                                        </p>
                                    </div>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[13px] text-[#737373]">
                                        Moi dem tu
                                    </p>
                                    <p className="line-through text-[#737373]">
                                        1.055.715
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[12px] text-[#737373]">
                                        VND
                                    </p>
                                    <p className="text-[20px] text-[#e12d2d]">
                                        659.291
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://pix8.agoda.net/hotelImages/65343180/0/fae25be9b085520005aae3858db8c919.jpg?ce=2&s=312x235&ar=16x9"
                            className="h-[150px] w-full object-cover"
                        />
                        <div className="py-[16px] px-[12px]">
                            <p className="text-[16px] leading-[20px]">
                                Tru by Hilton Ha Long Hon Gai Centre
                            </p>
                            <p className="mt-[4px] text-[12px] text-[#737373]">
                                Cang Hon Gai, Ha Long
                            </p>
                            <div className="flex">
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <FaStarHalf className="text-[#ffa726]" />
                            </div>
                            <div className="mt-[12px]">
                                <hr />
                                <div className="flex items-center justify-between py-[8px]">
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            9,1
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            Tren ca tuyet voi
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            8
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            nhan xet
                                        </p>
                                    </div>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[13px] text-[#737373]">
                                        Moi dem tu
                                    </p>
                                    <p className="line-through text-[#737373]">
                                        1.055.715
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[12px] text-[#737373]">
                                        VND
                                    </p>
                                    <p className="text-[20px] text-[#e12d2d]">
                                        659.291
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://pix8.agoda.net/hotelImages/65343180/0/fae25be9b085520005aae3858db8c919.jpg?ce=2&s=312x235&ar=16x9"
                            className="h-[150px] w-full object-cover"
                        />
                        <div className="py-[16px] px-[12px]">
                            <p className="text-[16px] leading-[20px]">
                                Tru by Hilton Ha Long Hon Gai Centre
                            </p>
                            <p className="mt-[4px] text-[12px] text-[#737373]">
                                Cang Hon Gai, Ha Long
                            </p>
                            <div className="flex">
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <IoIosStar className="text-[#ffa726]" />
                                <FaStarHalf className="text-[#ffa726]" />
                            </div>
                            <div className="mt-[12px]">
                                <hr />
                                <div className="flex items-center justify-between py-[8px]">
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            9,1
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            Tren ca tuyet voi
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-[4px] text-[#737373]">
                                        <p className="font-bold text-[13px]">
                                            8
                                        </p>
                                        <p className="text-[14px] font-semibold">
                                            nhan xet
                                        </p>
                                    </div>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[13px] text-[#737373]">
                                        Moi dem tu
                                    </p>
                                    <p className="line-through text-[#737373]">
                                        1.055.715
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-[4px]">
                                    <p className="text-[12px] text-[#737373]">
                                        VND
                                    </p>
                                    <p className="text-[20px] text-[#e12d2d]">
                                        659.291
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FavouriteRoom;
