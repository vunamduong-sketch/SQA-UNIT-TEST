import React, { useState } from "react";
import { Tabs } from "antd";
import HotelIncomingTab from "./HotelTab/HotelIncomingTab";
import HotelSuccessfulTab from "./HotelTab/HotelSuccessfulTab";
import HotelCancelledTab from "./HotelTab/HotelCancelledTab";
import { ServiceTab } from "constants/profile";

const Hotel = () => {
    const [currentTab, setCurrentTab] = useState(ServiceTab.INCOMING);

    const items = [
        {
            key: ServiceTab.INCOMING,
            label: <p className="font-semibold">Sắp tới</p>,
            children: (
                <HotelIncomingTab
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                />
            ),
        },
        {
            key: ServiceTab.SUCCESSFUL,
            label: <p className="font-semibold">Hoàn tất</p>,
            children: (
                <HotelSuccessfulTab
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                />
            ),
        },
        {
            key: ServiceTab.CANCELLED,
            label: <p className="font-semibold">Đã hủy</p>,
            children: (
                <HotelCancelledTab
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                />
            ),
        },
    ];

    const onChange = (key) => {
        setCurrentTab(key);
    };

    return (
        <div>
            <Tabs
                className="tab-profile-container"
                items={items}
                onChange={onChange}
                activeKey={currentTab}
            />
        </div>
    );
};

export default Hotel;
