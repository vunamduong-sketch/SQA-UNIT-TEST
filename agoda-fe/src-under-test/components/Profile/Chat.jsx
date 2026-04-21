import React, { useEffect, useState } from "react";
import ChatRoom from "./ChatRoom";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { v4 as uuidv4 } from "uuid";
import { callGetOrCreateConversation, callFetchUser } from "config/api";
import { IoChatboxEllipses } from "react-icons/io5";
import { getOtherUser } from "utils/conversation";
import _ from "lodash";
import { ROLE } from "constants/role";
import { Select } from "antd";
import { getUserAvatar } from "utils/imageUrl";
import { useSocket } from "contexts/SocketProvider";
import Skeleton from "react-loading-skeleton";
import ChatConversation from "./ChatConversation";

function Chat() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.account.user);
    const [selectedOtherUser, setSelectedOtherUser] = useState({});
    const {
        conversations,
        setConversations,
        selectedConversation,
        setSelectedConversation,
        loadingConversations,
    } = useSocket();
    const [users, setUsers] = useState([]);

    const handleGetUsers = async (query) => {
        const res = await callFetchUser(query);
        if (res.isSuccess) {
            setUsers(res.data);
        }
    };

    useEffect(() => {
        handleGetUsers(`current=1&pageSize=1000&role=${ROLE.CUSTOMER}`);
    }, [dispatch]);

    const handleOpenChat = async (conv) => {
        try {
            const clientConvId = uuidv4();

            const res = await callGetOrCreateConversation({
                user_id: getOtherUser(conv, user).id,
                conversation_id: clientConvId,
            });

            if (res?.isSuccess) {
                const foundConv = conversations.find(
                    (item) => item.id === res?.data?.id
                );
                setSelectedConversation(foundConv);
                setSelectedOtherUser(getOtherUser(foundConv, user));
            } else {
                console.error("Failed get/create conversation", res.data);
            }
        } catch (err) {
            console.error("Error getting/creating conversation", err);
        }
    };

    const handleSelectUser = async (val) => {
        try {
            const res = await callGetOrCreateConversation({
                user_id: val,
            });
            if (res?.isSuccess) {
                let conv = conversations.find(
                    (item) => item.id === res?.data?.id
                );
                if (!conv) {
                    conv = {
                        ...res.data,
                        latest_message: null,
                        unseen_count: 0,
                        seen: true,
                    };
                    setConversations((prev) => [
                        {
                            ...conv,
                        },
                        ...prev,
                    ]);
                }

                setSelectedConversation(conv);
                setSelectedOtherUser(getOtherUser(conv, user));
            } else {
                console.error("Failed get/create conversation", res.data);
            }
        } catch (e) {
            console.error("Error getting/creating conversation", e);
        }
    };

    return (
        <div>
            {user.id > 0 && (
                <>
                    {user.role !== ROLE.CUSTOMER && (
                        <Select
                            placeholder="Select a person"
                            className="w-[300px] h-[60px]"
                            options={users.map((item) => {
                                return {
                                    label: (
                                        <div className="flex items-center gap-[10px]">
                                            <img
                                                src={getUserAvatar(item.avatar)}
                                                alt={item.username}
                                                className="w-[40px] h-[40px] object-cover rounded-[50%]"
                                            />
                                            <div>
                                                <p className="leading-[20px]">{`${item.first_name} ${item.last_name}`}</p>
                                                <p className="leading-[20px] text-[#929292]">{`@${item.username}`}</p>
                                            </div>
                                        </div>
                                    ),
                                    value: item.id,
                                };
                            })}
                            onChange={handleSelectUser}
                        />
                    )}

                    {loadingConversations && (
                        <div className="flex items-start mt-[20px] gap-[20px]">
                            <div className="w-[300px] flex flex-col gap-[10px]">
                                <Skeleton baseColor="white" height={100} />
                                <Skeleton baseColor="white" height={100} />
                                <Skeleton baseColor="white" height={100} />
                            </div>
                            <div className="w-full">
                                <Skeleton baseColor="white" height={500} />
                            </div>
                        </div>
                    )}

                    {conversations.length > 0 && !loadingConversations && (
                        <div className="flex gap-[20px] mt-[20px]">
                            <ChatConversation
                                selectedOtherUser={selectedOtherUser}
                                handleOpenChat={handleOpenChat}
                            />

                            <div className="basis-2/3">
                                {!_.isEmpty(selectedConversation) ? (
                                    <ChatRoom
                                        conversation={selectedConversation}
                                        otherUser={selectedOtherUser}
                                    />
                                ) : (
                                    <div className="bg-white h-[500px] rounded-[16px]">
                                        <div className="flex items-center justify-center flex-col h-full">
                                            <IoChatboxEllipses className="text-[30px] text-[#2067da]" />
                                            <p className="font-semibold">
                                                Chọn một cuộc trò chuyện để bắt
                                                đầu
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
            {(!user.id ||
                (user.role === ROLE.CUSTOMER && conversations.length === 0)) &&
                !loadingConversations && (
                    <div className="bg-white h-[722px] rounded-[16px]">
                        <div className="flex items-center justify-center flex-col h-full">
                            <IoChatboxEllipses className="text-[100px] text-[#2067da]" />
                            <p className="font-semibold">
                                Quý khách không có cuộc trò chuyện nào
                            </p>
                            <p className="text-[#6b7388] text-[12px]">
                                Bắt đầu cuộc trò chuyện bằng cách viết tin nhắn
                                bên dưới.
                            </p>
                            <div className="text-[#2067da] mt-[22px] font-semibold relative h-[36px] flex justify-center items-center px-[24px] rounded-[50px] border-[1px] border-[#050a0f69] after:bg-[#2067da] after:absolute after:top-0 after:left-0 after:right-0 after:bottom-0 after:opacity-0 hover:after:opacity-10 after:transition-all after:duration-300 after:rounded-[50px]">
                                Chuyển đến đặt phòng của tôi
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Chat;
