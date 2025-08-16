import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Image from "./images/image3.png";
import toast from "react-hot-toast";
import axios from "axios";
import { markNotificationAsSeen } from "../redux/rtnSlice";

const NotificationBox = ({
  setNotificationBox,
  onClose,
  dbNotifications,
  setDbNotifications,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { likenotification, allNotification } = useSelector(
    (state) => state.rtNotification
  );
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Fetch notifications from database when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "https://bh-club.onrender.com/api/v1/notifications",
          { withCredentials: true }
        );
        if (response.data.success) {
          setDbNotifications(response.data.data.notifications || []);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Mark notifications as seen when component mounts
    markNotificationsAsSeen();
  }, [dispatch]);

  const markNotificationsAsSeen = async () => {
    try {
      await axios.patch(
        "https://bh-club.onrender.com/api/v1/notifications/mark-seen",
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error marking notifications as seen:", error);
    }
  };

  const handleCloseNotificationBox = () => {
    // Mark all unread notifications as read before closing
    markAllUnreadAsRead();
    setNotificationBox(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `https://bh-club.onrender.com/api/v1/notifications/${notificationId}/mark-read`,
        {},
        { withCredentials: true }
      );

      // Update local state
      setDbNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `https://bh-club.onrender.com/api/v1/notifications/${notificationId}`,
        { withCredentials: true }
      );

      // Update local state
      setDbNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );

      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const onclickHandle = (e) => {
    e.stopPropagation();
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Combine real-time notifications with database notifications
  // Fix: Use dbNotifications instead of allNotification from Redux
  const allNotifications = [
    ...likenotification.map((notif) => ({
      ...notif,
      _id: notif._id || `temp-${Date.now()}-${Math.random()}`,
      sender: notif.userDetails,
      message: notif.message,
      createdAt: notif.createdAt,
      isRead: false,
      isRealTime: true,
    })),
    ...dbNotifications.filter(
      (dbNotif) =>
        !likenotification.some((rtNotif) => rtNotif._id === dbNotif._id)
    ),
  ];

  return (
    <div
      className="post-modal"
      style={{ maxHeight: "50vw" }}
      onClick={onclickHandle}
    >
      <center>
        <b style={{ fontSize: "25px" }}>Notifications </b>
      </center>
      <div
        style={{ height: "100%", overflowY: "auto" }}
        className="Notification-mainbox"
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Loading notifications...
          </div>
        ) : allNotifications?.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "gray" }}>
            No notifications yet
          </div>
        ) : (
          allNotifications?.map((notification) => (
            <div
              key={notification._id}
              className="Notification-peruser"
              style={{
                backgroundColor: notification.isRead
                  ? "transparent"
                  : "#e3f2fd", // Light blue background for unread
                border: notification.isRead
                  ? "1px solid #e0e0e0"
                  : "2px solid #2196f3", // Blue border for unread
                borderRadius: "8px",
                margin: "5px 0",
                padding: "8px",
                position: "relative",
                boxShadow: notification.isRead
                  ? "none"
                  : "0 2px 8px rgba(33, 150, 243, 0.2)", // Subtle shadow for unread
                transition: "all 0.3s ease", // Smooth transition
              }}
            >
              <div>
                <Link
                  to={`/${notification.sender._id}/profile`}
                  onClick={() => {
                    handleCloseNotificationBox();
                    if (!notification.isRealTime) {
                      markAsRead(notification._id);
                    }
                  }}
                >
                  <img
                    src={notification.sender?.profilePicture?.url || Image}
                    alt="Profile"
                    style={{
                      height: "45px",
                      width: "52.5px",
                      borderRadius: "50%",
                    }}
                  />
                </Link>
              </div>
              <div className="Notification-details">
                <div>
                  <Link
                    to={`/${notification.sender._id}/profile`}
                    onClick={() => {
                      handleCloseNotificationBox();
                      if (!notification.isRealTime) {
                        markAsRead(notification._id);
                      }
                    }}
                  >
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: notification.isRead ? "500" : "700", // Bold for unread
                        width: "max-content",
                        color: notification.isRead ? "#333" : "#1976d2", // Blue color for unread
                      }}
                    >
                      {notification.sender?.username}
                    </div>
                  </Link>

                  <div
                    style={{
                      fontSize: notification.isRead ? "14px" : "15px", // Slightly larger for unread
                      fontWeight: notification.isRead ? "400" : "500", // Medium weight for unread
                      color: notification.isRead ? "#666" : "#333", // Darker text for unread
                    }}
                  >
                    {notification.message}
                    {notification.isRealTime ? " 🔥" : " 🎉"}
                    {!notification.isRead && (
                      <span
                        style={{
                          color: "#f44336",
                          fontSize: "12px",
                          marginLeft: "5px",
                        }}
                      >
                        • NEW
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "gray",
                    position: "absolute",
                    top: "15px",
                    right: "25px",
                  }}
                >
                  {formatRelativeTime(notification.createdAt)}
                </div>
              </div>

              {/* Delete button - only for database notifications */}
              {!notification.isRealTime && (
                <button
                  onClick={() => deleteNotification(notification._id)}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "gray",
                    fontSize: "16px",
                  }}
                  title="Delete notification"
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationBox;
