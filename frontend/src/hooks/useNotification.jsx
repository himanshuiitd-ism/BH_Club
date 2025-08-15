import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUserProfile } from "../redux/authSlice";
import { setAllNotification, setUnreadCount } from "../redux/rtnSlice";

const useGetUnreadCount = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const res = await axios.get(
            "http://localhost:8001/api/v1/notifications",
            { withCredentials: true }
          );
          if (res.data.success) {
            dispatch(setUnreadCount(res.data.data.unreadCount));
            dispatch(setAllNotification(res.data.data.notifications));
          }
        } catch (error) {
          console.error("Error fetching unread count:", error);
        }
      }
    };
    fetchUnreadCount();
  }, [user]);
};

export default useGetUnreadCount;
