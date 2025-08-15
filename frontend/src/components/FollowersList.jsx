import axios from "axios";
import { useEffect, useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import image from "./images/image3.png";
import { useNavigate } from "react-router-dom";

const FollowerList = ({ setFollowerList, selectedUser, setSelectedUser }) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [noFollowing, setNoFollowing] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  //fetch all users which are following you and you are following them back
  useEffect(() => {
    const fetchFollowingUser = async () => {
      if (!user?.following?.length) {
        setLoading(false);
        setNoFollowing(true);
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
        setAvailableUsers(chatableUser);

        // if (responses[0]?.status === "fulfilled") {
        //   dispatch()
        // }
      } catch (error) {
        console.log("Error in fetchFollowingUser:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingUser();
  }, [user]); // <- This was the main issue - dependency should be [user]

  const removeUser = (userId) => {
    const selectedUserArr = selectedUser.filter((user) => user !== userId);
    setSelectedUser(selectedUserArr);
  };

  // const

  return (
    <div className="followers-list" onClick={(e) => e.stopPropagation()}>
      <div className="followes-list-header">
        <button onClick={() => setFollowerList(false)}>
          <IoMdArrowBack />
        </button>
        <h1>Choose from them</h1>
      </div>
      <div className="followers-list-followers">
        {availableUsers?.map((user) => {
          return (
            <div key={user._id} className="follower-perUser">
              <div className="follower-perUser-profile">
                <img src={user?.profilePicture?.url || image} alt="HP" />
                <h1>{user?.username}</h1>
              </div>
              <div className="follower-perUser-profile-input">
                {selectedUser.includes(user._id) ? (
                  <button onClick={() => removeUser(user._id)}>remove-</button>
                ) : (
                  <button
                    onClick={() => setSelectedUser([...selectedUser, user._id])}
                  >
                    add+
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="followerListSelect">
        <button onClick={() => setFollowerList(false)}>Add+</button>
      </div>
    </div>
  );
};

export default FollowerList;
