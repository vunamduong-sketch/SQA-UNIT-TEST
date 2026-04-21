import React from "react";
import BackgroundActivity from "./BackgroundActivity";
import TopActivity from "./TopActivity";
import ExploreLocationNearby from "./ExploreLocationNearby";
import WhyChooseAgoda from "./WhyChooseAgoda";

const Activity = () => {
    return (
        <div>
            <BackgroundActivity />
            <TopActivity />
            <ExploreLocationNearby />
            <WhyChooseAgoda />
        </div>
    );
};

export default Activity;
