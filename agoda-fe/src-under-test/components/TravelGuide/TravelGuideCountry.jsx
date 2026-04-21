import { SearchOutlined } from "@ant-design/icons";
import { Card, Empty, Input, Pagination, Select } from "antd";
import {
  callFetchHandbook,
  callFetchCity,
  callFetchCountryDetail,
} from "config/api";
import { HANDBOOK_CATEGORIES } from "constants/handbook";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getImage } from "utils/imageUrl";

const TravelGuideCountry = () => {
    const { countryId } = useParams();
    const [searchValue, setSearchValue] = useState("");
    const [country, setCountry] = useState({});
    const [featuredGuides, setFeaturedGuides] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [guides, setGuides] = useState([]);
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
    });
    const [category, setCategory] = useState("all");

    const handleGetCountryDetail = async (id) => {
        const res = await callFetchCountryDetail(id);
        if (res.isSuccess) setCountry(res.data);
    };

    const handleGetHandbook = async (id) => {
        const res = await callFetchHandbook(
            `current=1&pageSize=3&country_id=${id}&recommended=true`
        );
        setFeaturedGuides(res.data);
    };

    const handleGetCity = async (id) => {
        const res = await callFetchCity(`current=1&pageSize=50&country_id=${id}`);
        setDestinations(res.data);
    };

    const handleGetHandbookByCountry = async (query) => {
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
        if (countryId) {
            window.scrollTo(0, 0);
            handleGetCountryDetail(countryId);
            handleGetHandbook(countryId);
            handleGetCity(countryId);
        }
    }, [countryId]);

    useEffect(() => {
        if (countryId) {
            if (category === "all") {
                handleGetHandbookByCountry(
                    `current=${meta.current}&pageSize=${meta.pageSize}&country_id=${countryId}&recommended=true`
                );
            } else {
                handleGetHandbookByCountry(
                    `current=${meta.current}&pageSize=${meta.pageSize}&country_id=${countryId}&category=${category}&recommended=true`
                );
            }
        }
    }, [countryId, meta.current, meta.pageSize, category]);

    const onChangePagination = (pageNumber, pageSize) => {
        setMeta((prev) => ({ ...prev, current: pageNumber, pageSize }));
    };

    return (
        <div>
            <h1>{country.name}</h1>
            <Input
                placeholder="Khám phá cẩm nang về quốc gia, Thành phố"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                suffix={<SearchOutlined />}
            />
            <h2>Bài viết nổi bật về {country.name}</h2>
            {featuredGuides.map((guide) => (
                <Card key={guide.id}>
                    <Link to={`/travel-guide/${guide.city.country.id}/${guide.city.id}/${guide.id}`}>
                        <img src={getImage(guide.image)} alt={guide.title} />
                        {guide.title}
                    </Link>
                </Card>
            ))}
            <h2>Các thành phố nổi tiếng ở Việt Nam</h2>
            {destinations.map((dest) => (
                <Link key={dest.id} to={`/travel-guide/${dest.country.id}/${dest.id}`}>
                    {dest.name}
                </Link>
            ))}
            <h2>Cẩm nang Việt Nam</h2>
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

export default TravelGuideCountry;
