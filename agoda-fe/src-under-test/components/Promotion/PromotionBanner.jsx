import { Calendar } from "lucide-react";
import { formatDate } from "utils/formatDate";

const PromotionBanner = ({
    title,
    description,
    discountPercent,
    startDate,
    endDate,
}) => {
    const discountText = discountPercent
        ? `Giảm tới ${Number(discountPercent)}%`
        : "Ưu đãi đặc biệt";

    return (
        <div>
            <h1>{title}</h1>
            <div dangerouslySetInnerHTML={{ __html: description }}></div>
            <div>
                <Calendar className="h-5 w-5" />
                <span>
                    {formatDate(startDate)} - {formatDate(endDate)}
                </span>
            </div>
            <span>{discountText}</span>
        </div>
    );
};

export default PromotionBanner;
