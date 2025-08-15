import { IoIosChatbubbles, IoIosTrendingUp } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import logoImage from "./images/image3.png";
import {
  FaHome,
  FaUser,
  FaSearch,
  FaPlusSquare,
  FaHeart,
  FaArrowAltCircleLeft,
} from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../redux/authSlice";
import CreatePost from "./CreatePost";
import { useState, useEffect } from "react";
import Logout from "./Logout";
import NotificationBox from "./Notification";
import { clearAllNotifications } from "../redux/rtnSlice";
import { IoPeopleSharp } from "react-icons/io5";
import { FaLinkedin } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";

const LeftSideBar = () => {
  const { user, userProfile } = useSelector((state) => state.auth);
  const [postOpen, setPostOpen] = useState(false);
  const [logout, setLogOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { likenotification, unreadCount } = useSelector(
    (state) => state.rtNotification
  );
  const [notificationBox, setNotificationBox] = useState(false);

  const [dbNotifications, setDbNotifications] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const markAllUnreadAsRead = async () => {
    try {
      await axios.patch(
        "http://localhost:8001/api/v1/notifications/mark-all-read",
        {},
        { withCredentials: true }
      );
      // Update local state - mark all notifications as read
      setDbNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const sidebarElements = [
    { name: "Home", logo: <FaHome />, tooltip: "Home" },
    { name: "Search", logo: <FaSearch />, tooltip: "Search" },
    { name: "Explore", logo: <IoIosTrendingUp />, tooltip: "Explore" },
    { name: "Messages", logo: <IoIosChatbubbles />, tooltip: "Messages" },
    { name: "Community", logo: <IoPeopleSharp />, tooltip: "Community" },
    { name: "Notifications", logo: <FaHeart />, tooltip: "Notifications" },
    { name: "Create", logo: <FaPlusSquare />, tooltip: "Create" },
    {
      name: "Profile",
      logo: (
        <div className="profile-photo-sidebar">
          <img
            src={user?.profilePicture?.url || logoImage}
            alt="Profile"
            onError={(e) => {
              e.target.src = logoImage;
            }}
          />
        </div>
      ),
      tooltip: "Profile",
    },
    { name: "LogOut", logo: <FaArrowAltCircleLeft />, tooltip: "Logout" },
  ];

  const logoutHandler = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8001/api/v1/user/logout",
        {},
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAuthUser(null));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : "Logout failed"
      );
    }
  };

  const clickHandler = (name) => {
    if (name === "LogOut") {
      setLogOut(true);
    } else if (name === "Create") {
      setPostOpen(!postOpen);
    } else if (name === "Profile") {
      navigate(`/${user?._id}/profile`);
    } else if (name === "Home") {
      navigate("/");
    } else if (name === "Search") {
      // Add search functionality
    } else if (name === "Explore") {
      // Add explore functionality
    } else if (name === "Messages") {
      navigate(`/chat`);
    } else if (name === "Notifications") {
      setNotificationBox(true);
    } else if (name === "Community") {
      navigate("/communities");
    }
  };

  return (
    <>
      <div className="leftSideBar">
        {/* Logo - Hidden on mobile */}
        <div className="logo">
          <img src={logoImage} alt="Logo" />
          <span>BH Club</span>
        </div>
        {/* Navigation Items */}
        <div className="leftSideBarLv1">
          {sidebarElements.map((element, index) => (
            <div
              className="leftSideBarLv2"
              onClick={() => clickHandler(element.name)}
              key={index}
              data-tooltip={element.tooltip}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  clickHandler(element.name);
                }
              }}
            >
              <span className="icon">{element.logo}</span>
              <span className="elementName">
                {element.name}
                {element.name === "Notifications" &&
                  likenotification?.length > 0 && (
                    <span
                      className="badge text-bg-secondary"
                      style={{
                        marginLeft: "1vw",
                        height: "100%",
                        width: "max-content",
                        backgroundColor: "red",
                        padding: "0 6px",
                        borderRadius: "50%",
                        color: "white",
                      }}
                    >
                      {unreadCount < 1000 ? unreadCount : "999+"}
                    </span>
                  )}
              </span>
            </div>
          ))}
        </div>
        <div className="linkedIn">
          <div>
            {" "}
            <a href="https://www.linkedin.com/in/himanshu-priyadarshi-29787031a/">
              <FaLinkedin />
            </a>
          </div>
          <div>
            <a href="https://www.linkedin.com/in/himanshu-priyadarshi-29787031a/">
              LinkedIn
            </a>
          </div>
        </div>
        <div className="Instagram">
          <div>
            {" "}
            <a href="https://www.instagram.com/him.anshu_iit/">
              <RiInstagramFill />
            </a>
          </div>
          <div>
            <a href="https://www.instagram.com/him.anshu_iit/">Insta</a>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {postOpen && (
        <div
          className="createPost"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPostOpen(false);
            }
          }}
        >
          <CreatePost postOpen={postOpen} setPostOpen={setPostOpen} />
        </div>
      )}

      {/* Logout Modal */}
      {logout && (
        <div
          className="createPost"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setLogOut(false);
            }
          }}
        >
          <Logout
            logout={logout}
            setLogOut={setLogOut}
            logoutHandler={logoutHandler}
          />
        </div>
      )}

      {/* Notification */}
      {notificationBox && (
        <div
          className="createPost"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setNotificationBox(false);
              markAllUnreadAsRead();
              dispatch(clearAllNotifications());
            }
          }}
        >
          <NotificationBox
            notificationBox={notificationBox}
            setNotificationBox={setNotificationBox}
            setDbNotifications={setDbNotifications}
            dbNotifications={dbNotifications}
          />
        </div>
      )}
    </>
  );
};

export default LeftSideBar;
