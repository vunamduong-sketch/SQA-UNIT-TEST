import React, { useState } from "react";
import { Input, Select, Button, Card, Checkbox, Divider } from "antd";
import {
    EditOutlined,
    UserOutlined,
    CarOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    ShieldCheckOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import visaImg from "../../images/booking-vehicles/payment/visa.png";
import paypalImg from "../../images/booking-vehicles/payment/paypal.png";
import masterCardImg from "../../images/booking-vehicles/payment/mastercard.png";
import maestroImg from "../../images/booking-vehicles/payment/maestro.png";
import applePayImg from "../../images/booking-vehicles/payment/apple-pay.png";
import googlePayImg from "../../images/booking-vehicles/payment/google-pay.png";
import alipayImg from "../../images/booking-vehicles/payment/alipay.png";
import idealImg from "../../images/booking-vehicles/payment/ideal.png";
import discovercardImg from "../../images/booking-vehicles/payment/discovercard.png";
import dinersclubImg from "../../images/booking-vehicles/payment/dinersclub.png";
import amexImg from "../../images/booking-vehicles/payment/amex.png";
import madaImg from "../../images/booking-vehicles/payment/mada.png";
import markerImg from "../../images/booking-vehicles/google-map/marker.webp";
import viImg from "../../images/header/vi.svg";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Icon } from "leaflet";
import { MdOutlineFreeCancellation } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { formatCurrency } from "utils/formatCurrency";
import { useAppSelector } from "redux/hooks";

