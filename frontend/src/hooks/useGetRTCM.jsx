import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCommunityMessages } from "../redux/communityslice";

const useGetRTCM = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);
  const { communityMessages } = useSelector((store) => store.community);

  useEffect(() => {
    if (!socket) return;

    const handleNewCommunityMessage = (newMessage) => {
      // FIXED: Properly dispatch the action with the new messages array
      dispatch(setCommunityMessages([...communityMessages, newMessage]));
    };

    const handleCommunityMessageDeleted = (deletedMessageId) => {
      const filteredMessages = communityMessages.filter(
        (msg) => msg._id !== deletedMessageId
      );
      dispatch(setCommunityMessages(filteredMessages));
    };

    const handleCommunityMessageUpdated = (updatedMessage) => {
      const updatedMessages = communityMessages.map((msg) =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      );
      dispatch(setCommunityMessages(updatedMessages));
    };

    // Register all event listeners
    socket.on("newCommunityMessage", handleNewCommunityMessage);
    socket.on("communityMessageDeleted", handleCommunityMessageDeleted);
    socket.on("communityMessageUpdated", handleCommunityMessageUpdated);

    // Cleanup function
    return () => {
      socket.off("newCommunityMessage", handleNewCommunityMessage);
      socket.off("communityMessageDeleted", handleCommunityMessageDeleted);
      socket.off("communityMessageUpdated", handleCommunityMessageUpdated);
    };
  }, [socket, communityMessages, dispatch]); // Include communityMessages in dependencies

  return null;
};

export default useGetRTCM;
