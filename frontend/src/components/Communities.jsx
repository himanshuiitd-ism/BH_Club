import axios from "axios";
import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCommunityMessages,
  setFollowedCommunity,
  setSelectedCommunity,
} from "../redux/communityslice";
import logoImage from "./images/image.png";
import toast from "react-hot-toast";
import { IoMdCall } from "react-icons/io";
import { BsSend, BsThreeDots } from "react-icons/bs";
import { LuMessageCircleCode } from "react-icons/lu";
import { HiUsers } from "react-icons/hi";
import { AiOutlineHeart } from "react-icons/ai";
import { BiPin } from "react-icons/bi";
import MakeCommunity from "./MakeCommunity";
import { MdAdd } from "react-icons/md";
import AddMembersInComm from "./AddMembersInComm";
import MoreOptionsInCommunity from "./MoreOptionsInCommunnity";
import EditCommunity from "./EditCommunity";
import LeaveCommunity from "./LeaveCommunity";
import MessageReactions from "./MessageReactions ";

const Communities = () => {
  const { user } = useSelector((store) => store.auth);
  const { socket, onlineUsers, communityOnlineCount } = useSelector(
    (store) => store.socketio
  );
  const { selectedCommunity, followedCommunity, communityMessages } =
    useSelector((store) => store.community);

  // State management
  const [loading, setLoading] = useState(true);
  const [availableComm, setAvailableComm] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [noCommunity, setNoCommunity] = useState(false);
  const [textMsg, setTextMsg] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayProfile, setDisplayProfile] = useState("");
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [makeCommunity, setMakeCommunity] = useState(false);
  const [addMem, setAddMem] = useState(false);
  const [moreOptions, setMoreOptions] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [leaveCommunity, setLeaveCommunity] = useState(false);
  const [unseenCounts, setUnseenCounts] = useState({});

  // Refs
  const lastScrollTop = useRef(0);
  const messagesContainerRef = useRef(null);
  const dispatch = useDispatch();

  // Utility functions
  const generateRandomName = useCallback(() => {
    const prefixes = [
      "Angry",
      "Crazy",
      "Dabangg",
      "Rowdy",
      "Dangerous",
      "Fearless",
      "Rebel",
      "Rocky",
      "Singham",
      "Dabangg",
      "Kick",
      "Judwaa",
      "Hero",
      "Villain",
      "Don",
      "Bad",
      "Great",
      "Mr.",
      "Ms.",
      "King",
      "Cyber",
      "Digital",
      "Virtual",
      "AI",
      "Block",
      "Crypto",
      "Neo",
      "Matrix",
      "Bug",
      "Error",
      "Algorithm",
      "Firewall",
      "Cloud",
      "Quantum",
      "Data",
      "Captain",
      "Lord",
      "Sir",
      "Madam",
    ];

    const nouns = [
      "Khan",
      "Kumar",
      "Singh",
      "Rathore",
      "Bhai",
      "Babu",
      "Pandey",
      "Baksh",
      "Prasad",
      "Malhotra",
      "Khanna",
      "Mehra",
      "Chopra",
      "Kapoor",
      "Roshan",
      "Devgn",
      "Bachchan",
      "Shetty",
      "Reddy",
      "Naidu",
      "Byte",
      "Bot",
      "Hacker",
      "Coder",
      "Nerd",
      "Geek",
      "Programmer",
      "Developer",
      "Engineer",
      "Scientist",
      "Researcher",
      "Analyst",
      "Architect",
      "Designer",
      "Artist",
      "Creator",
      "Destroyer",
      "Meme",
      "Lord",
      "Queen",
    ];

    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomPrefix} ${randomNoun}`;
  }, []);

  const generateRandomEmoji = useCallback(() => {
    const cuteEmojis = [
      "😊",
      "🥰",
      "😇",
      "😍",
      "😻",
      "😘",
      "😚",
      "😽",
      "😺",
      "😸",
      "🐶",
      "🐱",
      "🐰",
      "🐹",
      "🐻",
      "🧸",
      "🐥",
      "🐤",
      "🐣",
      "🐝",
      "🐧",
      "🐼",
      "🐨",
      "🐦",
      "🐾",
      "😎",
      "💀",
      "😂",
      "🤣",
      "👀",
      "🤡",
      "🥲",
      "🫠",
      "😈",
      "🤌",
      "🍗",
      "🥔",
      "☕",
      "🚬",
      "🛺",
      "🥦",
      "🧃",
      "🩴",
      "🪩",
      "👑",
      "💻",
      "🎮",
      "🛋️",
      "🧢",
      "🎉",
    ];

    return cuteEmojis[Math.floor(Math.random() * cuteEmojis.length)];
  }, []);

  const formatTime = useCallback((dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes} ${ampm}`;
  }, []);

  const getSelectedCommunityData = useCallback(() => {
    return availableComm.find((comm) => comm._id === selectedCommunity?._id);
  }, [availableComm, selectedCommunity?._id]);

  const fetchUnseenCount = useCallback(async (communityId) => {
    try {
      const res = await axios.get(
        `https://bh-club.onrender.com/api/v1/communities/${communityId}/unseenCount`,
        { withCredentials: true }
      );
      return res.data.data.unseenCount; //ye useCallback ka use kea hai iseleye kuch to return krna hoga
    } catch (error) {
      console.error(`Error fetching unseen count for ${communityId}:`, error);
      return 0;
    }
  }, []); //must call this on loading community page

  const fetchAllUnseenCounts = useCallback(async () => {
    if (!availableComm.length) return;

    try {
      const counts = {};
      const promises = availableComm.map(async (comm) => {
        const count = await fetchUnseenCount(comm._id);
        counts[comm._id] = count;
      });

      await Promise.all(promises);
      setUnseenCounts(counts);
    } catch (error) {
      console.error("Error fetching unseen counts:", error);
    }
  }, [availableComm, fetchUnseenCount]);

  const markMessageAsSeen = useCallback(async (communityId) => {
    try {
      await axios.patch(
        `https://bh-club.onrender.com/api/v1/communities/${communityId}/markAsSeen`,
        {}, //kuch body se nahi bhejna hai na
        { withCredentials: true }
      );

      setUnseenCounts((prev) => ({
        ...prev,
        [communityId]: 0, //obj me communityId ke corresponding value ko 0 kr do
      }));
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  });

  const handleCommunitySelect = useCallback(
    async (community) => {
      dispatch(setSelectedCommunity(community));
      if (unseenCounts[community._id] > 0) {
        await markMessageAsSeen(community._id);
      }
    },
    [dispatch, unseenCounts, markMessageAsSeen]
  );

  // Scroll handling
  const handleScroll = useCallback((e) => {
    const container = e.target;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
    lastScrollTop.current = scrollTop;
  }, []);

  const scrollToBottom = useCallback(
    (behavior = "smooth") => {
      if (messagesContainerRef.current && shouldAutoScroll) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: behavior,
        });
      }
    },
    [shouldAutoScroll]
  );

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewCommunityMessage = (newMessage) => {
      // Only add message if it's for the current selected community
      if (newMessage.community === selectedCommunity?._id) {
        dispatch(setCommunityMessages([...communityMessages, newMessage]));
      }

      //Shorting communities acc to latest message time (not working as intended)
      setAvailableComm((prevComms) => {
        return prevComms
          .map((comm) => {
            if (comm._id === newMessage.community) {
              return {
                ...comm,
                lastMessageTime: newMessage.createdAt,
                lastMessage: newMessage.content,
              };
            }
            return comm;
          })
          .sort((a, b) => {
            const timeA = a.lastMessageTime
              ? new Date(a.lastMessageTime)
              : new Date(0);
            const timeB = b.lastMessageTime
              ? new Date(b.lastMessageTime)
              : new Date(0);
            return timeB - timeA;
          });
      });
    };

    const handleCommunityMessageDeleted = (data) => {
      const filteredMessages = communityMessages.filter(
        (msg) => msg._id !== data.messageId
      );
      dispatch(setCommunityMessages(filteredMessages));
    };

    // Handle message reaction updates
    const handleMessageReactionUpdate = (updatedMessage) => {
      // Update the specific message in the communityMessages array
      const updatedMessages = communityMessages.map((msg) =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      );
      dispatch(setCommunityMessages(updatedMessages));
    };

    // Register socket event listeners
    socket.on("newCommunityMessage", handleNewCommunityMessage);
    socket.on("communityMessageDeleted", handleCommunityMessageDeleted);
    socket.on("messageReactionUpdate", handleMessageReactionUpdate);

    // Cleanup
    return () => {
      socket.off("newCommunityMessage", handleNewCommunityMessage);
      socket.off("communityMessageDeleted", handleCommunityMessageDeleted);
      socket.off("messageReactionUpdate", handleMessageReactionUpdate);
    };
  }, [socket, selectedCommunity?._id, communityMessages, dispatch]);

  // Join community room when selected community changes
  useEffect(() => {
    if (socket && selectedCommunity?._id) {
      socket.emit("joinCommunityRoom", selectedCommunity?._id);
    }
  }, [socket, selectedCommunity?._id]);

  // Message handling
  const handleSendMessage = useCallback(async () => {
    if (!textMsg.trim() || !selectedCommunity?._id) return;

    try {
      const response = await axios.post(
        `https://bh-club.onrender.com/api/v1/communities/${selectedCommunity?._id}/sendMessage`,
        {
          sender: user,
          content: textMsg,
          senderRandomName: displayName || "Anonymous",
          senderDisplayProfile: displayProfile || "🐶",
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setTextMsg("");
        setShouldAutoScroll(true);

        // Don't manually add message here - let socket handle it
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  }, [textMsg, selectedCommunity?._id, user, displayName, displayProfile]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const deleteMsg = useCallback(
    async (messageId) => {
      if (!messageId) return;

      try {
        const res = await axios.delete(
          `https://bh-club.onrender.com/api/v1/communities/${messageId}/delete`,
          { withCredentials: true }
        );

        if (res.data.success) {
          const updatedMsg = communityMessages.filter(
            (msg) => msg._id.toString() !== messageId.toString()
          );
          dispatch(setCommunityMessages(updatedMsg));
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete message");
      }
    },
    [dispatch, communityMessages]
  );

  const reportMsg = async (messageId, reason) => {
    if (!messageId || !reason) return;

    // Check if already reported
    const message = communityMessages.find((m) => m._id === messageId);
    if (message?.reports?.includes(user._id)) {
      toast.error("Already reported the message");
      return;
    }

    try {
      const res = await axios.post(
        `https://bh-club.onrender.com/api/v1/communities/${messageId}/report`,
        { reason: reason },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        const updatedMsg = communityMessages.map((msg) => {
          if (msg._id === messageId) {
            const reports = msg.reports || [];
            if (!reports.includes(user._id)) {
              return {
                ...msg,
                reports: [...reports, user._id],
              };
            }
          }
          return msg;
        });
        dispatch(setCommunityMessages(updatedMsg));
        setActiveReport(null);
      }
    } catch (error) {
      console.error("Error reporting message:", error);
      toast.error("Failed to report message");
    }
  };

  // Generate display name and emoji when community changes
  useEffect(() => {
    if (selectedCommunity?._id) {
      setDisplayName(generateRandomName());
      setDisplayProfile(generateRandomEmoji());
    }
  }, [selectedCommunity?._id, generateRandomName, generateRandomEmoji]);

  // Close message menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMessageMenu(null);
      setActiveReport(null);
    };

    if (activeMessageMenu || activeReport) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [activeMessageMenu, activeReport]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (communityMessages.length > 0) {
      const timeoutId = setTimeout(() => scrollToBottom(), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [communityMessages, scrollToBottom]);

  // Fetch communities on mount
  useEffect(() => {
    const fetchMyCommunities = async () => {
      if (!user?.communities?.length) {
        setLoading(false);
        setNoCommunity(true);
        return;
      }

      setLoading(true);

      try {
        const commDetails = user.communities.map((id) =>
          axios.get(
            `https://bh-club.onrender.com/api/v1/communities/${id}/community`,
            { withCredentials: true }
          )
        );

        const responses = await Promise.allSettled(commDetails);
        const successful = responses
          .filter((res) => res.status === "fulfilled")
          .map((res) => res.value.data.data);

        setAvailableComm(successful);
        setNoCommunity(successful.length === 0);
      } catch (error) {
        console.error("Error fetching communities:", error);
        setNoCommunity(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCommunities();
  }, [user, followedCommunity, dispatch, selectedCommunity]);

  useEffect(() => {
    if (availableComm.length > 0) {
      fetchAllUnseenCounts();
    }
  }, [availableComm, fetchAllUnseenCounts]);

  // Fetch messages when community is selected
  useEffect(() => {
    const fetchCommunityMessages = async () => {
      if (!selectedCommunity?._id) {
        dispatch(setCommunityMessages([]));
        return;
      }

      setMessagesLoading(true);
      try {
        const response = await axios.get(
          `https://bh-club.onrender.com/api/v1/communities/${selectedCommunity?._id}/messages`,
          { withCredentials: true }
        );

        const fetchedMessages = response.data.data || [];
        const sortedMessages = fetchedMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        dispatch(setCommunityMessages(sortedMessages));
        setShouldAutoScroll(true);
      } catch (error) {
        console.error("Error fetching messages:", error);
        dispatch(setCommunityMessages([]));
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchCommunityMessages();
  }, [selectedCommunity?._id, dispatch]);

  // Clear selected community on mount
  useEffect(() => {
    dispatch(setSelectedCommunity(null));
  }, [dispatch]);

  const selectedCommunityData = getSelectedCommunityData();

  const getSenderId = (sender) => {
    if (typeof sender === "string") return sender;
    if (sender && sender._id) return sender._id;
    if (sender && sender.id) return sender.id;
    return null;
  };

  useEffect(() => {
    setMoreOptions(false);
  }, [selectedCommunity, user]);

  return (
    <div className="communities">
      {/* Right Sidebar - Communities List */}
      <div className="rightCommunityBar">
        <button
          className="create-community"
          onClick={() => setMakeCommunity(true)}
        >
          + Create Community
        </button>
        <div className="rightCommunityBar-my-community">
          <h1>Secret Society</h1>
          <div className="my-community-section">
            {loading ? (
              <div className="community-loading">
                <div className="loading-spinner"></div>
                Loading communities...
              </div>
            ) : availableComm?.length > 0 ? (
              availableComm.map((community) => (
                <div
                  key={community._id}
                  className={`each-community ${
                    selectedCommunity?._id === community._id ? "selected" : ""
                  }`}
                  onClick={() => {
                    handleCommunitySelect(community);
                  }}
                >
                  <img
                    src={community.profilePhoto?.url || logoImage}
                    alt="Community"
                  />
                  <h1>{community.name}</h1>
                  {unseenCounts[community._id] > 0 && (
                    <span className="unseen-count-badge">
                      {unseenCounts[community._id]}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="community-empty-state">
                <p>No communities yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section - Chat */}
      <div className="communities-chat-sec">
        {selectedCommunity && selectedCommunityData ? (
          <>
            {/* Chat Header */}
            <div className="community-chat-header">
              <div className="community-header-info">
                <div className="community-avatar-container">
                  <img
                    src={selectedCommunityData.profilePhoto?.url || logoImage}
                    alt={selectedCommunityData.name}
                  />
                  <div className="community-status-dot"></div>
                </div>
                <div className="community-details">
                  <h2>{selectedCommunityData.name}</h2>
                  <div className="community-meta">
                    <span className="member-count">
                      <HiUsers />
                      {selectedCommunityData.members?.length || 0} members
                    </span>
                    <span className="online-indicator"></span>
                    <span>{communityOnlineCount} Active now</span>
                    {selectedCommunity?.createdBy === user._id ? (
                      <span style={{ color: "purple", fontWeight: "700" }}>
                        Creator
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
              <div className="community-header-actions">
                <button
                  className="header-action-btn"
                  aria-label="Call"
                  onClick={() => setAddMem(true)}
                >
                  <MdAdd />
                </button>
                <button className="header-action-btn" aria-label="Call">
                  <IoMdCall />
                </button>
                <button
                  className="header-action-btn"
                  aria-label="More options"
                  onClick={() => setMoreOptions(!moreOptions)}
                >
                  <BsThreeDots />
                </button>
                {moreOptions && (
                  <div className="more-options-overlay" style={{ zIndex: "2" }}>
                    <MoreOptionsInCommunity
                      setMoreOptions={setMoreOptions}
                      setEditProfile={setEditProfile}
                      setLeaveCommunity={setLeaveCommunity}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Messages Container */}
            <div
              ref={messagesContainerRef}
              className="community-messages-container"
              onScroll={handleScroll}
            >
              {messagesLoading ? (
                <div className="community-loading">
                  <div className="loading-spinner"></div>
                  Loading messages...
                </div>
              ) : communityMessages.length === 0 ? (
                <div className="community-empty-state">
                  <div className="empty-icon">
                    <LuMessageCircleCode />
                  </div>
                  <h3>Start the conversation! 🚀</h3>
                  <p>Be the first to drop a message in this community</p>
                  <button
                    className="start-chatting-btn"
                    onClick={() =>
                      document
                        .querySelector(".community-message-input")
                        ?.focus()
                    }
                  >
                    Break the ice ✨
                  </button>
                </div>
              ) : (
                communityMessages.map((message) => {
                  const isOwnMessage = getSenderId(message.sender) === user._id;
                  return (
                    <div
                      key={message._id}
                      className={`message-wrapper ${
                        isOwnMessage
                          ? "own-message-wrapper"
                          : "other-message-wrapper"
                      } ${
                        message.reactions && message.reactions.length > 0
                          ? "has-reactions"
                          : ""
                      }`} // ADD has-reactions class
                    >
                      <div
                        className={`community-message-bubble ${
                          isOwnMessage ? "own-message" : ""
                        }`}
                      >
                        {!isOwnMessage && (
                          <div className="message-header">
                            <span className="message-sender-profile">
                              {message.senderDisplayProfile}
                            </span>
                            <span
                              className="message-sender"
                              style={{ fontSize: "16px" }}
                            >
                              {message.senderDisplayName ||
                                message.senderRandomName}
                            </span>
                            <button
                              className="message-options-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMessageMenu(
                                  activeMessageMenu === message._id
                                    ? null
                                    : message._id
                                );
                              }}
                              aria-label="Message options"
                            >
                              <BsThreeDots />
                            </button>
                            {activeMessageMenu === message._id && (
                              <div className="message-options-menu left-menu">
                                <button className="menu-option">
                                  <AiOutlineHeart /> React
                                </button>
                                <button
                                  className="menu-option"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMessageMenu(null);
                                    setActiveReport(message._id);
                                  }}
                                >
                                  <BiPin /> Report{" "}
                                  <p
                                    style={{ color: "red", fontWeight: "700" }}
                                  >
                                    {message.reports?.length || 0}
                                  </p>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {isOwnMessage && (
                          <div className="message-header own-header">
                            <span className="message-sender-profile">
                              {message.senderDisplayProfile}
                            </span>
                            <span
                              className="message-sender"
                              style={{ fontSize: "16px" }}
                            >
                              {message.senderDisplayName ||
                                message.senderRandomName}
                            </span>
                            <button
                              className="message-options-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMessageMenu(
                                  activeMessageMenu === message._id
                                    ? null
                                    : message._id
                                );
                              }}
                              aria-label="Message options"
                            >
                              <BsThreeDots />
                            </button>
                            {activeMessageMenu === message._id && (
                              <div className="message-options-menu right-menu">
                                <button className="menu-option">
                                  <AiOutlineHeart /> React
                                </button>
                                <button
                                  className="menu-option delete-option"
                                  onClick={() => deleteMsg(message._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <div
                          className={`message-content ${
                            isOwnMessage
                              ? "my-messageContent"
                              : "your-messageCont"
                          }`}
                          style={{ fontSize: "18px", lineHeight: "1.5" }}
                        >
                          {message.content}
                        </div>
                        <MessageReactions
                          message={message}
                          isOwnMessage={isOwnMessage}
                        />
                        {/* {message.reactions && message.reactions.length > 0 && (
                          <div className="message-reactions">
                            {message.reactions.map((reaction, index) => (
                              <span key={index} className="reaction-item">
                                {reaction.emoji}
                              </span>
                            ))}
                          </div>
                        )} */}
                      </div>
                      <span className="message-time-external">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Scroll to bottom button */}
            {!shouldAutoScroll && (
              <button
                className="scroll-to-bottom-btn"
                onClick={() => {
                  setShouldAutoScroll(true);
                  scrollToBottom();
                }}
              >
                ↓ New messages
              </button>
            )}

            {/* Message Input */}
            <div className="community-input-container">
              <div className="display-name-container">
                <span className="display-name-label">
                  Your secret identity:
                </span>
                <span className="display-name-input">
                  {displayName} + {displayProfile}
                </span>
              </div>
              <div className="message-input-wrapper">
                <textarea
                  className="community-message-input"
                  placeholder="Drop your thoughts here... 💭"
                  value={textMsg}
                  onChange={(e) => setTextMsg(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                />
                <button
                  className="community-send-btn"
                  onClick={handleSendMessage}
                  disabled={!textMsg.trim()}
                  aria-label="Send message"
                >
                  <BsSend />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="community-empty-state">
            <div className="empty-icon">
              <LuMessageCircleCode />
            </div>
            <h3>Pick your crew! 👥</h3>
            <p>
              Select a community from the sidebar to start vibing with your
              people
            </p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {activeReport && (
        <div
          className="report-modal-overlay"
          onClick={() => setActiveReport(null)}
        >
          <div className="report-reason" onClick={(e) => e.stopPropagation()}>
            <h3>Report Message</h3>
            <p>Why are you reporting this message?</p>

            <button onClick={() => reportMsg(activeReport, "spam")}>
              Spam
            </button>

            <button onClick={() => reportMsg(activeReport, "inappropriate")}>
              Inappropriate Content
            </button>

            <button onClick={() => reportMsg(activeReport, "harassment")}>
              Harassment
            </button>

            <button onClick={() => reportMsg(activeReport, "fake")}>
              Fake Information
            </button>

            <button onClick={() => reportMsg(activeReport, "other")}>
              Other
            </button>

            <button
              className="cancel-btn"
              onClick={() => setActiveReport(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Creating community */}
      {makeCommunity && (
        <div
          className="report-modal-overlay"
          onClick={() => setMakeCommunity(false)}
        >
          <MakeCommunity
            makeCommunity={makeCommunity}
            setMakeCommunity={setMakeCommunity}
          />
        </div>
      )}

      {addMem && (
        <div
          className="report-modal-overlay"
          style={{ zIndex: "2" }}
          onClick={() => setAddMem(false)}
        >
          <AddMembersInComm
            selectedCommunity={selectedCommunity}
            setAddMem={setAddMem}
          />
        </div>
      )}

      {/* Edit Community */}
      {editProfile && (
        <div
          className="report-modal-overlay"
          style={{ zIndex: "100" }}
          onClick={() => setEditProfile(false)}
        >
          <EditCommunity setEditProfile={setEditProfile} />
        </div>
      )}

      {leaveCommunity && (
        <div
          className="report-modal-overlay"
          style={{ zIndex: "2" }}
          onClick={() => setLeaveCommunity(false)}
        >
          <LeaveCommunity
            setLeaveCommunity={setLeaveCommunity}
            leaveCommunity={leaveCommunity}
            setMoreOptions={setMoreOptions}
          />
        </div>
      )}
    </div>
  );
};

export default Communities;
