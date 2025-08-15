import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCommunity } from "../redux/communityslice";
import { setAuthUser, setUserProfile } from "../redux/authSlice";

const LeaveCommunity = ({ setLeaveCommunity, setMoreOptions }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringDelete, setIsHoveringDelete] = useState(false);
  const { selectedCommunity } = useSelector((store) => store.community);
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const handleeventPropagation = (e) => {
    e.stopPropagation(); //iska mtlb hai ki ye useState ke value ko change nhi hone dega
  };
  const leaveGroup = async () => {
    if (!user?._id || !selectedCommunity) {
      return;
    }
    try {
      setLoading(true);
      const res = await axios.patch(
        `http://localhost:8001/api/v1/communities/${selectedCommunity?._id}/leave`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setSelectedCommunity(res.data.data));
        const remainedComm = user?.communities?.filter(
          (id) => id !== selectedCommunity._id
        );
        const updatedUser = {
          ...user,
          communities: remainedComm,
        };
        dispatch(setAuthUser(updatedUser));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setLeaveCommunity(false);
      setMoreOptions(false);
    }
  };
  return (
    <div className="delete-Post-Box" onClick={handleeventPropagation}>
      <center>
        <h1 style={{ fontSize: "30px" }}>
          <b>Leave Community?</b>
        </h1>
      </center>
      <center>
        {isHoveringDelete ? (
          <p>Is this what you really want Mister/Mrs!😒</p>
        ) : isHovering ? (
          <p>That's a gr8 Choice Mister/Mrs😃</p>
        ) : (
          <p>
            Sir/Mam are you sure you want to Leave this <b>Community!☹️</b>
          </p>
        )}
      </center>
      <div>
        <button
          onMouseEnter={() => setIsHoveringDelete(true)}
          onMouseLeave={() => setIsHoveringDelete(false)}
          onClick={leaveGroup}
        >
          {loading ? "Leaving...😒" : "Leave 🫤"}
        </button>
        <button
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LeaveCommunity;
