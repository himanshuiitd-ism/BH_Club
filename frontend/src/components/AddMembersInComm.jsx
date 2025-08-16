import axios from "axios";
import { useEffect, useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import image from "./images/image3.png";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { setSelectedCommunity } from "../redux/communityslice";

const AddMembersInComm = ({ setAddMem, selectedCommunity }) => {
  const { user } = useSelector((store) => store.auth);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunityData, setSCData] = useState({});
  const [selectedUser, setSelectedUser] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const communityUsers = async () => {
      try {
        const res = await axios.get(
          `https://bh-club.onrender.com/api/v1/communities/${selectedCommunity?._id}/community`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setSCData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };
    communityUsers();
  }, [user?._id, selectedCommunity?._id]);

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
          axios.get(
            `https://bh-club.onrender.com/api/v1/user/${userId}/profile`,
            {
              withCredentials: true,
            }
          )
        );

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

        const addableusers = chatableUser.filter(
          (user) =>
            !selectedCommunityData?.members?.some(
              (member) => member._id.toString() === user._id.toString()
            )
        );
        setAvailableUsers(addableusers);

        // if (responses[0]?.status === "fulfilled") {
        //   dispatch()
        // }
      } catch (error) {
        console.error("Error in fetchFollowingUser:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingUser();
  }, [user, selectedCommunityData]); //must add selectedCommunityData bcoz if not added it will return all chatable users

  const removeUser = (userId) => {
    const selectedUserArr = selectedUser.filter((user) => user !== userId);
    setSelectedUser(selectedUserArr);
  };

  const getSelectedUserDetails = () => {
    return availableUsers.filter((userData) =>
      selectedUser.includes(userData._id)
    );
  };

  const addMembers = async () => {
    try {
      const res = await axios.patch(
        `https://bh-club.onrender.com/api/v1/communities/${selectedCommunity?._id}/addMembers`,
        { members: selectedUser },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setSelectedCommunity(res.data.data));
      }
    } catch (error) {
      console.error("error.message:", error.message);
    }
  };

  return (
    <div
      className="followers-list"
      onClick={(e) => e.stopPropagation()}
      style={{ height: "70vh" }}
    >
      <div className="followes-list-header">
        <button onClick={() => setAddMem(false)} style={{ fontSize: "20px" }}>
          <IoMdArrowBack />
        </button>
        <h1 style={{ fontSize: "25px" }}>Choose from them</h1>
      </div>
      <div
        className="added-user"
        style={{
          width: "100%",
          maxWidth: "300px",
          border: "1px solid black",
          marginTop: "10px",
          borderRadius: "18px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "no-wrap",
          overflow: "auto",
          gap: "5px",
          padding: "5px",
          minHeight: "35px",
          height: "auto",
        }}
      >
        {selectedUser.length === 0 ? (
          <span style={{ color: "#666", fontSize: "14px" }}>
            No users selected
          </span>
        ) : (
          getSelectedUserDetails().map((userData) => (
            <span
              key={userData._id}
              style={{
                backgroundColor: "#f0f0f0",
                padding: "3px 8px",
                borderRadius: "15px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {userData.username}
              <button
                onClick={() => removeUser(userData._id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "red",
                  fontSize: "12px",
                }}
              >
                ×
              </button>
            </span>
          ))
        )}
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
        <button
          onClick={() => {
            setAddMem(false);
            addMembers();
          }}
        >
          Add+
        </button>
      </div>
    </div>
  );
};

export default AddMembersInComm;
