import React from "react";
import { useState } from "react";
import ReviewComments from "./ReviewCommentList";

const ReviewTabView = () => {
    const [activeTab, setActiveTab] = useState("agoda");
    const [currentPage, setCurrentPage] = useState(1);

    const tabs = [
        { id: "agoda", label: "NHẬN XÉT TRÊN AGODA (200)" },
        { id: "booking", label: "NHẬN XÉT TRÊN BOOKING.COM (55)" },
        { id: "other", label: "NHẬN XÉT KHÁC (31)" },
    ];

    const renderFiltersAndPagination = () => (
        <div className="mt-6 w-full">
            <div className="grid grid-cols-3 gap-4">
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                    <option>Tất cả mọi du khách (200)</option>
                    <option>Gia đình</option>
                    <option>Cặp đôi</option>
                    <option>Khách du lịch một mình</option>
                    <option>Nhóm du khách</option>
                </select>
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                    <option>Mọi loại phòng</option>
                    <option>Phòng Tiêu chuẩn giường đôi</option>
                    <option>Deluxe Giường đôi có ban công</option>
                </select>
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                    <option>Mọi ngôn ngữ</option>
                    <option>Tiếng Việt</option>
                    <option>Tiếng Anh</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center mt-4 w-full">
                <span className="text-sm font-bold text-gray-800">
                    Đang hiển thị 40 nhận xét thực từ du khách
                </span>
                <div className="flex items-center space-x-2 align-end justify-end px-4 py-2">
                    <span className="text-sm font-bold text-gray-800">
                        Sắp xếp theo
                    </span>
                    <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                        <option>Hữu ích nhất</option>
                        <option>Mới nhất</option>
                        <option>Cũ nhất</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-center items-center space-x-2 mt-6 w-full">
                <button className="px-2 py-1 border rounded-lg text-gray-600 hover:bg-gray-100">
                    &lt;
                </button>
                {[...Array(8)].map((_, index) => (
                    <button
                        key={index}
                        className={`px-2 py-1 border rounded-lg ${currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-600"
                            }`}
                        onClick={() => setCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
                <button className="px-2 py-1 border rounded-lg text-gray-600 hover:bg-gray-100">
                    &gt;
                </button>
            </div>
        </div>
    );

    const renderProgressBar = (label, value, color) => {
        const percentage = (value / 10) * 100;
        return (
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 w-24">{label}</span>
                <div className="w-full bg-gray-200 rounded-full h-1 relative">
                    <div
                        className="absolute top-0 left-0 h-1 rounded-full"
                        style={{
                            width: `${percentage}%`,
                            backgroundColor: color,
                        }}
                    ></div>
                </div>
                <span className={`text-xs font-bold text-${color}-600`}>{value}</span>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "agoda":
                return (
                    <div className="grid grid-cols-[20%_50%_30%] gap-6 mt-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Điểm số qua Agoda</h2>
                            <p className="text-2xl font-bold text-blue-600">7,0/10</p>
                            <p className="text-sm text-gray-600">Hài Lòng - Dựa trên 200 bài đánh giá</p>
                            <p className="text-sm text-gray-600 mt-4">Điểm cao đối với Hồ Chí Minh</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {renderProgressBar("Vị trí", 7.7, "green")}
                            {renderProgressBar("Đáng giá tiền", 6.9, "green")}
                            {renderProgressBar("Dịch vụ", 6.8, "blue")}
                            {renderProgressBar("Cơ sở vật chất", 7.1, "green")}
                            {renderProgressBar("Độ sạch sẽ", 6.8, "blue")}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Xếp hạng:</h3>
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center">
                                    <input type="checkbox" className="mr-2" />
                                    <span className="text-sm text-gray-600">9+ Hiếm Có (13)</span>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" className="mr-2" />
                                    <span className="text-sm text-gray-400">8-9 Xuất Sắc (0)</span>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" className="mr-2" />
                                    <span className="text-sm text-gray-600">7-8 Rất Tốt (4)</span>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" className="mr-2" />
                                    <span className="text-sm text-gray-600">6-7 Tốt (1)</span>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" className="mr-2" />
                                    <span className="text-sm text-gray-600">&lt;6 Dưới Mức Mong Đợi (22)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="review-tab-view rounded-lg shadow-md p-6">
            <div className="flex space-x-4 border-b border-gray-300 pb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`text-sm font-bold ${activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
                            }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-4">{renderTabContent()}</div>
            {renderFiltersAndPagination()}
            <ReviewComments />
        </div>
    );
};

export default ReviewTabView;
