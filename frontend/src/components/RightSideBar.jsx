import React from "react";
import { useSelector } from "react-redux";
import image from "./images/image3.png";
import { Link } from "react-router-dom";
import SuggestedUser from "./SuggestedUser";

const RightSideBar = () => {
  const { user, userProfile } = useSelector((state) => state.auth);

  // Function to calculate time difference
  const getTimeAgo = (updatedAt) => {
    if (!updatedAt) return "";

    const now = new Date();
    const updatedTime = new Date(updatedAt);
    const diffInMs = now - updatedTime;

    // Convert milliseconds to seconds
    const diffInSeconds = Math.floor(diffInMs / 1000);

    // Less than 60 seconds
    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec${diffInSeconds !== 1 ? "s" : ""} ago`;
    }

    // Less than 60 minutes
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? "s" : ""} ago`;
    }

    // Less than 24 hours
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }

    // Less than 30 days
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }

    // Less than 12 months
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
    }

    // More than a year
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
  };

  return (
    <div className="rightSideBar">
      <div className="rightSideBar-sec1">
        <div className="rightSideBar-user-profile">
          <Link to={`/${user._id}/profile`}>
            {" "}
            <img src={user?.profilePicture.url || image} alt="Profile" />
          </Link>
        </div>
        <div className="rightSideBar-user-detail">
          <div className="rightSideBar-user-username">
            <Link to={`/${user._id}/profile`}>{user?.username}</Link>
          </div>
          <div className="rightSideBar-user-bio">{user?.bio}</div>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "rgb(0, 183, 255)",
            fontWeight: "600",
          }}
        >
          {getTimeAgo(user?.updatedAt)}
        </div>
      </div>
      <SuggestedUser />
    </div>
  );
};

export default RightSideBar;

//yaha pe link pe click krne se hm iseleye profile page pe jaa rhe hai bcoz kyu ki App.jsx me profile ka path ka structure same hai
//and wo match krta hai main getUserProfile ke link se
