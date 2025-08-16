import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCommunityMessages } from "../redux/communityslice";
import axios from "axios";

const useGetAllCommMsg = () => {
  const dispatch = useDispatch();
  const { selectedCommunity } = useSelector((store) => store.community);

  useEffect(() => {
    const fetchCommMsg = async () => {
      // FIXED: Add null check to prevent errors
      if (!selectedCommunity || !selectedCommunity._id) {
        dispatch(setCommunityMessages([]));
        return;
      }

      try {
        console.log("Fetching messages for community:", selectedCommunity._id);

        const res = await axios.get(
          `https://bh-club.onrender.com/api/v1/communities/${selectedCommunity._id}/messages`,
          { withCredentials: true }
        );

        if (res.data.success) {
          console.log("Fetched community messages:", res.data);

          // FIXED: More robust message extraction
          let messages = [];
          if (res.data.data) {
            messages = Array.isArray(res.data.data)
              ? res.data.data
              : res.data.data.messages || [];
          } else if (res.data.messages) {
            messages = res.data.messages;
          }

          // Sort messages by creation time (like in regular messages)
          const sortedMessages = messages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );

          dispatch(setCommunityMessages(sortedMessages));
        }
      } catch (error) {
        console.error("Error fetching community messages:", error);
        dispatch(setCommunityMessages([]));
      }
    };

    fetchCommMsg();
  }, [selectedCommunity?._id, dispatch]); // Use optional chaining

  return null;
};

export default useGetAllCommMsg;
