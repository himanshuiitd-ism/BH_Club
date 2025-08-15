import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import image from "./images/image3.png";
import useGetSuggestedUser from "../hooks/useGetSuggestedUser";
import axios from "axios";
import { setAuthUser, setUserProfile } from "../redux/authSlice";
import toast from "react-hot-toast";

const SuggestedUser = () => {
  const { user, userProfile } = useSelector((store) => store.auth);
  const { suggestedUser } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  // Call the hook to fetch suggested users
  useGetSuggestedUser();

  // Handle loading and empty states
  if (!suggestedUser) {
    return <div>Loading suggested users...</div>;
  }

  if (suggestedUser.length === 0) {
    return <div>No suggested users available</div>;
  }

  const followHandler = async (userId) => {
    const isFollowed = user?.following?.includes(userId) || false;
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
    <div className="suggestedUser">
      <div className="suggestedUser-heading">
        <h1>Suggested for you</h1>
        <h2>See All</h2>
      </div>
      {suggestedUser.map((Suser) => {
        const isFollowing = user?.following?.includes(Suser._id);

        return (
          <div key={Suser._id} className="rightSideBar-sec1">
            <div className="rightSideBar-user-profile">
              <Link to={`/${Suser._id}/profile`}>
                <img src={Suser?.profilePicture?.url || image} alt="Profile" />
              </Link>
            </div>
            <div className="rightSideBar-user-detail">
              <div className="rightSideBar-user-username">
                <Link to={`/${Suser._id}/profile`}>{Suser?.username}</Link>
              </div>
              <div className="rightSideBar-user-bio">{Suser?.bio}</div>
            </div>
            <button
              className={`follow-button ${isFollowing ? "follow" : "unfollow"}`} //classname me ""follow" : "unfollow"" ulta likha hua hai bcoz maine pehle hi css likh dea tha but ab mai thora design ulta krna chahta tha
              onClick={() => followHandler(Suser._id)}
            >
              {isFollowing ? "UnFollow" : "Follow"}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedUser;
