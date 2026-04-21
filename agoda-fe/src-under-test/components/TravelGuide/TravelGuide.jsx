import { SearchOutlined } from "@ant-design/icons";
import { Card, Input, Pagination, Select } from "antd";
import { callFetchCountry, callFetchCity, callFetchHandbook } from "config/api";
import { HANDBOOK_CATEGORIES } from "constants/handbook";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getImage } from "utils/imageUrl";

const TravelGuide = () => {
    const [searchValue, setSearchValue] = useState("");
    const [featuredGuides, setFeaturedGuides] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [destinationMostFeature, setDestinationMostFeature] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
        totalPages: 1,
    });
    const [category, setCategory] = useState("all");

    const handleGetHandbooks = async (query) => {
        const res = await callFetchHandbook(query);
        if (res.isSuccess) {
            setFeaturedGuides(res.data);
        }
    };

    const handleGetHandbooksOther = async (query) => {
        const res = await callFetchHandbook(query);
        if (res.isSuccess) {
            setRecommendations(res.data);
            setMeta((prev) => ({
                ...prev,
                total: res.meta.totalItems,
                totalPages: res.meta.totalPages,
            }));
        }
    };

    const handleGetCountry = async (query) => {
        const res = await callFetchCountry(query);
        if (res.isSuccess) {
            setDestinations(res.data);
        }
    };

    const handleGetCity = async (query) => {
        const res = await callFetchCity(query);
        if (res.isSuccess) {
            setDestinationMostFeature(res.data);
        }
    };

    useEffect(() => {
        handleGetHandbooks("current=1&pageSize=3&recommended=true");
        handleGetCountry("current=1&pageSize=50");
        handleGetCity("current=1&pageSize=50");
        handleGetHandbooksOther("current=1&pageSize=20&recommended=true");
    }, []);

    useEffect(() => {
        if (category === "all") {
            handleGetHandbooksOther(
                `current=${meta.current}&pageSize=${meta.pageSize}&recommended=true`
            );
        } else {
            handleGetHandbooksOther(
                `current=${meta.current}&pageSize=${meta.pageSize}&category=${category}&recommended=true`
            );
        }
    }, [meta.current, meta.pageSize, category]);

    const onChangePagination = (pageNumber, pageSize) => {
        setMeta((prev) => ({
            ...prev,
            current: pageNumber,
            pageSize,
        }));
    };

    return (
        <div>
            <h1>Cẩm nang du lịch</h1>
            <Input
                placeholder="Khám phá cẩm nang về quốc gia, Thành phố"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                suffix={<SearchOutlined />}
            />

            <h2>Cẩm nang du lịch nổi bật</h2>
            {featuredGuides.map((guide) => (
                <Card key={guide.id}>
                    <Link to={`/travel-guide/${guide.city.country.id}/${guide.city.id}/${guide.id}`}>
                        <img src={getImage(guide.image)} alt={guide.title} />
                        <h3>{guide.title}</h3>
                    </Link>
                </Card>
            ))}

            <h2>Điểm đến nổi tiếng</h2>
            {destinations.map((dest) => (
                <Link key={dest.id} to={`/travel-guide/${dest.id}`}>
                    {dest.name}
                </Link>
            ))}

            <h2>Điểm đến nổi bật</h2>
            {destinationMostFeature.map((dest) => (
                <Link key={dest.id} to={`/travel-guide/${dest.country.id}/${dest.id}`}>
                    {dest.name}, {dest.country.name}
                </Link>
            ))}

            <h2>Những nơi phải ghé thăm: {meta.total} Cẩm nang du lịch mới nhất</h2>
            <Select
                value={category}
                onChange={setCategory}
                options={HANDBOOK_CATEGORIES}
            />
            {recommendations.map((item) => (
                <Link
                    key={item.id}
                    to={`/travel-guide/${item.city.country.id}/${item.city.id}/${item.id}`}
                >
                    {item.title}
                </Link>
            ))}
            <Pagination total={meta.total} pageSize={meta.pageSize} onChange={onChangePagination} />
        </div>
    );
};

export default TravelGuide;
