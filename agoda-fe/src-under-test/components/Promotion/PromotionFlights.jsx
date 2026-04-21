import React, { useEffect, useState } from "react";
import {
    Spin,
    Alert,
    Select,
    Button,
    DatePicker,
    Radio,
    InputNumber,
    message,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { Plane, Calendar, Users } from "lucide-react";
import { getPromotionDetail, getAirports, getAirlines } from "config/api";
import dayjs from "dayjs";
import { formatDate } from "utils/formatDate";

const { Option } = Select;

const PromotionFlights = () => {
    const navigate = useNavigate();
    const { promotionId } = useParams();
    const [promotionData, setPromotionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        origin_id: null,
        destination_id: null,
        start_date: null,
        airline_id: null,
        price_sort: null,
    });

    const [searchForm, setSearchForm] = useState({
        tripType: "one-way",
        origin: null,
        destination: null,
        departureDate: null,
        returnDate: null,
        passengers: 1,
        seatClass: "economy",
    });

    const [airports, setAirports] = useState([]);
    const [airlines, setAirlines] = useState([]);

    useEffect(() => {
        const loadAirports = async () => {
            try {
                const res = await getAirports({
                    current: 1,
                    pageSize: 1000,
                });
                const data = res?.data || [];
                setAirports(data);
            } catch (err) {
                console.error("load airports failed", err);
            }
        };

        const loadAirlines = async () => {
            try {
                const res = await getAirlines();
                const data = res?.data || [];
                setAirlines(data);
            } catch (err) {
                console.error("load airlines failed", err);
            }
        };

        loadAirports();
        loadAirlines();
    }, []);

    useEffect(() => {
        const loadPromotionData = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await getPromotionDetail(promotionId);
                const data = res?.data || res;
                data.flight_promotions = (data.flight_promotions || []).filter(
                    Boolean
                );
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

    const handleSearchFlight = () => {
        if (
            !searchForm.origin ||
            !searchForm.destination ||
            !searchForm.departureDate ||
            (searchForm.tripType === "round-trip" && !searchForm.returnDate)
        ) {
            message.error({
                content: "Vui lòng điền đầy đủ thông tin tìm kiếm!",
                duration: 4,
                style: {
                    fontSize: "16px",
                    marginTop: "20vh",
                },
            });
            return;
        }

        if (searchForm.origin === searchForm.destination) {
            message.warning({
                content: "Điểm đi và điểm đến không được trùng nhau!",
                duration: 4,
                style: {
                    fontSize: "16px",
                    marginTop: "20vh",
                },
            });
            return;
        }

        if (dayjs(searchForm.departureDate).isBefore(dayjs(), "day")) {
            message.warning({
                content: "Ngày đi không được nhỏ hơn ngày hiện tại!",
                duration: 4,
                style: {
                    fontSize: "16px",
                    marginTop: "20vh",
                },
            });
            return;
        }

        const params = new URLSearchParams({
            origin: searchForm.origin || "",
            destination: searchForm.destination || "",
            departureDate: searchForm.departureDate || "",
            returnDate: searchForm.returnDate || "",
            passengers: searchForm.passengers || 1,
            seatClass: searchForm.seatClass || "economy",
            tripType: searchForm.tripType || "one-way",
            promotionId: promotionId,
        });
        navigate(`/flight?${params.toString()}`);
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
                <div>
                    <div>
                        <div>
                            <h1>{promotionData.title}</h1>
                            <p>{promotionData.description}</p>
                            <div>
                                <Calendar className="h-5 w-5" />
                                <span>
                                    {formatDate(promotionData.start_date)} -{" "}
                                    {formatDate(promotionData.end_date)}
                                </span>
                            </div>
                            {promotionData.discount_percent && (
                                <div>
                                    Giảm tới {Number(promotionData.discount_percent)}%
                                </div>
                            )}
                        </div>

                        <div>
                            <div>
                                <Radio.Group
                                    value={searchForm.tripType}
                                    onChange={(e) =>
                                        setSearchForm((prev) => ({
                                            ...prev,
                                            tripType: e.target.value,
                                        }))
                                    }
                                >
                                    <Radio value="one-way">Một chiều</Radio>
                                    <Radio value="round-trip">Khứ hồi</Radio>
                                </Radio.Group>
                            </div>

                            <div>
                                <div>
                                    <label>
                                        <Plane className="inline h-4 w-4 mr-1" />
                                        Bay từ
                                    </label>
                                    <Select
                                        showSearch
                                        placeholder="Chọn sân bay đi"
                                        value={searchForm.origin}
                                        onChange={(val) =>
                                            setSearchForm((prev) => ({
                                                ...prev,
                                                origin: val,
                                            }))
                                        }
                                    >
                                        {airports.map((a) => (
                                            <Option key={a.id} value={a.id}>
                                                {a.name}-{a.code}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <label>
                                        <Plane className="inline h-4 w-4 mr-1 rotate-90" />
                                        Bay đến
                                    </label>
                                    <Select
                                        showSearch
                                        placeholder="Chọn sân bay đến"
                                        value={searchForm.destination}
                                        onChange={(val) =>
                                            setSearchForm((prev) => ({
                                                ...prev,
                                                destination: val,
                                            }))
                                        }
                                    >
                                        {airports.map((a) => (
                                            <Option key={a.id} value={a.id}>
                                                {a.name}-{a.code}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <label>
                                        <Calendar className="inline h-4 w-4 mr-1" />
                                        Ngày đi
                                    </label>
                                    <DatePicker
                                        placeholder="Chọn ngày đi"
                                        value={
                                            searchForm.departureDate
                                                ? dayjs(searchForm.departureDate)
                                                : null
                                        }
                                        onChange={(date) =>
                                            setSearchForm((prev) => ({
                                                ...prev,
                                                departureDate: date
                                                    ? date.format("YYYY-MM-DD")
                                                    : null,
                                            }))
                                        }
                                    />
                                </div>

                                {searchForm.tripType === "round-trip" && (
                                    <div>
                                        <label>
                                            <Calendar className="inline h-4 w-4 mr-1" />
                                            Ngày về
                                        </label>
                                        <DatePicker
                                            placeholder="Chọn ngày về"
                                            value={
                                                searchForm.returnDate
                                                    ? dayjs(searchForm.returnDate)
                                                    : null
                                            }
                                            onChange={(date) =>
                                                setSearchForm((prev) => ({
                                                    ...prev,
                                                    returnDate: date
                                                        ? date.format("YYYY-MM-DD")
                                                        : null,
                                                }))
                                            }
                                        />
                                    </div>
                                )}

                                <div>
                                    <label>
                                        <Users className="inline h-4 w-4 mr-1" />
                                        Hành khách & Hạng
                                    </label>
                                    <div>
                                        <InputNumber
                                            min={1}
                                            value={searchForm.passengers}
                                            onChange={(val) => {
                                                const newVal =
                                                    val === null || val === undefined
                                                        ? 1
                                                        : val;
                                                setSearchForm((prev) => ({
                                                    ...prev,
                                                    passengers: Number(newVal),
                                                }));
                                            }}
                                        />
                                        <Select
                                            value={searchForm.seatClass}
                                            onChange={(val) =>
                                                setSearchForm((prev) => ({
                                                    ...prev,
                                                    seatClass: val,
                                                }))
                                            }
                                        >
                                            <Option value="economy">Phổ thông</Option>
                                            <Option value="business">Thương gia</Option>
                                            <Option value="first">Hạng nhất</Option>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Button type="primary" onClick={handleSearchFlight}>
                                        TÌM CHUYẾN BAY
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PromotionFlights;
