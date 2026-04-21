import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  Input,
  Popover,
  InputNumber,
  Divider,
  Select,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getCities } from "config/api";

const { RangePicker } = DatePicker;

const SearchForm = ({ onSearch, initialValues = {} }) => {
  const [searchValues, setSearchValues] = useState({
    location: initialValues.location || "",
    cityId: initialValues.cityId || "",
    dates: [null, null],
    rooms: initialValues.room || 1,
    adults: initialValues.adult || 1,
    children: initialValues.child || 0,
    stay_type: initialValues.stay_type || "overnight",
  });

  useEffect(() => {
    if (initialValues.startDate && initialValues.endDate) {
      setSearchValues((prev) => ({
        ...prev,
        dates: [dayjs(initialValues.startDate), dayjs(initialValues.endDate)],
      }));
    }
    setSearchValues((prev) => ({
      ...prev,
      location: initialValues.location || "",
      cityId: initialValues.cityId || "",
      stay_type: initialValues.stay_type || "overnight",
    }));
    setLocationInput(initialValues.location || "");
  }, [
    initialValues.startDate,
    initialValues.endDate,
    initialValues.location,
    initialValues.cityId,
    initialValues.stay_type,
  ]);

  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [guestPopoverOpen, setGuestPopoverOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const [locationInput, setLocationInput] = useState(
    initialValues.location || ""
  );
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const res = await getCities({ name: query });
      setSuggestions(res.data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
    setLoadingSuggestions(false);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(locationInput);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [locationInput, fetchSuggestions]);

  const updateLocationAndSearch = (item) => {
    const newValues = {
      ...searchValues,
      location: item.name,
      cityId: item.id,
    };
    setSearchValues(newValues);
    setLocationInput(item.name);
    setLocationPopoverOpen(false);
    // Nếu đủ info, tự động search
    if (newValues.dates[0] && newValues.dates[1] && newValues.adults) {
      onSearch(newValues);
    }
  };

  const handleBackdropClick = () => {
    setLocationPopoverOpen(false);
    setGuestPopoverOpen(false);
    setDatePickerOpen(false);
  };

  const LocationPopoverContent = () => (
    <div className="w-64">
      <div className="text-sm font-medium text-gray-600 mb-3">
        Điểm đến gợi ý
      </div>
      {loadingSuggestions ? (
        <div className="text-center py-4">Đang tải...</div>
      ) : (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="p-2 hover:bg-gray-50 cursor-pointer rounded flex items-center"
              onClick={() => updateLocationAndSearch(item)}
            >
              <EnvironmentOutlined className="text-gray-400 mr-2" />
              <span>{item.name}</span>
            </div>
          ))}
          {suggestions.length === 0 && locationInput.length >= 2 && (
            <div className="text-center py-4 text-gray-500">
              Không tìm thấy kết quả
            </div>
          )}
        </div>
      )}
    </div>
  );

  const GuestPopoverContent = () => (
    <div className="w-72 p-2">
      {/* Rooms */}
      <div className="flex items-center justify-between py-3">
        <div>
          <div className="font-medium">Phòng</div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            type="text"
            shape="circle"
            icon={<MinusOutlined />}
            onClick={() =>
              setSearchValues({
                ...searchValues,
                rooms: Math.max(1, searchValues.rooms - 1),
              })
            }
            disabled={searchValues.rooms <= 1}
            className="border border-gray-300"
          />
          <span className="w-8 text-center font-medium">
            {searchValues.rooms}
          </span>
          <Button
            type="text"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={() =>
              setSearchValues({
                ...searchValues,
                rooms: Math.min(10, searchValues.rooms + 1),
              })
            }
            disabled={searchValues.rooms >= 10}
            className="border border-gray-300"
          />
        </div>
      </div>

      <Divider className="my-2" />

      {/* Adults */}
      <div className="flex items-center justify-between py-3">
        <div>
          <div className="font-medium">Người lớn</div>
          <div className="text-sm text-gray-500">18 tuổi trở lên</div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            type="text"
            shape="circle"
            icon={<MinusOutlined />}
            onClick={() =>
              setSearchValues({
                ...searchValues,
                adults: Math.max(1, searchValues.adults - 1),
              })
            }
            disabled={searchValues.adults <= 1}
            className="border border-gray-300"
          />
          <span className="w-8 text-center font-medium">
            {searchValues.adults}
          </span>
          <Button
            type="text"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={() =>
              setSearchValues({
                ...searchValues,
                adults: Math.min(10, searchValues.adults + 1),
              })
            }
            disabled={searchValues.adults >= 10}
            className="border border-gray-300"
          />
        </div>
      </div>

      <Divider className="my-2" />

      {/* Children */}
      <div className="flex items-center justify-between py-3">
        <div>
          <div className="font-medium">Trẻ em</div>
          <div className="text-sm text-gray-500">0-17 tuổi</div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            type="text"
            shape="circle"
            icon={<MinusOutlined />}
            onClick={() =>
              setSearchValues({
                ...searchValues,
                children: Math.max(0, searchValues.children - 1),
              })
            }
            disabled={searchValues.children <= 0}
            className="border border-gray-300"
          />
          <span className="w-8 text-center font-medium">
            {searchValues.children}
          </span>
          <Button
            type="text"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={() =>
              setSearchValues({
                ...searchValues,
                children: Math.min(10, searchValues.children + 1),
              })
            }
            disabled={searchValues.children >= 10}
            className="border border-gray-300"
          />
        </div>
      </div>
    </div>
  );

  const getGuestSummary = () => {
    const totalGuests = searchValues.adults + searchValues.children;
    return `${totalGuests} người lớn${
      searchValues.children > 0 ? `, ${searchValues.children} trẻ em` : ""
    }, ${searchValues.rooms} phòng`;
  };

  return (
    <>
      {(locationPopoverOpen || guestPopoverOpen || datePickerOpen) && (
        <div
          className="fixed inset-0 bg-black opacity-35 z-10"
          data-selenium="backdrop"
          onClick={handleBackdropClick}
        />
      )}

      <Card className="mb-6 shadow-lg relative z-20">
        <Row gutter={[16, 16]} align="middle">
          {/* Destination */}
          <Col xs={24} md={6}>
            <div className="space-y-2">
              <Popover
                content={<LocationPopoverContent />}
                trigger="click"
                open={locationPopoverOpen}
                onOpenChange={setLocationPopoverOpen}
                placement="bottomLeft"
                overlayClassName="z-30"
              >
                <Input
                  size="large"
                  prefix={<EnvironmentOutlined className="text-gray-400" />}
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="cursor-pointer"
                  placeholder="Chọn điểm đến"
                  onFocus={() => setLocationPopoverOpen(true)}
                />
              </Popover>
            </div>
          </Col>

          {/* Date Range */}
          <Col xs={24} md={8}>
            <div className="space-y-2">
              <RangePicker
                size="large"
                className="w-full"
                value={searchValues.dates}
                onChange={(dates) =>
                  setSearchValues({ ...searchValues, dates: dates || [] })
                }
                format="DD/MM/YYYY"
                open={datePickerOpen}
                onOpenChange={setDatePickerOpen}
                dropdownClassName="z-30"
                placeholder={["Nhận phòng", "Trả phòng"]}
              />
            </div>
          </Col>

          {/* Guests & Rooms */}
          <Col xs={24} md={6}>
            <div className="space-y-2 mt-2">
              <Popover
                content={<GuestPopoverContent />}
                trigger="click"
                open={guestPopoverOpen}
                onOpenChange={setGuestPopoverOpen}
                placement="bottomLeft"
                overlayClassName="z-30"
              >
                <Input
                  size="large"
                  prefix={<UserOutlined className="text-gray-400" />}
                  value={getGuestSummary()}
                  readOnly
                  className="cursor-pointer"
                  placeholder="Chọn số khách"
                />
              </Popover>
            </div>
          </Col>

          {/* Search Button */}
          <Col xs={24} md={4}>
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              onClick={() => onSearch(searchValues)}
              className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
            >
              Tìm kiếm
            </Button>
          </Col>
        </Row>

        {/* Stay Type */}
        <Col xs={24} md={4}>
          <div className="space-y-2">
            <Select
              size="large"
              value={searchValues.stay_type}
              onChange={(value) =>
                setSearchValues({ ...searchValues, stay_type: value })
              }
              className="w-full"
              placeholder="Loại lưu trú"
            >
              <Select.Option value="overnight">Qua đêm</Select.Option>
              <Select.Option value="dayuse">Trong ngày</Select.Option>
            </Select>
          </div>
        </Col>
      </Card>
    </>
  );
};

export default SearchForm;
