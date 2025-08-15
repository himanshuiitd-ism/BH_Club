import React, { useEffect, useState } from "react";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useDispatch, useSelector } from "react-redux";
import image from "./images/image3.png";
import { Link, useParams } from "react-router-dom";
import { CiHeart, CiLock } from "react-icons/ci";

import { AiOutlineHeart, AiFillHeart, AiOutlineComment } from "react-icons/ai";
import axios from "axios";
import toast from "react-hot-toast";
import { setAuthUser, setUserProfile } from "../redux/authSlice";
const Profile = () => {
  const params = useParams();
  const userId = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(userId);
  const [activeTab, setActiveTab] = useState("posts");

  useGetUserProfile(userId);
  const { userProfile, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  // Dynamic values instead of hardcoded
  const isMyId = user?._id === userId;
  const isFollowed = user?.following?.includes(userId) || false; //mai usko follow krta hu ya nahi

  useEffect(() => {
    if (currentUserId !== userId) {
      setIsLoading(true);
      setCurrentUserId(userId);
    }
  }, [userId, currentUserId]);

  useEffect(() => {
    if (userProfile && userProfile._id === userId) {
      setIsLoading(false);
    }
  }, [userId, userProfile]);

  if (isLoading || !userProfile || userProfile._id !== userId) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading Profile...</div>
      </div>
    );
  }

  const displayedPost =
    activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;

  const followHandler = async (e) => {
    try {
      const res = await axios.post(
        `http://localhost:8001/api/v1/user/followOrUnfollow/${userId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedUser = {
          ...user,
          following: isFollowed
            ? user.following.filter((id) => id !== userId)
            : [...user.following, userId],
        };
        dispatch(setAuthUser(updatedUser));

        const updatedUserProfile = {
          ...userProfile,
          followers: isFollowed
            ? userProfile.followers.filter((id) => id !== user?._id)
            : [...userProfile.followers, user._id],
        };
        dispatch(setUserProfile(updatedUserProfile));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="Profile">
      <div className="profile-header">
        {/* Profile Image */}
        <div className="Profile-image">
          <img
            src={userProfile?.profilePicture?.url || image}
            alt={`${userProfile?.username}'s profile`}
          />
        </div>
        {/* Profile Info */}
        <div className="profile-info">
          {/* Username and Buttons Row */}
          <div className="profile-header-top">
            <div className="profile-username-section">
              <h1>{userProfile?.username}</h1>
              {userProfile?.bio && <h2>{userProfile.bio}</h2>}
            </div>

            {/* Action Buttons */}
            <div className="profile-buttons">
              {isMyId ? (
                <div className="profile-top-button">
                  <Link to="/account/edit">
                    <button>Edit Profile</button>
                  </Link>
                  <button>View Archive</button>
                  <button>Ad Tools</button>
                </div>
              ) : isFollowed ? (
                <div className="following">
                  <button onClick={followHandler}>Following</button>
                  <button>Message</button>
                </div>
              ) : (
                <div className="follow">
                  <button onClick={followHandler}>Follow</button>
                </div>
              )}
            </div>
          </div>
          {/* Stats Row */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">
                {userProfile?.posts?.length || 0}
              </span>
              <span className="stat-label">posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {userProfile?.followers?.length || 0}
              </span>
              <span className="stat-label">followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {userProfile?.following?.length || 0}
              </span>
              <span className="stat-label">following</span>
            </div>
          </div>
          <div className="more-content-in-Profile">
            <p>This is my post</p>
            <p>This is my post</p>
            <p>This is my post</p>
            <p>This is my post</p>
          </div>
        </div>
      </div>
      <div className="Profile-content-section">
        {isMyId ||
        !userProfile?.privacy ||
        (userProfile?.privacy && userProfile?.following?.includes(user._id)) ? (
          <div className="post-saved-reals-tags">
            <button
              className={`post-button ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
            <button
              className={`saved-button ${
                activeTab === "saved" ? "active" : ""
              }`}
              onClick={() => setActiveTab("saved")}
            >
              Saved
            </button>
            <button
              className={`reels-button ${
                activeTab === "reels" ? "active" : ""
              }`}
              onClick={() => setActiveTab("reels")}
            >
              Reels
            </button>
            <button
              className={`tags-button ${activeTab === "tags" ? "active" : ""}`}
              onClick={() => setActiveTab("tags")}
            >
              Tags
            </button>
            <div className="contents">
              {displayedPost.map((post) => {
                return (
                  <div
                    className="content-middle"
                    key={post?._id}
                    style={{
                      position: "relative",
                      overflow: "hidden", // Ensures blur doesn't leak outside
                      height: "300px", // Set a fixed height (adjust as needed)
                      backgroundColor: "#f0f0f0", // Fallback background
                      width: "300px",
                    }}
                  >
                    {/* Blurry Background Image */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${post.image.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(5px)",
                      }}
                    />

                    {/* Main Image (sharp) */}
                    <img
                      src={post.image.url}
                      alt="Post"
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        zIndex: 1,
                      }}
                    />
                    <div className="profile-post-details">
                      <div className="profile-post-details-background" />
                      <div className="profile-post-details-icon like">
                        <AiOutlineHeart size={24} className="like" />
                        {post?.likes.length}
                      </div>
                      <div className="profile-post-details-icon  comment">
                        <AiOutlineComment size={24} color="white" />
                        {post?.comments.length}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="private-account-message">
            <CiLock className="lock-icon" />
            <h3>This Account is Private</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
