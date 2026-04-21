import React, { useEffect, useState } from "react";
import { Spin, Alert, Select, Button, DatePicker, Input } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft, Home } from "lucide-react";
import { getPromotionDetail, getCities, getImageUrl } from "config/api";
import PromotionBanner from "./PromotionBanner";
import PromotionEmptyState from "./PromotionEmptyState";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

const PromotionActivities = () => {
    const navigate = useNavigate();
    const { promotionId } = useParams();
    const [promotionData, setPromotionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        city_id: null,
        min_price: null,
        max_price: null,
        min_rating: null,
        start_date: null,
        end_date: null,
        search: null,
    });

    const [cities, setCities] = useState([]);

    useEffect(() => {
        const loadCities = async () => {
            try {
                const res = await getCities();
                const data = res?.data || [];
                setCities(data);
            } catch (err) {
                console.error("load cities failed", err);
            }
        };
        loadCities();
    }, []);

    useEffect(() => {
        const loadPromotionData = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = { promotion_type: 3 };
                if (filters.city_id) params.city_id = filters.city_id;
                if (filters.min_price) params.min_price = filters.min_price;
                if (filters.max_price) params.max_price = filters.max_price;
                if (filters.min_rating) params.min_rating = filters.min_rating;
                if (filters.start_date) params.start_date = filters.start_date;
                if (filters.end_date) params.end_date = filters.end_date;
                if (filters.search) params.search = filters.search;

                const res = await getPromotionDetail(promotionId, params);
                const data = res?.data || res;
                data.activity_promotions = (
                    data.activity_promotions || []
                ).filter(Boolean);
                setPromotionData(data);
                setError(null);
            } catch (err) {
                setError(
                    "Không thể tải dữ liệu khuyến mãi. Vui lòng thử lại sau."
                );
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (promotionId) loadPromotionData();
    }, [promotionId, filters]);

    const handleApply = (newPartial) => {
        setFilters((prev) => ({ ...prev, ...newPartial }));
    };

    const handleReset = () => {
        setFilters({
            city_id: null,
            min_price: null,
            max_price: null,
            min_rating: null,
            start_date: null,
            end_date: null,
            search: null,
        });
    };

    const handleDateChange = (dates) => {
        if (dates) {
            handleApply({
                start_date: dates[0].format("YYYY-MM-DD"),
                end_date: dates[1].format("YYYY-MM-DD"),
            });
        } else {
            handleApply({ start_date: null, end_date: null });
        }
    };

    if (loading) {
        return <Spin size="large" />;
    }

    if (error) {
        return <Alert message="Lỗi" description={error} type="error" showIcon />;
    }

    if (!promotionData) return null;

    return (
        <div>
            <section>
                <PromotionBanner
                    title={promotionData.title}
                    description={promotionData.description}
                    discountPercent={promotionData.discount_percent}
                    startDate={promotionData.start_date}
                    endDate={promotionData.end_date}
                    image={promotionData.image}
                />
            </section>

            <section>
                <div>
                    <button type="button" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </button>
                    <button type="button" onClick={() => navigate("/")}>
                        <Home className="w-4 h-4" /> Trang chủ
                    </button>
                </div>
            </section>

            <section>
                <div>
                    <div>
                        <div>
                            <label>Thành phố</label>
                            <Select
                                allowClear
                                showSearch
                                placeholder="Chọn thành phố"
                                value={filters.city_id}
                                onChange={(val) => handleApply({ city_id: val })}
                            >
                                {cities.map((c) => (
                                    <Option key={c.id} value={c.id}>
                                        {c.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <label>Tìm kiếm</label>
                            <Input
                                placeholder="Tìm theo tên hoặc mô tả..."
                                value={filters.search}
                                onChange={(e) =>
                                    handleApply({ search: e.target.value })
                                }
                                allowClear
                            />
                        </div>

                        <div>
                            <label>Khoảng ngày</label>
                            <RangePicker
                                value={
                                    filters.start_date && filters.end_date
                                        ? [
                                              dayjs(filters.start_date),
                                              dayjs(filters.end_date),
                                          ]
                                        : null
                                }
                                onChange={handleDateChange}
                                format="YYYY-MM-DD"
                            />
                        </div>

                        <div>
                            <Button type="primary" onClick={() => setFilters({ ...filters })}>
                                Áp dụng
                            </Button>
                            <Button onClick={handleReset}>Reset</Button>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div>
                    <Calendar className="h-6 w-6 text-primary" />
                    <h2>Hoạt động đang khuyến mãi</h2>
                    <span>
                        ({promotionData.activity_promotions?.length || 0} hoạt động)
                    </span>
                </div>

                {promotionData.activitys && promotionData.activitys.length > 0 ? (
                    <div>
                        {promotionData.activitys.map((activity) => {
                            const avgPrice = activity.avg_price || 0;
                            const discountPercent = activity.discount || 0;
                            const priceAfterDiscount =
                                avgPrice > 0
                                    ? Math.round(avgPrice * (1 - discountPercent / 100))
                                    : 0;
                            const formatVND = (val) =>
                                val.toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                });
                            return (
                                <div key={activity.id}>
                                    {activity.thumbnails && (
                                        <img
                                            src={getImageUrl(activity.thumbnails)}
                                            alt={activity.name}
                                        />
                                    )}
                                    <div>
                                        <div>
                                            <h3>{activity.name || "N/A"}</h3>
                                            <div>-{discountPercent || 0}%</div>
                                        </div>
                                        <div>
                                            <div>
                                                <div>Giá trung bình</div>
                                                {avgPrice > 0 ? (
                                                    <>
                                                        <span>{formatVND(avgPrice)}</span>
                                                        <span>{formatVND(priceAfterDiscount)}</span>
                                                    </>
                                                ) : (
                                                    <span>N/A</span>
                                                )}
                                            </div>
                                            <div>
                                                <div>Đánh giá</div>
                                                <div>
                                                    ⭐ {activity?.avg_star?.toFixed(1) || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                navigate(`/activity/detail/${activity.id}`)
                                            }
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <PromotionEmptyState
                        message="Không có hoạt động phù hợp với bộ lọc của bạn."
                        onReset={handleReset}
                    />
                )}
            </section>
        </div>
    );
};

export default PromotionActivities;
