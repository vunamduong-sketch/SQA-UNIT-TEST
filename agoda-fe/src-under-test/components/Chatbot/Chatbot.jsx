import React, { useState, useEffect, useRef } from "react";
import { createNewChat, getChatMessages, sendMessage } from "lib/chat-api";
import { useAppSelector } from "redux/hooks";
import { ChatbotMessage } from "./ChatbotMessage";
import { MessageChatbotInput } from "./MessageChatbotInput";
import { Spin } from "antd";
import { marked } from "marked";
import chatbotImg from "../../images/chatbot/chatbot.png";
import { useNavigate } from "react-router-dom";

export default function ChatBot() {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.account.user);
    const [messages, setMessages] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [executingFunctions, setExecutingFunctions] = useState(new Set());
    const messagesEndRef = useRef(null);
    const streamingContentRef = useRef("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    const initializeChat = async () => {
        try {
            setIsLoading(true);
            const chatId = await createNewChat({
                user_id: user.id,
            });
            setCurrentChatId(chatId);
            // Load existing messages
            const existingMessages = await getChatMessages(chatId);
            setMessages(existingMessages.reverse()); // Reverse to show chronological order
        } catch (error) {
            console.error("Failed to initialize chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user.id) {
            initializeChat();
        }
    }, [user?.id]);

    const handleSendMessage = async (content) => {
        if (!currentChatId || isStreaming) return;

        // Add user message to UI
        const userMessage = {
            id: user?.id,
            role: "user",
            content,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        setIsStreaming(true);
        setStreamingContent("");
        streamingContentRef.current = "";
        setExecutingFunctions(new Set());

        try {
            await sendMessage(content, currentChatId, {
                onText: (text) => {
                    setStreamingContent((prev) => {
                        const newContent = prev + text;
                        streamingContentRef.current = newContent;
                        return newContent;
                    });
                },
                onSQL: (data) => {
                    const sqlMessage = {
                        id: data.id || Date.now().toString(),
                        role: "system",
                        content: "",
                        timestamp: new Date().toISOString(),
                        isSQL: true,
                        sql: data.sql,
                        result: data.result,
                    };
                    setMessages((prev) => [...prev, sqlMessage]);
                },
                onImage: (data) => {
                    const imageMessage = {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: "",
                        timestamp: new Date().toISOString(),
                        isImage: true,
                        url: data.url,
                    };
                    setMessages((prev) => [...prev, imageMessage]);
                },
                onExecutionStatus: (data) => {
                    if (data.status === "started") {
                        setExecutingFunctions(
                            (prev) => new Set([...prev, data.functionName])
                        );
                    } else if (data.status === "completed") {
                        setExecutingFunctions((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(data.functionName);
                            return newSet;
                        });
                    }
                },
                onEnd: () => {
                    const currentContent = streamingContentRef.current;
                    if (currentContent.trim()) {
                        const assistantMessage = {
                            id: Date.now().toString(),
                            role: "assistant",
                            content: currentContent,
                            timestamp: new Date().toISOString(),
                        };
                        setMessages((prev) => [...prev, assistantMessage]);
                    }
                    setStreamingContent("");
                    streamingContentRef.current = "";
                    setIsStreaming(false);
                    setExecutingFunctions(new Set());
                },
                onError: (error) => {
                    console.error("Streaming error:", error);
                    setStreamingContent("");
                    streamingContentRef.current = "";
                    setIsStreaming(false);
                    setExecutingFunctions(new Set());
                },
            });
        } catch (error) {
            console.error("Failed to send message:", error);
            setStreamingContent("");
            streamingContentRef.current = "";
            setIsStreaming(false);
            setExecutingFunctions(new Set());
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-50 flex items-center justify-center h-[550px] w-[400px] shadow-[rgba(4,7,10,0.24)_0px_4px_10px_0px] rounded-[16px]">
                <Spin size="large" />
            </div>
        );
    }

    if (!user?.id) {
        return (
            <div className="flex flex-col bg-gray-50 h-[550px] w-[400px] shadow-[rgba(4,7,10,0.24)_0px_4px_10px_0px] rounded-[16px] overflow-hidden">
                <div className="bg-[#2067da] shadow-sm border-b px-6 py-4 flex items-center gap-[6px]">
                    <img
                        src={chatbotImg}
                        alt="chatbotImg"
                        className="w-[40px] h-[40px] object-cover"
                    />
                    <h1 className="text-xl text-white font-semibold">
                        Trợ lý ảo Agoda
                    </h1>
                </div>
                <div className="h-full flex items-center justify-center">
                    <div
                        onClick={() => navigate("/login")}
                        className="text-[#2067da] cursor-pointer mt-[22px] font-semibold relative h-[36px] flex justify-center items-center px-[24px] rounded-[50px] border-[1px] border-[#050a0f69] after:bg-[#2067da] after:absolute after:top-0 after:left-0 after:right-0 after:bottom-0 after:opacity-0 hover:after:opacity-10 after:transition-all after:duration-300 after:rounded-[50px]"
                    >
                        Đăng nhập để sử dụng trợ lý ảo Agoda
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-gray-50 h-[550px] w-[400px] shadow-[rgba(4,7,10,0.24)_0px_4px_10px_0px] rounded-[16px] overflow-hidden">
            {/* Header */}
            <div className="bg-[#2067da] shadow-sm border-b px-6 py-4 flex items-center gap-[6px]">
                <img
                    src={chatbotImg}
                    alt="chatbotImg"
                    className="w-[40px] h-[40px] object-cover"
                />
                <h1 className="text-xl text-white font-semibold">
                    Trợ lý ảo Agoda
                </h1>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((message, index) => (
                    <div key={index}>
                        <ChatbotMessage key={message.id} message={message} />
                    </div>
                ))}

                {/* Streaming message */}
                {streamingContent && (
                    <ChatbotMessage
                        message={{
                            id: "streaming",
                            role: "assistant",
                            content: marked(streamingContent),
                            timestamp: new Date().toISOString(),
                        }}
                        isStreaming={isStreaming}
                    />
                )}

                {/* Function execution indicators */}
                {executingFunctions.size > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>
                            Executing:{" "}
                            {Array.from(executingFunctions).join(", ")}
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t px-6 py-4">
                <MessageChatbotInput
                    onSendMessage={handleSendMessage}
                    disabled={isStreaming}
                />
            </div>
        </div>
    );
}
