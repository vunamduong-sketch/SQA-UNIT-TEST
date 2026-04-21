import React from "react";
import { Button } from "antd";

const PromotionEmptyState = ({ message = "Không có kết quả", onReset }) => {
  return (
    <div>
      <h3>Không có kết quả</h3>
      <p>{message}</p>
      {onReset && <Button onClick={onReset}>Bỏ lọc</Button>}
    </div>
  );
};

export default PromotionEmptyState;
