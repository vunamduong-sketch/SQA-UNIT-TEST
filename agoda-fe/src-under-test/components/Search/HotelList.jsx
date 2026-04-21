import React from "react";
import { Row, Col, Spin, Empty, Select, Button } from "antd";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import HotelCard from "./HotelCard";

const { Option } = Select;

const sortOptions = [
  "Khuyến nghị",
  "Giá thấp nhất",
  "Giá cao nhất",
  "Đánh giá tốt nhất",
  "Khoảng cách gần nhất",
];

const HotelList = ({
  hotels,
  loading = false,
  startDate,
  endDate,
  adult,
  child,
  room,
  stay_type,
}) => {
  console.log("HotelList rendered with hotels:", hotels);
  const [activeSort, setActiveSort] = React.useState(0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <Empty
        description="Không tìm thấy khách sạn nào phù hợp"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex-col justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-600">Sắp xếp theo:</span>
          {sortOptions.map((sort, idx) => (
            <button
              key={idx}
              className={`px-3 py-2 rounded ${
                activeSort === idx
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveSort(idx)}
            >
              {sort}
            </button>
          ))}
        </div>
        <div>
          <span className="text-gray-600">Tìm thấy </span>
          <span className="font-semibold">{hotels.length} khách sạn</span>
          <span className="text-gray-600"> tại Nha Trang</span>
        </div>

        {/* <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Sắp xếp:</span>
          <Select defaultValue="recommended" style={{ width: 180 }}>
            <Option value="recommended">Khuyến nghị</Option>
            <Option value="price_low">Giá thấp nhất</Option>
            <Option value="price_high">Giá cao nhất</Option>
            <Option value="rating">Đánh giá cao nhất</Option>
            <Option value="distance">Khoảng cách</Option>
          </Select>
        </div> */}
      </div>

      {/* Hotel Cards */}
      <div className="space-y-4">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            startDate={startDate}
            endDate={endDate}
            adult={adult}
            child={child}
            room={room}
            stay_type={stay_type}
          />
        ))}
      </div>
    </div>
  );
};

export default HotelList;
