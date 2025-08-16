import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setSuggestedUser } from "../redux/authSlice";

const useGetSuggestedUser = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchSuggestedUser = async () => {
      try {
        const res = await axios.get(
          "https://bh-club.onrender.com/api/v1/user/suggested",
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          dispatch(setSuggestedUser(res.data.data.users));
        }
      } catch (error) {
        console.error("The error is :", error);
      }
    };
    fetchSuggestedUser();
  }, []);
};

export default useGetSuggestedUser;

//ya to inko inke jsx file me jaise laate the waise le aao ya yaha hook jaise le aao koi phark nahi prta