const { Option } = Select;
export default function BookingConfirmation() {
    const mockState = {
        option: "from-airport", // hoặc "from-location"
        formFromAirportIn: {
            airportIn: { name: "Noi Bai (HAN)", lat: 21.2189, lng: 105.8048 },
            locationTo: { name: "My Dinh", lat: 21.0285, lng: 105.7835 },
            timeStart: "2025-10-06 10:00",
            capacity: 2,
        },
        formFromLocationIn: {
            locationIn: {
                name: "Hanoi Old Quarter",
                lat: 21.0285,
                lng: 105.8542,
            },
            airportTo: { name: "Noi Bai (HAN)", lat: 21.2189, lng: 105.8048 },
            timeStart: "2025-10-06 10:00",
            capacity: 2,
        },
        car: {
            name: "Economy Sedan",
            description: "4 chỗ - thoải mái cho chuyến đi ngắn",
            image: "uploads/cars/economy.jpg", // hoặc đường dẫn hợp lệ
            avg_speed: 40, // km/h
            luggage: 2,
            price_per_km: 5000,
            capacity: 4,
        },
    };
    const { state } = useLocation();
    const { option, formFromAirportIn, formFromLocationIn, car } =
        state || mockState;
    const user = useAppSelector((state) => state.account.user);

    const [contactInfo, setContactInfo] = useState({
        firstName: user?.first_name || "",
        lastName: user?.last_name || "",
        email: user?.email || "",
        phone: user?.phone_number || "",
    });

    const [flightInfo, setFlightInfo] = useState({
        flightNumber: "",
        destination: "Hanoi (HAN)",
    });

    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const lat1 =
        option === "from-airport"
            ? formFromAirportIn.airportIn.lat
            : formFromLocationIn.locationIn.lat; // Tọa độ của Noi Bai Airport (Hà Nội)
    const long1 =
        option === "from-airport"
            ? formFromAirportIn.airportIn.lng
            : formFromLocationIn.locationIn.lng;

    const lat2 =
        option === "from-airport"
            ? formFromAirportIn.locationTo.lat
            : formFromLocationIn.airportTo.lat; // Tọa độ của Mỹ Đình
    const long2 =
        option === "from-airport"
            ? formFromAirportIn.locationTo.lng
            : formFromLocationIn.airportTo.lng;

    // Tính toán trung tâm của hai địa điểm
    const center = [(lat1 + lat2) / 2, (long1 + long2) / 2];

    // Tính khoảng cách giữa hai địa điểm (sử dụng công thức Haversine)
    const toRad = (deg) => deg * (Math.PI / 180);
    const haversine = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // bán kính trái đất (km)
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // khoảng cách tính bằng km
    };

    // Tính khoảng cách giữa hai địa điểm
    const distance = haversine(lat1, long1, lat2, long2);

    // Quyết định mức zoom dựa trên khoảng cách
    let zoomLevel;
    if (distance < 100) {
        zoomLevel = 10; // Gần nhau
    } else if (distance < 500) {
        zoomLevel = 8; // Khoảng cách vừa
    } else if (distance < 1500) {
        zoomLevel = 5; // Xa nhau, zoom thấp
    } else {
        zoomLevel = 3; // Cách xa nhau nhiều, zoom thấp
    }

    const paymentMethods = [
        {
            img: visaImg,
            name: "Visa",
        },
        {
            img: paypalImg,
            name: "Paypal",
        },
        {
            img: masterCardImg,
            name: "Master Card",
        },
        {
            img: maestroImg,
            name: "Maestro",
        },
        {
            img: applePayImg,
            name: "Apple Pay",
        },
        {
            img: googlePayImg,
            name: "Google Pay",
        },
        {
            img: alipayImg,
            name: "Alipay",
        },
        {
            img: idealImg,
            name: "Ideal",
        },
        {
            img: discovercardImg,
            name: "Discover Card",
        },
        {
            img: dinersclubImg,
            name: "Dinersclub",
        },
        {
            img: amexImg,
            name: "Amex",
        },
        {
            img: madaImg,
            name: "Mada",
        },
    ];

    const handleContactChange = (field, value) => {
        setContactInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFlightChange = (field, value) => {
        setFlightInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Map */}
                        <Card className="mb-4">
                            <MapContainer
                                center={center}
                                zoom={zoomLevel}
                                className="w-full h-[300px]"
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <MarkerClusterGroup chunkedLoading>
                                    <Marker
                                        position={[lat1, long1]}
                                        icon={
                                            new Icon({
                                                iconUrl: markerImg,
                                                iconSize: [38, 38],
                                            })
                                        }
                                        title="Noi Bai International Airport (HAN)"
                                    >
                                        <Popup>
                                            Noi Bai International Airport (HAN)
                                        </Popup>
                                    </Marker>
                                    <Marker
                                        position={[lat2, long2]}
                                        icon={
                                            new Icon({
                                                iconUrl: markerImg,
                                                iconSize: [38, 38],
                                            })
                                        }
                                        title="BT Homestay 120 Phu My - My Dinh"
                                    >
                                        <Popup>
                                            BT Homestay 120 Phu My - My Dinh
                                        </Popup>
                                    </Marker>
                                </MarkerClusterGroup>
                            </MapContainer>
                        </Card>

                        {/* Trip Details */}
                        <Card className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">
                                    Chuyến đi của bạn
                                </h3>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    className="text-blue-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="font-medium">
                                        {option === "from-airport"
                                            ? formFromAirportIn.airportIn.name
                                            : formFromLocationIn.locationIn
                                                  .name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {option === "from-airport"
                                            ? formFromAirportIn.timeStart
                                            : formFromLocationIn.timeStart}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Khoảng cách: {distance.toFixed(2)} km
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Thời gian đi lấy: 3 phút
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Thời gian ước lượng:{" "}
                                        {(distance / car.avg_speed).toFixed(1)}{" "}
                                        giờ
                                    </div>
                                </div>

                                <div className="text-sm">
                                    {option === "from-airport"
                                        ? formFromAirportIn.locationTo.name
                                        : formFromLocationIn.airportTo.name}
                                </div>

                                <Divider className="my-2" />

                                <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center space-x-1">
                                        <UserOutlined />
                                        <span>
                                            {option === "from-airport"
                                                ? formFromAirportIn.capacity
                                                : formFromLocationIn.capacity}{" "}
                                            Hành khách
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <CarOutlined />
                                        <span>Tối đa {car.luggage} vali</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                                    <img
                                        src={`${process.env.REACT_APP_BE_URL}${car.image}`}
                                        alt="Economy sedan"
                                        width={60}
                                        height={40}
                                        className="object-contain"
                                    />
                                    <div>
                                        <div className="font-medium text-sm">
                                            {car.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {car.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Extras */}
                        <Card className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">Extras</h3>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    className="text-blue-500"
                                />
                            </div>
                            <div className="text-sm">Chào đón và đưa đón</div>
                        </Card>

                        {/* Price Breakdown */}
                        <Card>
                            <h3 className="font-semibold mb-3">
                                Thông kê chi phí
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Giá chuyến đi cơ bản</span>
                                    <span>
                                        {formatCurrency(
                                            Math.round(
                                                car.price_per_km *
                                                    distance *
                                                    car.capacity
                                            )
                                        )}{" "}
                                        ₫
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Chào đón và đưa đón</span>
                                    <span className="text-green-600">
                                        Miễn phí
                                    </span>
                                </div>
                                <Divider className="my-2" />
                                <div className="flex justify-between font-semibold">
                                    <span>TỔNG GIÁ TIỀN</span>
                                    <span>
                                        {formatCurrency(
                                            Math.round(
                                                car.price_per_km *
                                                    distance *
                                                    car.capacity
                                            )
                                        )}{" "}
                                        ₫
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    All taxes included
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Contact Information */}
                        <Card className="mb-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Thông tin liên lạc
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Tên
                                    </label>
                                    <Input
                                        placeholder="Nhập tên"
                                        value={contactInfo.firstName}
                                        onChange={(e) =>
                                            handleContactChange(
                                                "firstName",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Họ
                                    </label>
                                    <Input
                                        placeholder="Nhập họ"
                                        value={contactInfo.lastName}
                                        onChange={(e) =>
                                            handleContactChange(
                                                "lastName",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Địa chỉ email
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="example@email.com"
                                        value={contactInfo.email}
                                        onChange={(e) =>
                                            handleContactChange(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Số điện thoại
                                    </label>
                                    <Input.Group compact>
                                        <Select
                                            defaultValue="+84"
                                            style={{ width: "25%" }}
                                        >
                                            <Option value="+84">
                                                <div className="flex items-center space-x-1">
                                                    <img
                                                        src={viImg}
                                                        alt="VN"
                                                        className="w-4 h-3"
                                                    />
                                                    <span>+84</span>
                                                </div>
                                            </Option>
                                        </Select>
                                        <Input
                                            style={{ width: "75%" }}
                                            placeholder="Số điện thoại"
                                            value={contactInfo.phone}
                                            onChange={(e) =>
                                                handleContactChange(
                                                    "phone",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Input.Group>
                                </div>
                            </div>
                        </Card>

                        {/* Flight Details */}
                        <Card className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">
                                Chi tiết chuyến bay
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Số hiệu chuyến bay sẽ giúp tài xế của bạn theo
                                dõi chuyến bay trong trường hợp bị trễ.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Bắt đầu tìm kiếm sân bay khởi hành
                                    </label>
                                    <Input
                                        placeholder="Where are you flying from?"
                                        prefix={<SearchOutlined />}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Điểm đến
                                    </label>
                                    <Select
                                        defaultValue="Hanoi (HAN)"
                                        className="w-full"
                                        suffixIcon={<SearchOutlined />}
                                    >
                                        <Option value="Hanoi (HAN)">
                                            Hanoi (HAN)
                                        </Option>
                                    </Select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <Checkbox
                                    checked={agreedToTerms}
                                    onChange={(e) =>
                                        setAgreedToTerms(e.target.checked)
                                    }
                                >
                                    <span className="text-sm">
                                        Xác nhận
                                        <a
                                            href="#"
                                            className="text-blue-500 mx-1"
                                        >
                                            Các điều khoản
                                        </a>
                                        <a
                                            href="#"
                                            className="text-blue-500 mx-1"
                                        >
                                            điều kiện
                                        </a>
                                        và
                                        <a
                                            href="#"
                                            className="text-blue-500 mx-1"
                                        >
                                            Chính sách bảo mật
                                        </a>
                                    </span>
                                </Checkbox>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                className="bg-purple-600 w-full md:w-auto px-8"
                                disabled={!agreedToTerms}
                            >
                                Đặt bây giờ →
                            </Button>
                        </Card>
                    </div>
                </div>

                {/* Bottom Features */}
                <div className="mt-12 grid grid-cols-1 gap-8">
                    {/* Free Cancellation */}
                    <Card>
                        <div className="flex items-start space-x-3">
                            <div className="w-[50px] h-[50px] bg-green-100 rounded-[50%] flex items-center justify-center">
                                <MdOutlineFreeCancellation className="text-green-600 text-[24px]" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">
                                    Free cancellation
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Book today, have peace of mind! You can
                                    cancel your reservation for free up to 24
                                    hours before your pickup time and get a full
                                    refund.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Easy Payment */}
                    <Card>
                        <div className="flex items-start space-x-3">
                            <div className="w-[50px] h-[50px] bg-blue-100 rounded-[50%] flex items-center justify-center">
                                <CreditCardOutlined className="text-blue-600 text-[24px]" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">
                                    Easy and reliable payment
                                </h3>
                                <div className="space-y-1 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center space-x-1">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>Confirmed immediately</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>
                                            No surprise costs - all fees and
                                            taxes included
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>
                                            Secure payment by credit card, Apple
                                            Pay, Google Pay, PayPal and more
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {paymentMethods.map((item, index) => (
                                        <img
                                            key={index}
                                            className="h-5"
                                            src={item.img}
                                            alt={item.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
