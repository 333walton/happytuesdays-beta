// Save this as: src/components/HappyTuesdayNewsFeedWrapper/index.js

import React from "react";
import HappyTuesdayNewsFeed from "../HappyTuesdayNewsFeed/HappyTuesdayNewsFeed";

const HappyTuesdayNewsFeedWrapper = (props) => {
  // Extract the data from props which contains initialTab and initialSubTab
  const { data } = props;

  console.log("HappyTuesdayNewsFeedWrapper props:", props);
  console.log("Extracted data:", data);

  // Since HappyTuesdayNewsFeed seems to handle its own window chrome,
  // we just pass the props directly
  return (
    <HappyTuesdayNewsFeed
      initialTab={data?.initialTab || "blog"}
      initialSubTab={data?.initialSubTab}
      inIE={false}
    />
  );
};

export default HappyTuesdayNewsFeedWrapper;
