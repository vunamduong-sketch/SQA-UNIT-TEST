import React, { useState } from "react";
import { EnvironmentOutlined } from "@ant-design/icons";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { formatCurrency } from "utils/formatCurrency";

const HotelCard = ({ hotel }) => {
    const [showFullReview, setShowFullReview] = useState(false);

    //  const displayPrice =
    //   hotel?.min_price && !isNaN(hotel.min_price)
    //     ? Number(hotel.min_price).toLocaleString("vi-VN") + " VND"
    //     : "Liên hệ";

    return (
        <div className="flex bg-white rounded-xl shadow p-4 mb-4 hover:shadow-lg transition-shadow cursor-pointer">
            {/* Cột trái: Ảnh + gallery */}
            <div className="w-2/5 flex flex-col items-center">
                <Link
                    to={`/hotel/${hotel.slug}`}
                    className="w-full h-48 rounded-lg overflow-hidden"
                >
                    <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                </Link>
                {/* Gallery thumbnails */}
                {hotel.thumbnails && hotel.thumbnails.length > 0 && (
                    <div className="grid grid-cols-4 gap-1 mt-2 w-full">
                        {hotel.thumbnails.slice(0, 8).map((thumb, idx) => (
                            <div className="relative hover:opacity-80">
                                <img
                                    key={idx}
                                    src={thumb}
                                    alt={`thumb-${idx}`}
                                    className="w-full h-12 object-cover rounded cursor-pointer"
                                />
                                {(idx === 7 ||
                                    idx === hotel.thumbnails.length - 1) && (
                                    <div className="text-[14px] absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-[rgba(0,0,0,.7)] text-white">
                                        Xem hết
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cột giữa: Thông tin khách sạn */}
            <div className="w-3/5 px-6 flex flex-col justify-between">
                {/* Tên khách sạn - Clickable */}
                <div>
                    <Link
                        to={`/hotel/${hotel.slug}`}
                        className="hover:text-blue-600 transition-colors"
                    >
                        <div className="text-2xl font-bold">{hotel.name}</div>
                        {hotel.englishName && (
                            <div className="text-lg text-gray-600 font-medium">
                                ({hotel.englishName})
                            </div>
                        )}
                    </Link>

                    {/* Sao, vị trí, bản đồ */}
                    <div className="flex items-center gap-2 mt-1 mb-2">
                        <span className="flex">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                                <FaStar
                                    key={i}
                                    className="text-yellow-400 text-base"
                                />
                            ))}
                        </span>
                        {hotel?.city?.id ? (
                            <Link
                                to={`/city/${hotel?.city?.id}`}
                                className="text-blue-600 text-sm font-semibold hover:underline cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {hotel?.city?.name}
                            </Link>
                        ) : (
                            <span className="text-blue-600 text-sm font-semibold">
                                {hotel.area}
                            </span>
                        )}
                        {hotel.mapUrl && (
                            <a
                                href={hotel.mapUrl}
                                className="text-blue-500 text-xs underline ml-2 flex items-center gap-1"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking map
                            >
                                <EnvironmentOutlined />
                                Xem trên bản đồ
                            </a>
                        )}
                    </div>

                    {/* Tiện ích */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {hotel.facilities.map((f, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 border rounded-full text-xs bg-gray-50"
                            >
                                {f}
                            </span>
                        ))}
                    </div>

                    {/* Review nổi bật */}
                    {hotel.review && (
                        <div className="text-gray-700 text-sm mb-2">
                            "
                            {showFullReview || hotel.review.length < 180
                                ? hotel.review
                                : hotel.review.slice(0, 180) + "..."}
                            "
                            {hotel.review.length > 180 && (
                                <button
                                    className="text-blue-500 ml-2 text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        setShowFullReview((v) => !v);
                                    }}
                                >
                                    {showFullReview ? "Ẩn ▲" : "Xem thêm ▼"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Cột phải: Đánh giá, giá, nút */}
            <div className="w-1/4 flex flex-col items-end justify-between pl-4">
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-1">
                        <div>
                            <div className="text-gray-700 text-sm font-semibold text-right">
                                {hotel.ratingText}
                            </div>
                            <div className="text-xs text-gray-500">
                                {hotel.ratingCount} nhận xét
                            </div>
                        </div>
                        <span className="bg-blue-50 border border-blue-400 text-blue-600 px-2 py-1 rounded text-base font-bold">
                            {hotel.rating}
                        </span>
                    </div>
                </div>

                <div className="mt-4 text-right">
                    <div className="text-xs text-gray-500">
                        Giá trung bình mỗi đêm
                    </div>
                    <div className="font-bold text-red-600 text-2xl">
                        {formatCurrency((+hotel.price)?.toFixed(0))}đ
                    </div>
                </div>

                {/* Thay đổi thành Link thay vì external link */}
                <Link
                    to={`/hotel/${hotel.slug}`}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-base font-semibold text-center"
                    onClick={(e) => e.stopPropagation()} // Prevent double navigation
                >
                    Xem chi tiết
                </Link>
            </div>
        </div>
    );
};

export default HotelCard;
