import React from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "config/api";

const HotelCard = ({ item }) => {
  const navigate = useNavigate();
  const {
    name,
    thumbnail,
    max_discount,
    avg_star,
    review_count,
    locationInfo,
    total_weighted_score,
    min_price,
  } = item;

  let originalPrice = min_price;
  let finalPrice = min_price;
  if (max_discount && min_price) {
    originalPrice = min_price;
    finalPrice = min_price * (1 - max_discount / 100);
  }

  return (
    <div onClick={() => navigate(`/hotel/${item.id}`)}>
      <img src={getImageUrl(thumbnail)} alt={name} />
      <h3>{name}</h3>
      <span>{locationInfo}</span>
      <span>{total_weighted_score?.toFixed(1) || avg_star?.toFixed(1) || "-"}</span>
      <span>{review_count?.toLocaleString() || 0} nhận xét</span>
      {originalPrice && originalPrice !== finalPrice && (
        <span>đ {originalPrice.toLocaleString()}</span>
      )}
      <span>đ {finalPrice?.toLocaleString() || "-"}</span>
    </div>
  );
};

export default HotelCard;
