import React, { useState } from "react";
import ActivityIncomingTab from "./ActivityTab/ActivityIncomingTab";
import ActivitySuccessfulTab from "./ActivityTab/ActivitySuccessfulTab";
import ActivityCancelledTab from "./ActivityTab/ActivityCancelledTab";
import { Tabs } from "antd";
import { ServiceTab } from "constants/profile";

const Activity = () => {
    const [currentTab, setCurrentTab] = useState(ServiceTab.INCOMING);

    const items = [
        {
            key: ServiceTab.INCOMING,
            label: <p className="font-semibold">Sắp tới</p>,
            children: (
                <ActivityIncomingTab
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                />
            ),
        },
        {
            key: ServiceTab.SUCCESSFUL,
            label: <p className="font-semibold">Hoàn tất</p>,
            children: (
                <ActivitySuccessfulTab
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                />
            ),
        },
        {
            key: ServiceTab.CANCELLED,
            label: <p className="font-semibold">Đã hủy</p>,
            children: (
                <ActivityCancelledTab
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

export default Activity;
