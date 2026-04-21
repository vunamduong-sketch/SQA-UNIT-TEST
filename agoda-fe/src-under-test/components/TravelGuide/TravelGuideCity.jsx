import { SearchOutlined } from "@ant-design/icons";
import { Card, Empty, Input, Pagination, Select } from "antd";
import { callFetchHandbook, callFetchCityDetail } from "config/api";
import { HANDBOOK_CATEGORIES } from "constants/handbook";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getImage } from "utils/imageUrl";

const TravelGuideCity = () => {
    const { cityId } = useParams();
    const [searchValue, setSearchValue] = useState("");
    const [cityDetail, setCityDetail] = useState({});
    const [featuredGuides, setFeaturedGuides] = useState([]);
    const [guides, setGuides] = useState([]);
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
    });
    const [category, setCategory] = useState("all");

    const handleGetCityDetail = async (id) => {
        const res = await callFetchCityDetail(id);
        if (res.isSuccess) setCityDetail(res.data);
    };

    const handleGetHandbook = async (id) => {
        const res = await callFetchHandbook(
            `current=1&pageSize=3&city_id=${id}&recommended=true`
        );
        if (res.isSuccess) setFeaturedGuides(res.data);
    };

    const handleGetHandbookByCity = async (query) => {
        const res = await callFetchHandbook(query);
        if (res.isSuccess) {
            setGuides(res.data);
            setMeta((prev) => ({
                ...prev,
                total: res.meta.totalItems,
                totalPages: res.meta.totalPages,
            }));
        }
    };

    useEffect(() => {
        if (cityId) {
            window.scrollTo(0, 0);
            handleGetCityDetail(cityId);
            handleGetHandbook(cityId);
        }
    }, [cityId]);

    useEffect(() => {
        if (cityId) {
            if (category === "all") {
                handleGetHandbookByCity(
                    `current=${meta.current}&pageSize=${meta.pageSize}&city_id=${cityId}&recommended=true`
                );
            } else {
                handleGetHandbookByCity(
                    `current=${meta.current}&pageSize=${meta.pageSize}&city_id=${cityId}&category=${category}&recommended=true`
                );
            }
        }
    }, [cityId, meta.current, meta.pageSize, category]);

    const onChangePagination = (pageNumber, pageSize) => {
        setMeta((prev) => ({ ...prev, current: pageNumber, pageSize }));
    };

    return (
        <div>
            <h1>{cityDetail?.name}</h1>
            <Input
                placeholder="Khám phá cẩm nang về quốc gia, Thành phố"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                suffix={<SearchOutlined />}
            />
            <h2>Bài viết nổi bật về {cityDetail?.name}</h2>
            {featuredGuides.map((guide) => (
                <Card key={guide.id}>
                    <Link to={`/travel-guide/${guide.city.country.id}/${guide.city.id}/${guide.id}`}>
                        <img src={getImage(guide.image)} alt={guide.title} />
                        {guide.title}
                    </Link>
                </Card>
            ))}
            <h2>Cẩm nang {cityDetail.name}</h2>
            <Select value={category} onChange={setCategory} options={HANDBOOK_CATEGORIES} />
            {guides.length > 0 ? (
                <>
                    {guides.map((guide) => (
                        <Link
                            key={guide.id}
                            to={`/travel-guide/${guide.city.country.id}/${guide.city.id}/${guide.id}`}
                        >
                            {guide.title}
                        </Link>
                    ))}
                    <Pagination total={meta.total} pageSize={meta.pageSize} onChange={onChangePagination} />
                </>
            ) : (
                <Empty description="Không có bài viết nào" />
            )}
        </div>
    );
};

export default TravelGuideCity;
