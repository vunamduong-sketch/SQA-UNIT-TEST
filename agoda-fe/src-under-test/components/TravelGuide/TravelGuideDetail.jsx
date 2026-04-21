import React from "react";
import { Breadcrumb, Card } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  callFetchHandbookDetail,
  callFetchHandbook,
  callFetchDetailUserHandbookInteractionByHandbookId,
  callUpsertUserHandbookInteraction,
  callFetchCountryDetail,
  callFetchCityDetail,
} from "config/api";
import { getImage, getUserAvatar } from "utils/imageUrl";
import ReviewHandbook from "./ReviewHandbook";

export default function TravelGuideDetail() {
    const { countryId, cityId, travelId } = useParams();
    const [country, setCountry] = useState({});
    const [city, setCity] = useState({});
    const [handbookDetail, setHandbookDetail] = useState({});
    const [relatedArticles, setRelatedArticles] = useState([]);

    const handleGetCountryDetail = async (id) => {
        const res = await callFetchCountryDetail(id);
        if (res.isSuccess) setCountry(res.data);
    };

    const handleGetCityDetail = async (id) => {
        const res = await callFetchCityDetail(id);
        if (res.isSuccess) setCity(res.data);
    };

    const handleGetHandbookDetail = async (id) => {
        const res = await callFetchHandbookDetail(id);
        if (res.isSuccess) setHandbookDetail(res.data);
    };

    const handleGetHandbooks = async (query) => {
        const res = await callFetchHandbook(query);
        if (res.isSuccess) setRelatedArticles(res.data);
    };

    const handleUpdateTotalClick = async () => {
        const res = await callFetchDetailUserHandbookInteractionByHandbookId(handbookDetail.id);
        if (res.isSuccess) {
            const userHandbookInteraction = res.data;
            await callUpsertUserHandbookInteraction({
                handbook_id: handbookDetail.id,
                click_count: userHandbookInteraction.click_count + 1,
                positive_count: userHandbookInteraction.positive_count,
                negative_count: userHandbookInteraction.negative_count,
                neutral_count: userHandbookInteraction.neutral_count,
            });
        } else {
            await callUpsertUserHandbookInteraction({
                handbook_id: handbookDetail.id,
                click_count: 1,
                positive_count: 0,
                negative_count: 0,
                neutral_count: 0,
            });
        }
    };

    useEffect(() => {
        if (travelId && cityId && countryId) {
            window.scrollTo(0, 0);
            handleGetCountryDetail(countryId);
            handleGetCityDetail(cityId);
            handleGetHandbookDetail(travelId);
            handleGetHandbooks(`current=1&pageSize=20&city_id=${cityId}&recommended=true`);
        }
    }, [travelId, cityId, countryId]);

    useEffect(() => {
        if (handbookDetail?.id) {
            handleUpdateTotalClick();
        }
    }, [handbookDetail]);

    return (
        <div>
            <Breadcrumb
                items={[
                    { title: <Link to="/">Trang chủ</Link> },
                    { title: <Link to="/travel-guide">Cẩm nang du lịch</Link> },
                    { title: <Link to={`/travel-guide/${country.id}`}>{country.name}</Link> },
                    { title: <Link to={`/travel-guide/${city?.country?.id}/${city.id}`}>{city.name}</Link> },
                    { title: handbookDetail.title },
                ]}
                separator={<RightOutlined style={{ fontSize: "12px" }} />}
            />
            <div dangerouslySetInnerHTML={{ __html: handbookDetail?.description || "" }}></div>
            {handbookDetail?.author?.id && (
                <div>
                    <img
                        alt={`${handbookDetail.author.last_name} ${handbookDetail.author.first_name}`}
                        src={getUserAvatar(handbookDetail.author.avatar)}
                    />
                    <h3>
                        Tác giả: {handbookDetail.author.last_name} {handbookDetail.author.first_name}
                    </h3>
                </div>
            )}
            <ReviewHandbook />
            <h3>Bạn cũng có thể thích</h3>
            {relatedArticles.map((article) => (
                <a
                    key={article.id}
                    href={`/travel-guide/${article.city.country.id}/${article.city.id}/${article.id}`}
                >
                    <Card>
                        <img src={getImage(article.image)} alt={article.title} />
                        <h4>{article.title}</h4>
                    </Card>
                </a>
            ))}
        </div>
    );
}
