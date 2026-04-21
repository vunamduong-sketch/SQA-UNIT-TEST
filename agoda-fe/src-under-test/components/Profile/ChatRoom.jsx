import React from "react";

const ChatRoom = ({ conversation, otherUser }) => {
    return <div>{`room:${conversation?.id}:${otherUser?.id || ""}`}</div>;
};

export default ChatRoom;
