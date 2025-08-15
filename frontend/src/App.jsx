import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import SignUp from "./components/Signup";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Loginme from "./components/Loginme";
import Profile from "./components/Profile";
import { cleanupInvalidData } from "./utils/cleanup";
import { useEffect } from "react";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import { useDispatch, useSelector } from "react-redux";
import useGetUnreadCount from "./hooks/useNotification";
import ProtectedApp from "./components/ProtectedApp";
import Communities from "./components/Communities";
import store from "./redux/store"; // Import your store

// Import socket service functions
import {
  initializeSocket,
  disconnectSocket,
  setStoreReference,
} from "./services/socketService";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedApp>
        <MainLayout />
      </ProtectedApp>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedApp>
            <Home />
          </ProtectedApp>
        ),
      },
      {
        path: "/:id/profile",
        element: (
          <ProtectedApp>
            <Profile />
          </ProtectedApp>
        ),
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedApp>
            <EditProfile />
          </ProtectedApp>
        ),
      },
      {
        path: "/chat",
        element: (
          <ProtectedApp>
            <ChatPage />
          </ProtectedApp>
        ),
      },
      {
        path: "/communities",
        element: (
          <ProtectedApp>
            <Communities />
          </ProtectedApp>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Loginme />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
]);

function App() {
  const { user } = useSelector((store) => store.auth);
  const { socket, isConnected } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();

  // Initialize store reference for socket service
  useEffect(() => {
    setStoreReference(store);
  }, []);

  useEffect(() => {
    // Clean up invalid data when app starts
    cleanupInvalidData();
  }, []);

  useGetUnreadCount();

  // Socket management
  useEffect(() => {
    if (user?._id) {
      initializeSocket(user._id);
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [user?._id]);

  // Log connection status changes
  useEffect(() => {
    if (isConnected) {
      console.log("✅ Socket connected successfully");
    } else {
      console.log("❌ Socket disconnected");
    }
  }, [isConnected]);

  return <RouterProvider router={browserRouter} />;
}

export default App;
