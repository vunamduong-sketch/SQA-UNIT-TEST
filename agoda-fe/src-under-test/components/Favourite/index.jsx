import React from "react";
import NoItemImg from "../../images/favourite/no-item.png";
import { Link } from "react-router-dom";

const Favourite = () => {
    return (
        <div>
            <div className="max-w-[1100px] mx-auto mt-[24px] mb-[96px]">
                <h1 className="text-[24px] font-semibold">
                    Danh sach yeu thich
                </h1>
                <p>2 muc</p>
                <div className="mt-[36px] grid grid-cols-3 gap-[24px]">
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://q-xx.bstatic.com/xdata/images/hotel/max500/350897237.jpg?k=4d2ed857c8a2ff2d7ae0df213a77d324c46966688517c17138564c7b1c1b9e34&o="
                            className="h-[180px] w-full object-cover"
                        />
                        <div className="p-[24px]">
                            <p className="text-center text-[22px]">
                                Ha Long, Viet Nam
                            </p>
                            <p className="text-center text-[16px] text-[#737373]">
                                2 khach san
                            </p>
                        </div>
                    </Link>
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://q-xx.bstatic.com/xdata/images/hotel/max500/350897237.jpg?k=4d2ed857c8a2ff2d7ae0df213a77d324c46966688517c17138564c7b1c1b9e34&o="
                            className="h-[180px] w-full object-cover"
                        />
                        <div className="p-[24px]">
                            <p className="text-center text-[22px]">
                                Ha Long, Viet Nam
                            </p>
                            <p className="text-center text-[16px] text-[#737373]">
                                2 khach san
                            </p>
                        </div>
                    </Link>
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://q-xx.bstatic.com/xdata/images/hotel/max500/350897237.jpg?k=4d2ed857c8a2ff2d7ae0df213a77d324c46966688517c17138564c7b1c1b9e34&o="
                            className="h-[180px] w-full object-cover"
                        />
                        <div className="p-[24px]">
                            <p className="text-center text-[22px]">
                                Ha Long, Viet Nam
                            </p>
                            <p className="text-center text-[16px] text-[#737373]">
                                2 khach san
                            </p>
                        </div>
                    </Link>
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://q-xx.bstatic.com/xdata/images/hotel/max500/350897237.jpg?k=4d2ed857c8a2ff2d7ae0df213a77d324c46966688517c17138564c7b1c1b9e34&o="
                            className="h-[180px] w-full object-cover"
                        />
                        <div className="p-[24px]">
                            <p className="text-center text-[22px]">
                                Ha Long, Viet Nam
                            </p>
                            <p className="text-center text-[16px] text-[#737373]">
                                2 khach san
                            </p>
                        </div>
                    </Link>
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://q-xx.bstatic.com/xdata/images/hotel/max500/350897237.jpg?k=4d2ed857c8a2ff2d7ae0df213a77d324c46966688517c17138564c7b1c1b9e34&o="
                            className="h-[180px] w-full object-cover"
                        />
                        <div className="p-[24px]">
                            <p className="text-center text-[22px]">
                                Ha Long, Viet Nam
                            </p>
                            <p className="text-center text-[16px] text-[#737373]">
                                2 khach san
                            </p>
                        </div>
                    </Link>
                    <Link
                        to={"/favourite/1"}
                        className="shadow-[rgba(0,0,0,0.2)_0px_1px_3px_1px] hover:shadow-[0_2px_8px_3px_rgba(0,0,0,0.2)] transition-all duration-200"
                    >
                        <img
                            src="https://q-xx.bstatic.com/xdata/images/hotel/max500/350897237.jpg?k=4d2ed857c8a2ff2d7ae0df213a77d324c46966688517c17138564c7b1c1b9e34&o="
                            className="h-[180px] w-full object-cover"
                        />
                        <div className="p-[24px]">
                            <p className="text-center text-[22px]">
                                Ha Long, Viet Nam
                            </p>
                            <p className="text-center text-[16px] text-[#737373]">
                                2 khach san
                            </p>
                        </div>
                    </Link>
                </div>
                {/* <div className="mt-[48px] flex flex-col items-center">
                    <p className="text-center text-[24px] font-semibold">
                        Chua co gi o day...
                    </p>
                    <img
                        src={NoItemImg}
                        className="w-[412px] h-[247px] mt-[72px]"
                    />
                    <p className="mt-[48px] text-center text-[14px]">
                        Chi can nhap vao bieu tuong trai tim cua trang khach san
                        de luu lai va de dang tim lai sau do.
                    </p>
                    <div className="mt-[20px] text-center py-[12px] px-[48px] text-white bg-[#5392f9] border-[1px] border-[#5392f9] text-[16px] rounded-[8px] cursor-pointer">
                        Quay lai
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default Favourite;
