import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../redux/authSlice";
import FollowerList from "./FollowersList";
import { setFollowedCommunity } from "../redux/communityslice";
import toast from "react-hot-toast";

const MakeCommunity = ({ makeCommunity, setMakeCommunity }) => {
  const { user } = useSelector((store) => store.auth);
  const [commDetails, setCommDetails] = useState({
    name: "",
    locked: false, // Changed from 'private' to 'locked'
    members: [],
  });
  const [selectedUser, setSelectedUser] = useState([]);
  const [followerList, setFollowerList] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const dispatch = useDispatch();
  const { followedCommunity } = useSelector((store) => store.community);

  const handlePrivateClick = (e) => {
    const isPrivate = e.target.value === "true";
    setCommDetails({ ...commDetails, locked: isPrivate }); // Changed to 'locked'
  };
  const makeGroup = async () => {
    if (!user?._id) {
      toast.error("You are not logged in");
      return;
    }

    if (!commDetails.name.trim()) {
      toast.error("Please provide a community name");
      return;
    }

    setLoading(true);
    const updatedSetOfUsers = [...commDetails.members, ...selectedUser];

    try {
      console.log("Sending data:", {
        name: commDetails.name,
        members: updatedSetOfUsers,
        locked: commDetails.locked,
      });

      const res = await axios.post(
        `https://bh-club.onrender.com/api/v1/communities/makeCommunity`,
        {
          name: commDetails.name,
          members: updatedSetOfUsers,
          locked: commDetails.locked, // Changed from 'private' to 'locked'
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        console.log("Community created:", res.data.data);

        // Update user's communities in Redux
        dispatch(
          setAuthUser({
            ...user,
            communities: [...(user.communities || []), res.data.data._id],
          })
        );

        // Update followedCommunity in Redux
        dispatch(
          setFollowedCommunity([...followedCommunity, res.data.data._id])
        );

        toast.success("Community created successfully!");
        setMakeCommunity(false);
      }
    } catch (error) {
      console.error("Error creating community:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create community";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Make-community" onClick={(e) => e.stopPropagation()}>
      <div className="Make-community-header">
        <center>
          <h1>Create New Community</h1>
        </center>
        <p>Community Name</p>
        <input
          type="text"
          placeholder="Give this a wonderful name"
          name="name"
          onChange={(e) =>
            setCommDetails({ ...commDetails, name: e.target.value })
          }
          value={commDetails.name}
          required
        />
        <p>Public/Private</p>
        <select value={commDetails.locked} onChange={handlePrivateClick}>
          <option value={false}>Public</option>
          <option value={true}>Private</option>
        </select>
        <p>Add First Members</p>
        <button
          className="Make-community-addMembers"
          onClick={() => setFollowerList(true)}
        >
          Pick your 1st crew members +
        </button>
        <center>
          <button
            className="Create-community-button"
            onClick={makeGroup}
            disabled={loading || !commDetails.name.trim()}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </center>
      </div>
      {followerList && (
        <div
          className="report-modal-overlay"
          style={{ zIndex: "2" }}
          onClick={() => setFollowerList(false)}
        >
          <FollowerList
            setFollowerList={setFollowerList}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </div>
      )}
    </div>
  );
};

export default MakeCommunity;
