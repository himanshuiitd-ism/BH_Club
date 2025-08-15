// Messages.jsx
import { useSelector } from "react-redux";
import image from "./images/image3.png";
import { Link } from "react-router-dom";
import useGetAllMessage from "../hooks/useGetAllMessage";
import { useEffect, useRef, useState } from "react";
import useGetRTM from "../hooks/useGetRTM";

const Messages = () => {
  const { selectedUser, user } = useSelector((store) => store.auth);
  const { messages } = useSelector((store) => store.chat);
  const { onlineUsers } = useSelector((store) => store.socketio);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollTop = useRef(0);

  useGetAllMessage();
  useGetRTM();

  // ✅ Added safety check for messages
  const safeMessages = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    const container = document.querySelector(".Message-container");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [safeMessages]); // Use safeMessages instead of messages

  const getTimeAgo = (updatedAt) => {
    if (!updatedAt) return "";

    const now = new Date();
    const updatedTime = new Date(updatedAt);
    const diffInMs = now - updatedTime;
    const diffInSeconds = Math.floor(diffInMs / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec${diffInSeconds !== 1 ? "s" : ""} ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes} ${ampm}`;
  };

  const shouldShowFullDate = (dateString) => {
    const now = new Date();
    const msgDate = new Date(dateString);
    const diffInDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
    return diffInDays >= 1;
  };

  const handleScroll = (e) => {
    const container = e.target;
    const scrollTop = container.scrollTop;

    if (scrollTop > lastScrollTop.current && scrollTop > 50) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }

    lastScrollTop.current = scrollTop;
  };

  if (!user?._id || !selectedUser?._id) {
    return (
      <div className="Message">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  const isOnline = onlineUsers?.includes(selectedUser._id);

  return (
    <div className="Message">
      {/* Header Section */}
      <div
        className={`message-header ${
          showHeader ? "header-visible" : "header-hidden"
        }`}
        style={{ backgroundColor: "#B3D5FFFF" }}
      >
        <div className="user-info">
          <div className="avatar-container">
            <img
              src={selectedUser?.profilePicture?.url || image}
              alt="Profile"
            />
            {isOnline ? (
              <div
                className="online-status"
                style={{ backgroundColor: "#10b981" }}
              ></div>
            ) : (
              <div
                className="online-status"
                style={{ backgroundColor: "red" }}
              ></div>
            )}
          </div>
          <div className="user-details">
            <h1>{selectedUser?.username}</h1>
            <span className="user-status">
              {isOnline ? "Active now" : "Not Active"}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <Link
            to={`/${selectedUser?._id}/profile`}
            className="view-profile-btn"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Messages Container */}
      <div className="Message-container" onScroll={handleScroll}>
        {safeMessages.length > 0 ? (
          safeMessages.map((msg) => {
            // Add extra safety checks
            const isCurrentUser =
              msg?.sender?._id && user?._id && msg.sender._id === user._id;

            return (
              <div
                key={msg?._id || Math.random()} // Fallback key if _id is missing
                className={`message-bubble ${
                  isCurrentUser ? "sent" : "received"
                }`}
              >
                <div
                  className={`message-content ${
                    isCurrentUser ? "my-msg" : "your-msg"
                  }`}
                >
                  {msg?.message}
                </div>
                <div className="message-time">
                  {shouldShowFullDate(msg?.createdAt)
                    ? getTimeAgo(msg?.createdAt)
                    : formatTime(msg?.createdAt)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
