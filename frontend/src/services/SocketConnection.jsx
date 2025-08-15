import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCommunityOnlineCount,
  setOnlineUsers,
  setSocket,
} from "../redux/socketSlice";

const SocketConnection = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { socket } = useSelector((state) => state.socketio);

  useEffect(() => {
    if (user && !socket) {
      const socketConnection = io("http://localhost:8001", {
        query: {
          userId: user._id,
        },
        transports: ["websocket", "polling"],
      });

      socketConnection.on("connect", () => {
        dispatch(setSocket(socketConnection));
      });

      socketConnection.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      socketConnection.on("communityOnlineCount", ({ communityId, count }) => {
        dispatch(setCommunityOnlineCount({ communityId, count }));
      });

      socketConnection.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      socketConnection.on("connect_error", (error) => {
        console.log("Socket connection error : ", error);
      });

      return () => {
        socketConnection.close();
        dispatch(setSocket(null));
      };
    }
  }, [user, socket, dispatch]);

  useEffect(() => {
    if (!user && socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, socket, dispatch]);
  return children;
};

export default SocketConnection;
