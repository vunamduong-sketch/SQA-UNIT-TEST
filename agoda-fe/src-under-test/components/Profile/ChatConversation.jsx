import React from "react";

const ChatConversation = ({ handleOpenChat }) => {
    return (
        <button onClick={() => handleOpenChat({ id: "conv-1", members: [] })}>
            open-conversation
        </button>
    );
};

export default ChatConversation;
