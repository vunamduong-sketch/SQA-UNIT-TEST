import React, { useEffect, useState } from "react";
import { Spin, Alert, Select, InputNumber, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { Hotel, ArrowLeft, Home } from "lucide-react";
import { getPromotionDetail, getCountries, getCities } from "config/api";
import PromotionBanner from "./PromotionBanner";
import HotelCard from "./HotelCard";
import PromotionEmptyState from "./PromotionEmptyState";

const { Option } = Select;

const PromotionHotels = () => {
  const navigate = useNavigate();
  const { promotionId } = useParams();
  const [promotionData, setPromotionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    country_id: null,
    city_id: null,
    min_price: null,
    min_rating: null,
  });

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await getCountries();
        const data = res?.data || [];
        setCountries(data);
      } catch (err) {
        console.error("load countries failed", err);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      if (!filters.country_id) {
        setCities([]);
        return;
      }
      try {
        const params = { country_id: filters.country_id };
        const res = await getCities(params);
        const data = res?.data || [];
        setCities(data);
      } catch (err) {
        console.error("load cities failed", err);
        setCities([]);
      }
    };
    loadCities();
  }, [filters.country_id]);

  useEffect(() => {
    const loadPromotionData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = { promotion_type: 1 };
        if (filters.city_id) params.city_id = filters.city_id;
        if (filters.min_price) params.min_price = filters.min_price;
        if (filters.min_rating) params.min_rating = filters.min_rating;

        const res = await getPromotionDetail(promotionId, params);
        const data = res?.data || res;
        data.hotel_promotions = (data.hotel_promotions || []).filter(Boolean);
        setPromotionData(data);
        setError(null);
      } catch (err) {
        setError("Không thể tải dữ liệu khuyến mãi. Vui lòng thử lại sau.");
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
    setFilters({ country_id: null, city_id: null, min_price: null, min_rating: null });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!promotionData) return null;

  return (
    <div className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-8 md:py-12">
        <PromotionBanner
          title={promotionData.title}
          description={promotionData.description}
          discountPercent={promotionData.discount_percent}
          startDate={promotionData.start_date}
          endDate={promotionData.end_date}
          image={promotionData.image}
        />
      </section>

      <section className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <button type="button" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <button type="button" onClick={() => navigate("/")}>
            <Home className="w-4 h-4" /> Trang chủ
          </button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-4">
        <div>
          <div>
            <div>
              <label>Quốc gia</label>
              <Select
                allowClear
                placeholder="Chọn quốc gia"
                value={filters.country_id}
                onChange={(val) => handleApply({ country_id: val, city_id: null })}
              >
                {countries.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label>Thành phố</label>
              <Select
                allowClear
                placeholder="Chọn thành phố"
                value={filters.city_id}
                onChange={(val) => handleApply({ city_id: val })}
                disabled={!filters.country_id}
              >
                {cities.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label>Giá tối thiểu</label>
              <InputNumber
                min={0}
                placeholder="Min price"
                value={filters.min_price}
                onChange={(val) => handleApply({ min_price: val })}
              />
            </div>

            <div>
              <label>Đánh giá tối thiểu</label>
              <InputNumber
                min={0}
                max={5}
                step={0.1}
                placeholder="Min rating"
                value={filters.min_rating}
                onChange={(val) => handleApply({ min_rating: val })}
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

      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Hotel className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">Khách sạn đang khuyến mãi</h2>
          <span className="text-muted-foreground">
            ({promotionData.hotels?.length || 0} khách sạn)
          </span>
        </div>

        {promotionData.hotels && promotionData.hotels.length > 0 ? (
          <div>
            {promotionData.hotels.map((hotel) => (
              <HotelCard key={hotel.id} item={hotel} />
            ))}
          </div>
        ) : (
          <PromotionEmptyState
            message="Không có khách sạn phù hợp với bộ lọc của bạn."
            onReset={handleReset}
          />
        )}
      </section>
    </div>
  );
};

export default PromotionHotels;
