import React, { useState } from "react";
import FlightIncomingTab from "./FlightTab/FlightIncomingTab";
import FlightSuccessfulTab from "./FlightTab/FlightSuccessfulTab";
import FlightCancelledTab from "./FlightTab/FlightCancelledTab";
import { Tabs } from "antd";
import { ServiceTab } from "constants/profile";

const Flight = () => {
    const [currentTab, setCurrentTab] = useState(ServiceTab.INCOMING);

    const items = [
        {
            key: ServiceTab.INCOMING,
            label: <p className="font-semibold">Sắp tới</p>,
            children: (
                <FlightIncomingTab
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                />
            ),
        },
        {
            key: ServiceTab.SUCCESSFUL,
            label: <p className="font-semibold">Hoàn tất</p>,
            children: (
                <FlightSuccessfulTab
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                />
            ),
        },
        {
            key: ServiceTab.CANCELLED,
            label: <p className="font-semibold">Đã hủy</p>,
            children: (
                <FlightCancelledTab
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

export default Flight;
