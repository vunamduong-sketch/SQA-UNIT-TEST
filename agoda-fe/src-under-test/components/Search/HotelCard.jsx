import React from "react";
import { Tooltip, Card, Rate, Button, Tag, Badge, Image } from "antd";
import {
  HeartOutlined,
  WifiOutlined,
  CarOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  SoundOutlined,
  RestOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { getImageUrl } from "config/api";
import { useNavigate } from "react-router-dom";

const HotelCard = ({
  hotel,
  startDate,
  endDate,
  adult,
  child,
  room,
  stay_type,
}) => {
  const navigate = useNavigate();

  const createHotelSlug = (hotelName, hotelId) => {
    if (!hotelName) return hotelId;
    return (
      hotelName
        .toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim() + `-${hotelId}`
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  };

  const amenities = hotel.amenitiesAndFacilities
    ? hotel.amenitiesAndFacilities.split(", ")
    : [];

  return (
    <Card
      className="mb-4 hover:shadow-lg transition-shadow duration-300"
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex">
        {/* Hotel Image */}
        <div className="w-72 h-full relative overflow-hidden">
          <Image
            src={
              hotel.images && hotel.images.length > 0
                ? getImageUrl(hotel.images[0].image)
                : "/default-hotel.jpg"
            }
            alt={hotel.name}
            className="w-full h-full object-cover rounded-l-lg"
            preview={false}
          />
          <Button
            type="text"
            icon={<HeartOutlined />}
            className="absolute top-2 righĐiểm nổi bật nhất:t-2 bg-white/80 hover:bg-white"
          />
        </div>

        {/* Hotel Info */}
        <div className="flex-1 p-4">
          <div className="flex justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <Rate
                  disabled
                  defaultValue={hotel.avg_star}
                  allowHalf
                  className="text-sm"
                />
                <span className="text-sm text-gray-600">
                  ({hotel.review_count} đánh giá)
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 cursor-pointer">
                {hotel.name}
              </h3>

              <div className="flex items-center text-gray-600 mb-3">
                <EnvironmentOutlined className="mr-1" />
                <span className="text-sm">{hotel.location}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {amenities.slice(0, 4).map((amenity) => (
                  <Tag key={amenity} className="text-xs">
                    {amenity === "WiFi" && <WifiOutlined className="mr-1" />}
                    {amenity === "Parking" && <CarOutlined className="mr-1" />}
                    {amenity}
                  </Tag>
                ))}
                {amenities.length > 4 && (
                  <Tag className="text-xs">
                    +{amenities.length - 4} tiện nghi
                  </Tag>
                )}
              </div>

              <div className="flex gap-2">
                {/* Có thể add logic cho freeBreakfast, freeCancellation nếu có trong data */}
              </div>
              <div className="w-full border-t border-gray-300 my-4" />
              <div className="flex items-center gap-3 mb-2 mt-4">
                <span className="text-sm text-gray-600">
                  Điểm nổi bật nhất:{" "}
                </span>
                <Tooltip title={hotel.mostFeature}>
                  <HomeOutlined className="text-lg cursor-pointer text-black" />
                </Tooltip>
                <div className="h-5 border-l border-gray-300" />
                <Tooltip title={hotel.facilities}>
                  <SoundOutlined className="text-lg cursor-pointer text-black" />
                </Tooltip>
                <div className="h-5 border-l border-gray-300" />
                <Tooltip title={hotel.regulation}>
                  <RestOutlined className="text-lg cursor-pointer text-black" />
                </Tooltip>
                <div className="h-5 border-l border-gray-300" />
                <Tooltip title={hotel.withUs}>
                  <FireOutlined className="text-lg cursor-pointer text-black" />
                </Tooltip>
              </div>
            </div>
            {/* Price and Booking Button */}
            <div className="mx-4 w-px bg-gray-300" />
            <div className="text-right">
              <div className="mb-2">
                <div className="text-2xl font-bold text-red-600">
                  {formatPrice(parseFloat(hotel.min_price))}
                </div>
                <div className="text-xs text-gray-500">mỗi đêm</div>
              </div>

              <Button
                type="primary"
                size="large"
                className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (startDate) params.set("startDate", startDate);
                  if (endDate) params.set("endDate", endDate);
                  if (adult) params.set("adult", adult);
                  if (child) params.set("child", child);
                  if (room) params.set("room", room);
                  if (stay_type) params.set("stay_type", stay_type);
                  const slug = createHotelSlug(hotel.name, hotel.id);
                  navigate(`/hotel/${slug}?${params.toString()}`);
                }}
              >
                Xem phòng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HotelCard;
