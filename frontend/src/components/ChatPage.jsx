import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import image from "./images/image3.png";
import { setSelectedUser } from "../redux/authSlice";
import { IoMdCall } from "react-icons/io";
import { BsSend, BsThreeDots } from "react-icons/bs";
import { LuMessageCircleCode } from "react-icons/lu";
import Messages from "./Messages";
import { setMessages } from "../redux/chatSlice";

const ChatPage = () => {
  const { user, selectedUser } = useSelector((store) => store.auth);
  const { messages } = useSelector((state) => state.chat);
  const [availableUsers, setAvailableUsers] = useState([]);
  const { onlineUsers } = useSelector((store) => store.socketio);
  const [loading, setLoading] = useState(true);
  const [noFollowing, setNoFollowing] = useState(false);
  const dispatch = useDispatch();
  const [textMsg, setTextMsg] = useState();

  //when page is refreshed selecteduser bcom null
  useEffect(() => {
    // dispatch(resetSelectedUser(null));
    dispatch(setSelectedUser(null));
  }, []);

  useEffect(() => {
    const fetchFollowingUser = async () => {
      if (!user?.following?.length) {
        setLoading(false);
        setNoFollowing(true); //this is to display message
        return;
      }

      setLoading(true);

      try {
        const userDetailsPromise = user.following.map((userId) =>
          axios.get(`http://localhost:8001/api/v1/user/${userId}/profile`, {
            withCredentials: true,
          })
        );

        // Use allSettled to handle individual failures gracefully
        const responses = await Promise.allSettled(userDetailsPromise);

        // Extract successful responses and log failed ones
        const followingUserData = responses
          .filter((result, index) => {
            if (result.status === "rejected") {
              return false;
            }
            // Fixed: Check for result.value.data.data instead of result.value.data.user
            return result.value?.data?.data;
          })
          // Fixed: Extract user data from result.value.data.data
          .map((result) => result.value.data.data);

        const chatableUser = followingUserData.filter((userData) => {
          // Safety checks
          if (!userData || !userData._id) return false;

          if (!userData.privacy) {
            return true;
          } else if (
            userData.privacy &&
            userData.following?.includes(user._id)
          ) {
            return true;
          }
          return false;
        });

        //now we want those user with whom I last chated or who send me msg latest

        const userWithLastMessage = await Promise.allSettled(
          chatableUser.map(async (userData) => {
            try {
              const messageResponse = await axios.get(
                `http://localhost:8001/api/v1/message/all/${userData._id}`,
                { withCredentials: true }
              ); //isme bahut kuch aaega usme se messages array nikalna hai
              const messages =
                messageResponse?.data?.data?.messages ||
                messageResponse?.data?.messages || //baad me wala messages convo.schema wala messages array hai
                [];

              const lastMessage =
                messages.length > 0 ? messages[messages.length - 1] : null;

              const lastMessageTime = lastMessage?.createdAt || null;

              return {
                ...userData,
                lastMessageTime: lastMessageTime,
                messageCount: 0,
              };
            } catch (error) {
              console.error(
                `No chat history found for user ${userData.username}:`,
                error.response?.data?.message || error.message
              );
              return {
                ...userData,
                lastMessageTime: null,
                messageCount: 0,
              };
            }
          })
        ); //this gives us last messagetime of every user present in my chat sec.

        //Extract successful result and handling failure
        const userWithChatData = userWithLastMessage
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value); //userWithChatData me sb ke userwithlastmessage me se sari values store ho gae hai.

        // Sort by last message time (most recent first)
        // Users with no chat history will appear at the bottom
        const sortedUsers = userWithChatData.sort((a, b) => {
          // If both have message times, sort by most recent
          if (a.lastMessageTime && b.lastMessageTime) {
            return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
          }
          // If only a has message time, a comes first
          if (a.lastMessageTime && !b.lastMessageTime) {
            return -1;
          }
          // If only b has message time, b comes first
          if (!a.lastMessageTime && b.lastMessageTime) {
            return 1;
          }
          // If neither has message time, sort by user updatedAt
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        setAvailableUsers(sortedUsers);
      } catch (error) {
        console.error("Error in fetching following users: ", error);
        toast.error(error.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingUser();
  }, [user]);

  const sendMsgHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        `http://localhost:8001/api/v1/message/send/${receiverId}`,
        { textMsg },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const newMessage = {
          ...res.data.data,
          sender: {
            _id: user._id,
          },
          receiver: {
            _id: selectedUser._id,
          },
        };

        // Add the new message to the existing messages array
        dispatch(setMessages([...messages, newMessage]));
        setTextMsg("");
      }
    } catch (error) {
      console.error(error.message || "message not send master ");
      toast.error(error.response?.data?.message);
    }
  };

  const handleKeyDown = (e, receiverId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsgHandler(receiverId);
    }
  };

  return (
    <div className="ChatPage" style={{ marginLeft: "19vw" }}>
      <div className="ChatPageSec1">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "10px",
            borderBottom: "2px solid #8e8e8e",
            paddingLeft: "10px",
          }}
        >
          <img src={user.profilePicture?.url || image} alt="profilePhoto" />
          <h1>{user?.username}</h1>
        </div>

        {loading
          ? "Please wait"
          : availableUsers.map((followedUser) => {
              const isOnline = onlineUsers?.includes(followedUser._id);
              return (
                <div
                  onClick={() => dispatch(setSelectedUser(followedUser))}
                  className="chatPageUser"
                  key={followedUser._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                    padding: "5px ",
                    paddingLeft: "10px",
                    borderRadius: "4px",
                  }}
                >
                  <img
                    src={followedUser.profilePicture?.url || image}
                    alt="profilePhoto"
                  />
                  <div className="userNameBox-ChatPage">
                    <p>{followedUser.username}</p>
                    {isOnline ? (
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: "600",
                          color: "rgb(129, 214, 0)",
                        }}
                      >
                        Online
                      </p>
                    ) : (
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: "600",
                          color: "red",
                        }}
                      >
                        Offline
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
      <div className="ChatPageSec2">
        {selectedUser ? (
          <div className="ChatPageSec2-container">
            <div className="ChatPageSec2-heading" style={{ display: "flex" }}>
              <img src={selectedUser?.profilePicture?.url || image} alt="HP" />
              <p>{selectedUser?.username}</p>
              <div className="ChatPageSec2-icons">
                <div className="ChatPageSec2-icon">
                  <IoMdCall />
                </div>
                <div className="ChatPageSec2-icon">
                  <BsThreeDots />
                </div>
              </div>
            </div>
            <div className="ChatPageSec2-middle">
              <Messages />
            </div>
            <input
              type="text"
              value={textMsg} //value mtlb ki jo text msg me hai wo yaha input me dikhna chahie ,to jo likhte hai wo pehle textMsg me jaega phir yaha input me dikhega
              onChange={(e) => setTextMsg(e.target.value)}
              placeholder="They are waiting for your presence..."
              className="ChatPageSec2-input"
              onKeyDown={(e) => handleKeyDown(e, selectedUser._id)}
            />
            <button
              className="ChatPageSec2-input-send"
              onClick={() => sendMsgHandler(selectedUser._id)}
            >
              <BsSend />
            </button>
          </div>
        ) : (
          <div className="ChatPageSec2-container-fornoMsg">
            <LuMessageCircleCode fontSize="200px" />
            <p style={{ fontSize: "30px", fontWeight: "600" }}>Your Message</p>
            <p>Send a message to start a chat</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
