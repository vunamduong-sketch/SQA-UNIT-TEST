"use client";

import React, { useEffect, useState } from "react";
import {
    DatePicker,
    Button,
    Card,
    Rate,
    Tag,
    Input,
    Divider,
    Badge,
    InputNumber,
    Checkbox,
    Radio,
    Popover,
    Spin,
    Empty,
} from "antd";
import {
    UserOutlined,
    CalendarOutlined,
    CarOutlined,
    CheckCircleOutlined,
    CreditCardOutlined,
    MinusOutlined,
    PlusOutlined,
    HeartOutlined,
    CarryOutOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import { MdOutlineFreeCancellation } from "react-icons/md";
import { BsFillLightningChargeFill } from "react-icons/bs";
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

import { Icon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { IoAirplaneOutline, IoLocationOutline } from "react-icons/io5";
import { HiOutlineUsers } from "react-icons/hi2";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { callFetchCar } from "config/api";
import { formatCurrency, getPriceAfterDiscount } from "utils/formatCurrency";
import { useAppSelector } from "redux/hooks";
import { SERVICE_TYPE } from "constants/booking";
import { callBook } from "config/api";
import { callFetchDetailUserCarInteractionByCarId } from "config/api";
import { callUpsertUserCarInteraction } from "config/api";
import { CAR_BOOKING_STATUS } from "constants/booking";
import { DRIVER_STATUS } from "constants/drive";
import Groq from "groq-sdk";
import { callFetchAirport } from "config/api";
import { toast } from "react-toastify";
import { callFetchLocationMapInAllWorld } from "config/api";
import { callFetchHotelQuery } from "config/api";

export default function BookingVehicles() {
    const navigate = useNavigate();
    const { state, search } = useLocation();
    const dataObj = state;
    const params = new URLSearchParams(search);
    const rawData = params.get("data");
    const data = rawData ? JSON.parse(decodeURIComponent(rawData)) : null;

    const option = data?.option || dataObj?.option;
    const formFromAirportIn =
        data?.formFromAirportIn || dataObj?.formFromAirportIn;
    const formFromLocationIn =
        data?.formFromLocationIn || dataObj?.formFromLocationIn;

    const groq = new Groq({
        apiKey: process.env.REACT_APP_GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
    });
    const user = useAppSelector((state) => state.account.user);
    const [vehicleData, setVehicleData] = useState([]);
    const [isLoadingCars, setIsLoadingCars] = useState(false);
    const [selectedItem, setSelectedItem] = useState(vehicleData[0]);
    const [openExtra, setOpenExtra] = useState(false);
    const [extras, setExtras] = useState({
        childSeat: 0,
        boosterSeat: 0,
        additionalStop: false,
        pets: false,
        specialLuggage: false,
    });

    const [optionBooking, setOptionBooking] = useState(option);
    const [popoverFromAirportInBooking, setPopoverFromAirportInBooking] =
        useState({
            airportIn: false,
            locationTo: false,
        });
    const [popoverFromLocationInBooking, setPopoverFromLocationInBooking] =
        useState({
            locationIn: false,
            airportTo: false,
        });
    const [loadingFromAirportInBooking, setLoadingFromAirportInBooking] =
        useState({
            airportIn: false,
            locationTo: false,
        });
    const [loadingFromLocationInBooking, setLoadingFromLocationInBooking] =
        useState({
            locationIn: false,
            airportTo: false,
        });

    const [formFromAirportInBooking, setFormFromAirportInBooking] = useState(
        formFromAirportIn
            ? {
                  ...formFromAirportIn,
                  timeStart: dayjs(new Date(formFromAirportIn.timeStart)),
              }
            : {
                  airportIn: {
                      lat: null,
                      lng: null,
                      name: "",
                  },
                  locationTo: {
                      lat: null,
                      lng: null,
                      name: "",
                  },
                  timeStart: null,
                  capacity: null,
              }
    );
    const [formFromLocationInBooking, setFormFromLocationInBooking] = useState(
        formFromLocationIn
            ? {
                  ...formFromLocationIn,
                  timeStart: dayjs(new Date(formFromLocationIn.timeStart)),
              }
            : {
                  locationIn: {
                      lat: null,
                      lng: null,
                      name: "",
                  },
                  airportTo: {
                      lat: null,
                      lng: null,
                      name: "",
                  },
                  timeStart: null,
                  capacity: null,
              }
    );

    const [resultFromAirportInBooking, setResultFromAirportInBooking] =
        useState({
            resultsAirportIn: [],
            resultsLocationTo: [],
        });
    const [resultFromLocationInBooking, setResultFromLocationInBooking] =
        useState({
            resultsLocationIn: [],
            resultsAirportTo: [],
        });

    const handleGetCars = async (query) => {
        const res = await callFetchCar(query);
        if (res.isSuccess) {
            setVehicleData(res.data);
        }
    };

    async function getGroqChatCompletion(prompt) {
        try {
            return groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: "openai/gpt-oss-20b",
            });
        } catch (e) {
            console.log("error", e);
            return null;
        }
    }

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

    const handleGetCityByAI = async () => {
        setIsLoadingCars(true);
        const chatCompletion = await getGroqChatCompletion(
            `Chào bạn, Mình có địa điểm có kinh độ ${long1} và vĩ độ ${lat1}, mình muốn biết địa điểm này gần nhất với thành phố nào ở Việt Nam. Bạn trả lời ngắn gọn thôi, có dấu có cách, không cần thêm tiền tố với hậu tố đằng sau đâu, và cả các ký tự đặc biệt nữa (Ví dụ: Huế, Hồ Chí Minh, Hà Nội, Phú Quốc, Hạ Long, Hội An...)`
        );
        const cityName = chatCompletion?.choices?.[0]?.message?.content || "";
        if (cityName) {
            await handleGetCars(
                `current=1&pageSize=20&driver_status=${DRIVER_STATUS.IDLE}&driver_area_name=${cityName}&recommended=true`
            );
        }
        setIsLoadingCars(false);
    };

    useEffect(() => {
        if (lat1 && long1) {
            handleGetCityByAI();
        }
    }, [lat1, long1]);

    const handleGetAirport = async (type) => {
        try {
            if (type === "location-in") {
                setLoadingFromLocationInBooking({
                    ...loadingFromLocationInBooking,
                    airportTo: true,
                });
                const res = await callFetchAirport(
                    `current=1&pageSize=10&name=${formFromLocationInBooking.airportTo.name}`
                );
                if (res.isSuccess) {
                    setResultFromLocationInBooking({
                        ...resultFromLocationInBooking,
                        resultsAirportTo: res.data,
                    });
                }
                setLoadingFromLocationInBooking({
                    ...loadingFromLocationInBooking,
                    airportTo: false,
                });
            } else {
                setLoadingFromAirportInBooking({
                    ...loadingFromAirportInBooking,
                    airportIn: true,
                });
                const res = await callFetchAirport(
                    `current=1&pageSize=10&name=${formFromAirportInBooking.airportIn.name}`
                );
                if (res.isSuccess) {
                    setResultFromAirportInBooking({
                        ...resultFromAirportInBooking,
                        resultsAirportIn: res.data,
                    });
                }
                setLoadingFromAirportInBooking({
                    ...loadingFromAirportInBooking,
                    airportIn: false,
                });
            }
        } catch (e) {
            toast.error(e.message, {
                position: "bottom-right",
            });
        }
    };

    const handleGetLocation = async (type) => {
        try {
            if (type === "location-in") {
                setLoadingFromLocationInBooking({
                    ...loadingFromLocationInBooking,
                    locationIn: true,
                });
                const res = await callFetchLocationMapInAllWorld(
                    encodeURIComponent(
                        formFromLocationInBooking.locationIn.name
                    )
                );
                if (res?.data?.features && res?.data?.features?.length > 0) {
                    setResultFromLocationInBooking({
                        ...resultFromLocationInBooking,
                        resultsLocationIn: res.data.features,
                    });
                }
                setLoadingFromLocationInBooking({
                    ...loadingFromLocationInBooking,
                    locationIn: false,
                });
            } else {
                setLoadingFromAirportInBooking({
                    ...loadingFromAirportInBooking,
                    locationTo: true,
                });
                const res = await callFetchHotelQuery(
                    `current=1&pageSize=10&name=${formFromAirportInBooking.locationTo.name}`
                );
                if (res.isSuccess) {
                    setResultFromAirportInBooking({
                        ...resultFromAirportInBooking,
                        resultsLocationTo: res.data,
                    });
                }
                setLoadingFromAirportInBooking({
                    ...loadingFromAirportInBooking,
                    locationTo: false,
                });
            }
        } catch (e) {
            toast.error(e.message, {
                position: "bottom-right",
            });
        }
    };

    useEffect(() => {
        if (!popoverFromAirportInBooking.airportIn) return;
        if (!formFromAirportInBooking.airportIn.name) {
            setResultFromAirportInBooking({
                ...resultFromAirportInBooking,
                resultsAirportIn: [],
            });
            return;
        }

        setLoadingFromAirportInBooking({
            ...loadingFromAirportInBooking,
            airportIn: true,
        });

        const timeoutId = setTimeout(() => {
            handleGetAirport("airport-in");
        }, 500); // debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [formFromAirportInBooking.airportIn.name]);

    useEffect(() => {
        if (!popoverFromAirportInBooking.locationTo) return;
        if (!formFromAirportInBooking.locationTo.name) {
            setResultFromAirportInBooking({
                ...resultFromAirportInBooking,
                resultsAirportIn: [],
            });
            return;
        }

        setLoadingFromAirportInBooking({
            ...loadingFromAirportInBooking,
            locationTo: true,
        });

        const timeoutId = setTimeout(() => {
            handleGetLocation("airport-in");
        }, 500); // debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [formFromAirportInBooking.locationTo.name]);

    useEffect(() => {
        if (!popoverFromLocationInBooking.locationIn) return;
        if (!formFromLocationInBooking.locationIn.name) {
            setResultFromLocationInBooking({
                ...resultFromLocationInBooking,
                resultsLocationIn: [],
            });
            return;
        }

        setLoadingFromLocationInBooking({
            ...loadingFromLocationInBooking,
            locationIn: true,
        });

        const timeoutId = setTimeout(() => {
            handleGetLocation("location-in");
        }, 500); // debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [formFromLocationInBooking.locationIn.name]);

    useEffect(() => {
        if (!popoverFromLocationInBooking.airportTo) return;
        if (!formFromLocationInBooking.airportTo.name) {
            setResultFromLocationInBooking({
                ...resultFromLocationInBooking,
                resultsLocationIn: [],
            });
            return;
        }

        setLoadingFromLocationInBooking({
            ...loadingFromLocationInBooking,
            airportTo: true,
        });

        const timeoutId = setTimeout(() => {
            handleGetAirport("location-in");
        }, 500); // debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [formFromLocationInBooking.airportTo.name]);

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

    const getCategoryColor = (category) => {
        switch (category) {
            case "Superb":
                return "green";
            case "Exceptional":
                return "blue";
            default:
                return "default";
        }
    };

    const handleExtrasChange = (key, value) => {
        setExtras((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const incrementQuantity = (key) => {
        setExtras((prev) => ({
            ...prev,
            [key]: Math.max(0, prev[key] + 1),
        }));
    };

    const decrementQuantity = (key) => {
        setExtras((prev) => ({
            ...prev,
            [key]: Math.max(0, prev[key] - 1),
        }));
    };

    const handleSearchToBooking = () => {
        if (optionBooking === "from-airport") {
            if (
                !formFromAirportInBooking.airportIn.lat ||
                !formFromAirportInBooking.airportIn.lng ||
                !formFromAirportInBooking.locationTo.lat ||
                !formFromAirportInBooking.locationTo.lng
            ) {
                toast.error("Vui lòng chọn địa điểm", {
                    position: "bottom-right",
                });
                return;
            }

            if (!formFromAirportInBooking.timeStart) {
                toast.error("Vui lòng nhập thời gian khởi hành", {
                    position: "bottom-right",
                });
                return;
            }
            if (!formFromAirportInBooking.capacity) {
                toast.error("Vui lòng điền số lượng người đi", {
                    position: "bottom-right",
                });
                return;
            }

            const query = createSearchParams({
                data: encodeURIComponent(
                    JSON.stringify({
                        option: optionBooking,
                        formFromAirportIn: formFromAirportInBooking,
                    })
                ),
            }).toString();

            window.location.href = `/booking-vehicles?${query}`;
        } else {
            if (
                !formFromLocationInBooking.airportTo.lat ||
                !formFromLocationInBooking.airportTo.lng ||
                !formFromLocationInBooking.locationIn.lat ||
                !formFromLocationInBooking.locationIn.lng
            ) {
                toast.error("Vui lòng chọn địa điểm", {
                    position: "bottom-right",
                });
                return;
            }

            if (!formFromLocationInBooking.timeStart) {
                toast.error("Vui lòng nhập thời gian khởi hành", {
                    position: "bottom-right",
                });
                return;
            }
            if (!formFromLocationInBooking.capacity) {
                toast.error("Vui lòng điền số lượng người đi", {
                    position: "bottom-right",
                });
                return;
            }

            const query = createSearchParams({
                data: encodeURIComponent(
                    JSON.stringify({
                        option: optionBooking,
                        formFromLocationIn: formFromLocationInBooking,
                    })
                ),
            }).toString();

            window.location.href = `/booking-vehicles?${query}`;
        }
    };

    const handleSubmit = async () => {
        if (option === "from-airport") {
            const body = {
                user: user?.id,
                service_type: SERVICE_TYPE.CAR,
                total_price: Math.round(
                    selectedItem.price_per_km *
                        distance *
                        (formFromAirportIn?.capacity || 0)
                ),
                car_detail: {
                    car: selectedItem.id,
                    pickup_location: formFromAirportIn.airportIn.name,
                    dropoff_location: formFromAirportIn.locationTo.name,
                    lat1: lat1,
                    lng1: long1,
                    lat2: lat2,
                    lng2: long2,
                    pickup_datetime: dayjs(
                        formFromAirportIn.timeStart
                    ).toISOString(),
                    driver_required: true,
                    distance_km: distance,
                    total_time_estimate: distance / selectedItem.avg_speed,
                    passenger_quantity_booking: formFromAirportIn.capacity,
                    status: CAR_BOOKING_STATUS.STARTING,
                },
            };

            const res = await callBook(body);

            if (res.isSuccess) {
                const resFetchUserCarInteraction =
                    await callFetchDetailUserCarInteractionByCarId(
                        selectedItem.id
                    );
                if (resFetchUserCarInteraction.isSuccess) {
                    const userCarInteraction = resFetchUserCarInteraction.data;
                    await callUpsertUserCarInteraction({
                        car_id: selectedItem.id,
                        booking_count: userCarInteraction.booking_count + 1,
                    });
                } else {
                    await callUpsertUserCarInteraction({
                        car_id: selectedItem.id,
                        booking_count: 1,
                    });
                }

                navigate(
                    `/book?booking_id=${res.booking_id}&type=${body.service_type}&ref=${res.data.id}`
                );
            } else {
                toast.error(res.message, {
                    position: "bottom-right",
                });
            }
        } else {
            const body = {
                user: user?.id,
                service_type: SERVICE_TYPE.CAR,
                total_price: Math.round(
                    selectedItem.price_per_km *
                        distance *
                        (formFromLocationIn?.capacity || 0)
                ),
                car_detail: {
                    car: selectedItem.id,
                    pickup_location: formFromLocationIn.locationIn.name,
                    dropoff_location: formFromLocationIn.airportTo.name,
                    lat1: lat1,
                    lng1: long1,
                    lat2: lat2,
                    lng2: long2,
                    pickup_datetime: dayjs(
                        formFromLocationIn.timeStart
                    ).toISOString(),
                    driver_required: true,
                    distance_km: distance,
                    total_time_estimate: distance / selectedItem.avg_speed,
                    passenger_quantity_booking: formFromLocationIn.capacity,
                },
            };

            const res = await callBook(body);

            if (res.isSuccess) {
                const resFetchUserCarInteraction =
                    await callFetchDetailUserCarInteractionByCarId(
                        selectedItem.id
                    );
                if (resFetchUserCarInteraction.isSuccess) {
                    const userCarInteraction = resFetchUserCarInteraction.data;
                    await callUpsertUserCarInteraction({
                        car_id: selectedItem.id,
                        booking_count: userCarInteraction.booking_count + 1,
                    });
                } else {
                    await callUpsertUserCarInteraction({
                        car_id: selectedItem.id,
                        booking_count: 1,
                    });
                }

                navigate(
                    `/book?booking_id=${res.booking_id}&type=${body.service_type}&ref=${res.data.id}`
                );
            } else {
                toast.error(res.message, {
                    position: "bottom-right",
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Map and Trip Details */}
                    <div className="lg:col-span-1">
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
                        <Card title="Chuyến đi của bạn" className="mb-4">
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
                                    <div className="text-xs text-blue-600">
                                        Thời gian đi lấy: 3 phút
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium">
                                        {option === "from-airport"
                                            ? formFromAirportIn.locationTo.name
                                            : formFromLocationIn.airportTo.name}
                                    </div>
                                </div>
                                <Divider className="my-2" />
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                        <UserOutlined />
                                        <span>
                                            {option === "from-airport"
                                                ? formFromAirportIn.capacity
                                                : formFromLocationIn.capacity}{" "}
                                            Hành khách
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                        <CalendarOutlined />
                                        <span>
                                            {selectedItem
                                                ? (
                                                      distance /
                                                      selectedItem.avg_speed
                                                  ).toFixed(1)
                                                : 0}{" "}
                                            giờ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Search and Vehicle List */}
                    <div className="lg:col-span-2">
                        {/* Search Form */}
                        <Card className="mb-6">
                            <Radio.Group
                                className="flex gap-[8px]"
                                value={optionBooking}
                                onChange={(e) =>
                                    setOptionBooking(e.target.value)
                                }
                            >
                                <Radio.Button
                                    value="from-airport"
                                    className="first:rounded-l-[50px] first:rounded-r-[50px]"
                                >
                                    Từ sân bay
                                </Radio.Button>
                                <Radio.Button
                                    value="from-location"
                                    className="last:rounded-l-[50px] last:rounded-r-[50px] before:!hidden"
                                >
                                    Đến sân bay
                                </Radio.Button>
                            </Radio.Group>
                            <div className="mt-[12px] grid grid-cols-2 gap-[12px]">
                                {optionBooking === "from-airport" ? (
                                    <>
                                        <Popover
                                            content={
                                                <div>
                                                    {loadingFromAirportInBooking.airportIn ? (
                                                        <div className="flex justify-center items-center py-[20px]">
                                                            <Spin size="large" />
                                                        </div>
                                                    ) : resultFromAirportInBooking
                                                          .resultsAirportIn
                                                          .length === 0 ? (
                                                        <Empty
                                                            description="Chưa có thông tin"
                                                            className="bg-[#abb6cb1f] mx-0 px-[90px] py-[24px] rounded-[16px] mt-[24px] w-full"
                                                        />
                                                    ) : (
                                                        resultFromAirportInBooking.resultsAirportIn.map(
                                                            (place, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    style={{
                                                                        padding:
                                                                            "8px",
                                                                        borderBottom:
                                                                            "1px solid #eee",
                                                                        cursor: "pointer",
                                                                    }}
                                                                    onClick={() => {
                                                                        setFormFromAirportInBooking(
                                                                            {
                                                                                ...formFromAirportInBooking,
                                                                                airportIn:
                                                                                    {
                                                                                        lat: place.lat, // lat
                                                                                        lng: place.lng, // lng
                                                                                        name: place.name,
                                                                                    },
                                                                            }
                                                                        );
                                                                        setPopoverFromAirportInBooking(
                                                                            {
                                                                                ...popoverFromAirportInBooking,
                                                                                airportIn: false,
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    {place.name}
                                                                </li>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            }
                                            title="Sân bay đón khách"
                                            trigger="click"
                                            open={
                                                popoverFromAirportInBooking.airportIn
                                            }
                                            onOpenChange={(val) =>
                                                setPopoverFromAirportInBooking({
                                                    ...popoverFromAirportInBooking,
                                                    airportIn: val,
                                                })
                                            }
                                            placement="bottomLeft"
                                        >
                                            <Input
                                                placeholder="Sân bay đón khách"
                                                size="large"
                                                prefix={
                                                    <IoAirplaneOutline className="text-[22px]" />
                                                }
                                                className="mt-[12px]"
                                                value={
                                                    formFromAirportInBooking
                                                        .airportIn.name
                                                }
                                                onChange={(e) => {
                                                    setFormFromAirportInBooking(
                                                        {
                                                            ...formFromAirportInBooking,
                                                            airportIn: {
                                                                lat: null, // lat
                                                                lng: null, // lng
                                                                name: e.target
                                                                    .value,
                                                            },
                                                        }
                                                    );
                                                    setPopoverFromAirportInBooking(
                                                        {
                                                            ...popoverFromAirportInBooking,
                                                            airportIn:
                                                                !!e.target
                                                                    .value,
                                                        }
                                                    );
                                                }}
                                            />
                                        </Popover>
                                        <Popover
                                            content={
                                                <div>
                                                    {loadingFromAirportInBooking.locationTo ? (
                                                        <div className="flex justify-center items-center py-[20px]">
                                                            <Spin size="large" />
                                                        </div>
                                                    ) : resultFromAirportInBooking
                                                          .resultsLocationTo
                                                          .length === 0 ? (
                                                        <Empty
                                                            description="Chưa có thông tin"
                                                            className="bg-[#abb6cb1f] mx-0 px-[90px] py-[24px] rounded-[16px] mt-[24px] w-full"
                                                        />
                                                    ) : (
                                                        resultFromAirportInBooking.resultsLocationTo.map(
                                                            (place, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    style={{
                                                                        padding:
                                                                            "8px",
                                                                        borderBottom:
                                                                            "1px solid #eee",
                                                                        cursor: "pointer",
                                                                    }}
                                                                    onClick={() => {
                                                                        setFormFromAirportInBooking(
                                                                            {
                                                                                ...formFromAirportInBooking,
                                                                                locationTo:
                                                                                    {
                                                                                        lat: place.lat, // lat
                                                                                        lng: place.lng, // lng
                                                                                        name: place.name,
                                                                                    },
                                                                            }
                                                                        );
                                                                        setPopoverFromAirportInBooking(
                                                                            {
                                                                                ...popoverFromAirportInBooking,
                                                                                locationTo: false,
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    {place.name}
                                                                </li>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            }
                                            title="Địa điểm đến"
                                            trigger="click"
                                            open={
                                                popoverFromAirportInBooking.locationTo
                                            }
                                            onOpenChange={(val) =>
                                                setPopoverFromAirportInBooking({
                                                    ...popoverFromAirportInBooking,
                                                    locationTo: val,
                                                })
                                            }
                                            placement="bottomLeft"
                                        >
                                            <Input
                                                placeholder="Địa điểm đến"
                                                size="large"
                                                prefix={
                                                    <IoLocationOutline className="text-[22px]" />
                                                }
                                                className="mt-[12px]"
                                                value={
                                                    formFromAirportInBooking
                                                        .locationTo.name
                                                }
                                                onChange={(e) => {
                                                    setFormFromAirportInBooking(
                                                        {
                                                            ...formFromAirportInBooking,
                                                            locationTo: {
                                                                lat: null, // lat
                                                                lng: null, // lng
                                                                name: e.target
                                                                    .value,
                                                            },
                                                        }
                                                    );
                                                    setPopoverFromAirportInBooking(
                                                        {
                                                            ...popoverFromAirportInBooking,
                                                            locationTo:
                                                                !!e.target
                                                                    .value,
                                                        }
                                                    );
                                                }}
                                            />
                                        </Popover>
                                    </>
                                ) : (
                                    <>
                                        <Popover
                                            content={
                                                <div>
                                                    {loadingFromLocationInBooking.locationIn ? (
                                                        <div className="flex justify-center items-center py-[20px]">
                                                            <Spin size="large" />
                                                        </div>
                                                    ) : resultFromLocationInBooking
                                                          .resultsLocationIn
                                                          .length === 0 ? (
                                                        <Empty
                                                            description="Chưa có thông tin"
                                                            className="bg-[#abb6cb1f] mx-0 px-[90px] py-[24px] rounded-[16px] mt-[24px] w-full"
                                                        />
                                                    ) : (
                                                        resultFromLocationInBooking.resultsLocationIn.map(
                                                            (place, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    style={{
                                                                        padding:
                                                                            "8px",
                                                                        borderBottom:
                                                                            "1px solid #eee",
                                                                        cursor: "pointer",
                                                                    }}
                                                                    onClick={() => {
                                                                        setFormFromLocationInBooking(
                                                                            {
                                                                                ...formFromLocationInBooking,
                                                                                locationIn:
                                                                                    {
                                                                                        lat: place
                                                                                            .geometry
                                                                                            .coordinates[1], // lat
                                                                                        lng: place
                                                                                            .geometry
                                                                                            .coordinates[0], // lng
                                                                                        name:
                                                                                            place
                                                                                                .properties
                                                                                                .name ||
                                                                                            place
                                                                                                .properties
                                                                                                .city ||
                                                                                            "Unknown",
                                                                                    },
                                                                            }
                                                                        );
                                                                        setPopoverFromLocationInBooking(
                                                                            {
                                                                                ...popoverFromLocationInBooking,
                                                                                locationIn: false,
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    {place
                                                                        .properties
                                                                        .name ||
                                                                        place
                                                                            .properties
                                                                            .city ||
                                                                        "Unknown"}
                                                                    ,{" "}
                                                                    {
                                                                        place
                                                                            .properties
                                                                            .country
                                                                    }
                                                                </li>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            }
                                            title="Địa điểm đón khách"
                                            trigger="click"
                                            open={
                                                popoverFromLocationInBooking.locationIn
                                            }
                                            onOpenChange={(val) =>
                                                setPopoverFromLocationInBooking(
                                                    {
                                                        ...popoverFromLocationInBooking,
                                                        locationIn: val,
                                                    }
                                                )
                                            }
                                            placement="bottomLeft"
                                        >
                                            <Input
                                                placeholder="Địa điểm đón khách"
                                                size="large"
                                                prefix={
                                                    <IoLocationOutline className="text-[22px]" />
                                                }
                                                className="mt-[12px]"
                                                value={
                                                    formFromLocationInBooking
                                                        .locationIn.name
                                                }
                                                onChange={(e) => {
                                                    setFormFromLocationInBooking(
                                                        {
                                                            ...formFromLocationInBooking,
                                                            locationIn: {
                                                                lat: null, // lat
                                                                lng: null, // lng
                                                                name: e.target
                                                                    .value,
                                                            },
                                                        }
                                                    );
                                                    setPopoverFromLocationInBooking(
                                                        {
                                                            ...popoverFromLocationInBooking,
                                                            locationIn:
                                                                !!e.target
                                                                    .value,
                                                        }
                                                    );
                                                }}
                                            />
                                        </Popover>
                                        <Popover
                                            content={
                                                <div>
                                                    {loadingFromLocationInBooking.airportTo ? (
                                                        <div className="flex justify-center items-center py-[20px]">
                                                            <Spin size="large" />
                                                        </div>
                                                    ) : resultFromLocationInBooking
                                                          .resultsAirportTo
                                                          .length === 0 ? (
                                                        <Empty
                                                            description="Chưa có thông tin"
                                                            className="bg-[#abb6cb1f] mx-0 px-[90px] py-[24px] rounded-[16px] mt-[24px] w-full"
                                                        />
                                                    ) : (
                                                        resultFromLocationInBooking.resultsAirportTo.map(
                                                            (place, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    style={{
                                                                        padding:
                                                                            "8px",
                                                                        borderBottom:
                                                                            "1px solid #eee",
                                                                        cursor: "pointer",
                                                                    }}
                                                                    onClick={() => {
                                                                        setFormFromLocationInBooking(
                                                                            {
                                                                                ...formFromLocationInBooking,
                                                                                airportTo:
                                                                                    {
                                                                                        lat: place.lat, // lat
                                                                                        lng: place.lng, // lng
                                                                                        name: place.name,
                                                                                    },
                                                                            }
                                                                        );
                                                                        setPopoverFromLocationInBooking(
                                                                            {
                                                                                ...popoverFromLocationInBooking,
                                                                                airportTo: false,
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    {place.name}
                                                                </li>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            }
                                            title="Sân bay đến"
                                            trigger="click"
                                            open={
                                                popoverFromLocationInBooking.airportTo
                                            }
                                            onOpenChange={(val) =>
                                                setPopoverFromLocationInBooking(
                                                    {
                                                        ...popoverFromLocationInBooking,
                                                        airportTo: val,
                                                    }
                                                )
                                            }
                                            placement="bottomLeft"
                                        >
                                            <Input
                                                placeholder="Sân bay đến"
                                                size="large"
                                                prefix={
                                                    <IoAirplaneOutline className="text-[22px]" />
                                                }
                                                className="mt-[12px]"
                                                value={
                                                    formFromLocationInBooking
                                                        .airportTo.name
                                                }
                                                onChange={(e) => {
                                                    setFormFromLocationInBooking(
                                                        {
                                                            ...formFromLocationInBooking,
                                                            airportTo: {
                                                                lat: null, // lat
                                                                lng: null, // lng
                                                                name: e.target
                                                                    .value,
                                                            },
                                                        }
                                                    );
                                                    setPopoverFromLocationInBooking(
                                                        {
                                                            ...popoverFromLocationInBooking,
                                                            airportTo:
                                                                !!e.target
                                                                    .value,
                                                        }
                                                    );
                                                }}
                                            />
                                        </Popover>
                                    </>
                                )}
                            </div>
                            <div className="mt-[12px] grid grid-cols-3 gap-[12px]">
                                {optionBooking === "from-airport" ? (
                                    <>
                                        <DatePicker
                                            showTime
                                            onChange={(value, dateString) => {
                                                console.log(
                                                    "Selected Time: ",
                                                    value
                                                );
                                                console.log(
                                                    "Formatted Selected Time: ",
                                                    dateString
                                                );
                                                setFormFromAirportInBooking({
                                                    ...formFromAirportInBooking,
                                                    timeStart: value,
                                                });
                                            }}
                                            value={
                                                formFromAirportInBooking.timeStart
                                            }
                                            onOk={(val) => {
                                                console.log(val);
                                            }}
                                            placeholder="Chọn thời gian"
                                        />
                                        <InputNumber
                                            addonBefore={<span>Người lớn</span>}
                                            prefix={
                                                <HiOutlineUsers className="text-[22px]" />
                                            }
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                            }}
                                            value={
                                                formFromAirportInBooking.capacity
                                            }
                                            onChange={(val) =>
                                                setFormFromAirportInBooking({
                                                    ...formFromAirportInBooking,
                                                    capacity: val,
                                                })
                                            }
                                        />
                                    </>
                                ) : (
                                    <>
                                        <DatePicker
                                            showTime
                                            onChange={(value, dateString) => {
                                                console.log(
                                                    "Selected Time: ",
                                                    value
                                                );
                                                console.log(
                                                    "Formatted Selected Time: ",
                                                    dateString
                                                );
                                                setFormFromLocationInBooking({
                                                    ...formFromLocationInBooking,
                                                    timeStart: value,
                                                });
                                            }}
                                            value={
                                                formFromLocationInBooking.timeStart
                                            }
                                            onOk={(val) => {
                                                console.log(val);
                                            }}
                                            placeholder="Chọn thời gian"
                                        />
                                        <InputNumber
                                            addonBefore={<span>Người lớn</span>}
                                            prefix={
                                                <HiOutlineUsers className="text-[22px]" />
                                            }
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                            }}
                                            value={
                                                formFromLocationInBooking.capacity
                                            }
                                            onChange={(val) =>
                                                setFormFromLocationInBooking({
                                                    ...formFromLocationInBooking,
                                                    capacity: val,
                                                })
                                            }
                                        />
                                    </>
                                )}

                                <div
                                    onClick={handleSearchToBooking}
                                    className="text-center text-white bg-[#5392f9] text-[20px] rounded-[8px] cursor-pointer"
                                >
                                    Tìm
                                </div>
                            </div>
                        </Card>

                        {/* Vehicle Selection Header */}
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold mb-2">
                                Chọn loại xe mong muốn
                            </h2>
                            <div className="flex space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span>Hủy chuyến miễn phí</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span>Cập nhật chuyến bay</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                    <span>Hỗ trợ khách hàng 24/7</span>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle List */}
                        {isLoadingCars ? (
                            <div className="flex items-center justify-center py-[80px]">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {vehicleData.length === 0 ? (
                                    <Empty
                                        description="Chưa có xe taxi"
                                        className="bg-[#abb6cb1f] mx-0 py-[24px] rounded-[16px] mt-[24px]"
                                    />
                                ) : (
                                    vehicleData.map((vehicle) => (
                                        <Card
                                            key={vehicle.id}
                                            onClick={() =>
                                                setSelectedItem(vehicle)
                                            }
                                            className={`hover:shadow-md transition-shadow cursor-pointer ${
                                                selectedItem?.id === vehicle.id
                                                    ? "border-blue-500 border-2"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-24 h-16 relative">
                                                        <img
                                                            src={`${process.env.REACT_APP_BE_URL}${vehicle.image}`}
                                                            alt={vehicle.name}
                                                            fill
                                                            className="object-cover w-full"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h3 className="font-medium text-lg">
                                                                {vehicle.name}
                                                            </h3>
                                                            {vehicle.highlighted && (
                                                                <Badge
                                                                    count="Được đề xuất"
                                                                    className="bg-blue-500"
                                                                />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {
                                                                vehicle.description
                                                            }
                                                        </p>
                                                        <div className="flex items-center space-x-4 text-sm">
                                                            <Tag
                                                                color={getCategoryColor(
                                                                    vehicle.category
                                                                )}
                                                            >
                                                                {
                                                                    vehicle.category
                                                                }
                                                            </Tag>
                                                            <div className="flex items-center space-x-1">
                                                                <Rate
                                                                    disabled
                                                                    defaultValue={
                                                                        vehicle.avg_star
                                                                    }
                                                                    size="small"
                                                                />
                                                                <span>
                                                                    {
                                                                        vehicle.avg_star
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="flex items-center space-x-1">
                                                                    <UserOutlined />
                                                                    <span>
                                                                        Tối đa{" "}
                                                                        {
                                                                            vehicle.capacity
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <CarOutlined />
                                                                    <span>
                                                                        Tối đa{" "}
                                                                        {
                                                                            vehicle.luggage
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            <div className="flex items-center space-x-1 text-sm text-green-600">
                                                                <CheckCircleOutlined />
                                                                <span>
                                                                    Ăn phụ thu
                                                                    miễn phí
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1 text-sm text-green-600">
                                                                <CheckCircleOutlined />
                                                                <span>
                                                                    Đã bao gồm
                                                                    Gặp gỡ &
                                                                    Chào hỏi
                                                                    miễn phí
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {vehicle?.promotion
                                                        ?.discount_percent >
                                                        0 && (
                                                        <p className="text-sm text-gray-500 line-through">
                                                            {formatCurrency(
                                                                Math.round(
                                                                    vehicle.price_per_km *
                                                                        distance *
                                                                        (formFromAirportIn?.capacity ||
                                                                            formFromLocationIn?.capacity ||
                                                                            0)
                                                                )
                                                            )}{" "}
                                                            ₫
                                                        </p>
                                                    )}
                                                    <p className="text-2xl font-bold w-max">
                                                        {formatCurrency(
                                                            Math.round(
                                                                getPriceAfterDiscount(
                                                                    vehicle.price_per_km *
                                                                        distance *
                                                                        (formFromAirportIn?.capacity ||
                                                                            formFromLocationIn?.capacity ||
                                                                            0),
                                                                    vehicle
                                                                        ?.promotion
                                                                        ?.discount_amount,
                                                                    vehicle
                                                                        ?.promotion
                                                                        ?.discount_percent
                                                                )
                                                            )
                                                        )}{" "}
                                                        ₫
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Extra Services */}
                        <Card className="mt-6">
                            {openExtra ? (
                                <div className="space-y-4">
                                    {/* Welcome and Pickup - Free */}
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                <TeamOutlined className="text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    Chào đón và đưa đón
                                                </div>
                                                <div className="text-sm text-green-600">
                                                    Bao gồm miễn phí
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                                            <CheckCircleOutlined className="text-white text-sm" />
                                        </div>
                                    </div>

                                    {/* Child Seat */}
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                <UserOutlined className="text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    Chỗ ngồi cho trẻ em
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    293.477 ₫
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                size="small"
                                                disabled={
                                                    extras.childSeat === 0
                                                }
                                                onClick={() =>
                                                    decrementQuantity(
                                                        "childSeat"
                                                    )
                                                }
                                                className="w-8 h-8 flex items-center justify-center"
                                            >
                                                <MinusOutlined />
                                            </Button>
                                            <div className="w-12 h-8 border rounded flex items-center justify-center bg-white">
                                                {extras.childSeat}
                                            </div>
                                            <Button
                                                size="small"
                                                onClick={() =>
                                                    incrementQuantity(
                                                        "childSeat"
                                                    )
                                                }
                                                className="w-8 h-8 flex items-center justify-center"
                                            >
                                                <PlusOutlined />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Booster Seat */}
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                <CarOutlined className="text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    Ghế nâng
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    293.477 ₫
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                size="small"
                                                disabled={
                                                    extras.boosterSeat === 0
                                                }
                                                onClick={() =>
                                                    decrementQuantity(
                                                        "boosterSeat"
                                                    )
                                                }
                                                className="w-8 h-8 flex items-center justify-center"
                                            >
                                                <MinusOutlined />
                                            </Button>
                                            <div className="w-12 h-8 border rounded flex items-center justify-center bg-white">
                                                {extras.boosterSeat}
                                            </div>
                                            <Button
                                                size="small"
                                                onClick={() =>
                                                    incrementQuantity(
                                                        "boosterSeat"
                                                    )
                                                }
                                                className="w-8 h-8 flex items-center justify-center"
                                            >
                                                <PlusOutlined />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Additional Stop */}
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                <PlusOutlined className="text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    Điểm dừng thêm
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    146.739 ₫
                                                </div>
                                            </div>
                                        </div>
                                        <Checkbox
                                            checked={extras.additionalStop}
                                            onChange={(e) =>
                                                handleExtrasChange(
                                                    "additionalStop",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Pets */}
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                <HeartOutlined className="text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    Vật nuôi
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    146.739 ₫
                                                </div>
                                            </div>
                                        </div>
                                        <Checkbox
                                            checked={extras.pets}
                                            onChange={(e) =>
                                                handleExtrasChange(
                                                    "pets",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Special Luggage */}
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                <CarryOutOutlined className="text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    Hành lý đặc biệt
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    146.739 ₫
                                                </div>
                                            </div>
                                        </div>
                                        <Checkbox
                                            checked={extras.specialLuggage}
                                            onChange={(e) =>
                                                handleExtrasChange(
                                                    "specialLuggage",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between rounded-[8px] p-[16px] bg-[#e6f4f8]">
                                    <div className="flex items-center gap-[4px]">
                                        <BsFillLightningChargeFill className="text-[#0083A8] text-[20px]" />
                                        Bạn có cần thêm ghế trẻ em hay hành lý
                                        đặc biệt không? Chúng tôi sẽ đáp ứng!
                                    </div>
                                    <Button
                                        type="link"
                                        className="px-0"
                                        onClick={() => setOpenExtra(true)}
                                    >
                                        <span className="text-[#0083a8]">
                                            Add extras
                                        </span>
                                    </Button>
                                </div>
                            )}
                        </Card>

                        {/* Continue Button */}
                        <div className="mt-6 text-right">
                            <div onClick={handleSubmit}>
                                <Button
                                    type="primary"
                                    size="large"
                                    className="bg-purple-600 px-8"
                                >
                                    Tiếp tục →
                                </Button>
                            </div>
                        </div>
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
