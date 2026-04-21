import React, { useEffect, useState } from "react";
import { Empty, Pagination, Slider, Spin, message } from "antd";
import { useParams } from "react-router-dom";
import FilterGroup from "./FilterGroup";
import HotelCard from "./HotelCard";
import SortBar from "./SortBar";
import { RANGE_PRICE_HOTEL } from "constants/hotel";
import { createHotelSlug } from "utils/slugHelpers";
import { getImage } from "utils/imageUrl";
import { callFetchHotel } from "config/api";
// HotelList component
const HotelList = ({ hotels, loading }) => {
    if (loading)
        return (
            <div className="flex justify-center py-8">
                <Spin size="large" />
            </div>
        );
    if (!hotels || hotels.length === 0)
        return (
            <div className="py-8">
                <Empty
                    description="Không tìm thấy khách sạn nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </div>
        );
    return (
        <div>
            {hotels.map((hotel, idx) => (
                <HotelCard key={hotel.id || idx} hotel={hotel} />
            ))}
        </div>
    );
};

// Transform API data
const transformHotelData = (apiHotel) => {
    const stripHtml = (html) =>
        html ? html.replace(/<[^>]*>/g, "").trim() : "";
    const extractFacilities = (htmlTable) => {
        if (!htmlTable) return [];
        const matches = htmlTable.match(/>([^<]+)</g);
        return matches
            ? matches
                  .map((m) => m.replace(/[><]/g, "").trim())
                  .filter((t) => t.length > 1)
                  .slice(0, 4)
            : [];
    };

    return {
        id: apiHotel.id,
        name: apiHotel.name || "Khách sạn",
        image: getImage(apiHotel.images?.[0]?.image),
        thumbnails: apiHotel.images?.map((img) => getImage(img.image)) || [],
        stars: Math.floor(apiHotel.avg_star || 0),
        area: apiHotel.location || "N/A",
        mapUrl:
            apiHotel.lat && apiHotel.lng
                ? `https://maps.google.com/?q=${apiHotel.lat},${apiHotel.lng}`
                : null,
        facilities: extractFacilities(apiHotel.facilities),
        review: apiHotel.best_comment || "",
        rating: apiHotel.avg_star?.toFixed(1) || "N/A",
        ratingText: getRatingText(apiHotel.avg_star || 0),
        ratingCount: apiHotel.review_count,
        price: apiHotel.min_price || 0,
        url: `/hotel/${createHotelSlug(apiHotel.name, apiHotel.id)}`,
        cityName: apiHotel.city?.name || "",
        withUs: stripHtml(apiHotel.withUs) || "",
        slug: createHotelSlug(apiHotel.name, apiHotel.id),
        city: apiHotel.city,
    };
};

const getRatingText = (rating) =>
    rating >= 9
        ? "Tuyệt hảo"
        : rating >= 8
        ? "Rất tốt"
        : rating >= 7
        ? "Tốt"
        : rating >= 6
        ? "Ổn"
        : "Trung bình";

const TopHotel = () => {
    const { cityId } = useParams();

    const [hotels, setHotels] = useState([]);
    const [isLoadingHotels, setIsLoadingHotels] = useState(false);
    const [error, setError] = useState("");
    const [filterSearch, setFilterSearch] = useState({
        avg_star: -1,
    });

    const [valuePrices, setValuePrices] = useState([0, 100]);

    const [valueSort, setValueSort] = useState("recommended=true");

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
    });

    const filterOptions = [
        {
            title: "Đánh giá sao",
            key: "avg_star",
            options: [
                { label: "5 sao", value: 5 },
                { label: "4 sao", value: 4 },
                { label: "3 sao", value: 3 },
                { label: "2 sao", value: 2 },
                { label: "1 sao", value: 1 },
                { label: "Tất cả", value: -1 },
            ],
        },
    ];

    const sortOptions = [
        { label: "Lựa chọn hàng đầu", value: "recommended=true" },
        { label: "Giá thấp nhất trước", value: "sort=min_price-asc" },
        { label: "Được đánh giá tốt nhất", value: "sort=total_positive-desc" },
    ];

    const handleGetHotels = async (body) => {
        setIsLoadingHotels(true);
        const res = await callFetchHotel({ ...body });

        if (res.isSuccess) {
            setHotels(res.data);
            setMeta({
                current: res.meta.currentPage,
                pageSize: res.meta.itemsPerPage,
                total: res.meta.totalItems,
                totalPages: res.meta.totalPages,
            });
        } else {
            setError(res.message || "Đã có lỗi xảy ra khi tải khách sạn");
        }
        setIsLoadingHotels(false);
    };

    useEffect(() => {
        if (cityId) {
            const [sort, valToSort] = valueSort.split("=");
            handleGetHotels({
                cityId,
                current: meta.current,
                pageSize: meta.pageSize,
                ...(filterSearch.avg_star !== -1
                    ? { avg_star: filterSearch.avg_star }
                    : {}),
                ...(valuePrices[0] >= 0
                    ? {
                          min_avg_price: RANGE_PRICE_HOTEL * valuePrices[0],
                      }
                    : {}),
                ...(valuePrices[1] <= 100
                    ? {
                          max_avg_price: RANGE_PRICE_HOTEL * valuePrices[1],
                      }
                    : {}),
                ...(sort === "recommended"
                    ? { recommended: true }
                    : { sort: valToSort }),
            });
        }
    }, [
        cityId,
        JSON.stringify(filterSearch),
        JSON.stringify(valuePrices),
        meta.current,
        meta.pageSize,
    ]);

    const onChangePagination = (pageNumber, pageSize) => {
        setMeta({
            ...meta,
            current: pageNumber,
            pageSize: pageSize,
        });
    };

    const transformedHotels = hotels.map(transformHotelData);

    useEffect(() => {
        if (error) message.error(error);
    }, [error]);

    return (
        <div className="bg-white rounded-xl shadow p-6 mt-8">
            <h2 className="text-2xl font-bold mb-6">
                {meta.total > 0
                    ? `${meta.total} khách sạn tốt nhất`
                    : "Khách sạn"}
            </h2>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/5">
                    {filterOptions.map((group, idx) => (
                        <FilterGroup
                            key={idx}
                            title={group.title}
                            group={group}
                            filterSearch={filterSearch}
                            setFilterSearch={setFilterSearch}
                        />
                    ))}
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <p className="text-[20px] font-semibold">Giá</p>
                        <div className="mt-[10px] flex items-center justify-between">
                            <p>
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(RANGE_PRICE_HOTEL * valuePrices[0])}
                            </p>
                            <p>
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(RANGE_PRICE_HOTEL * valuePrices[1])}
                            </p>
                        </div>
                        <Slider
                            className="mt-[12px]"
                            range
                            tooltip={{
                                placement: "bottom",
                            }}
                            value={valuePrices}
                            onChange={setValuePrices}
                        />
                    </div>
                </div>
                <div className="md:w-3/4">
                    <SortBar
                        sorts={sortOptions}
                        valueSort={valueSort}
                        setValueSort={setValueSort}
                    />
                    <HotelList
                        hotels={transformedHotels}
                        loading={isLoadingHotels}
                    />
                    {meta.total > 0 && (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                pageSize={meta.pageSize}
                                showQuickJumper
                                total={meta.total}
                                onChange={onChangePagination}
                                current={meta.current}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopHotel;
