// src/services/socketService.js - Enhanced version
import { io } from "socket.io-client";

let socket = null;
let store = null;

// Import Redux actions
import {
  setSocket,
  setConnectedStatus,
  setConnectionError,
  setReconnecting,
  clearSocket,
  setCommunityOnlineCount,
} from "../redux/socketSlice";
import { setOnlineUsers } from "../redux/chatSlice";
import { setNotification } from "../redux/rtnSlice";
import { setCommunityMessages } from "../redux/communityslice";
import { useDispatch } from "react-redux";

// Set Redux store reference (call this in your App.js)
export const setStoreReference = (storeRef) => {
  store = storeRef;
};

export const initializeSocket = (userId) => {
  if (!socket && userId) {
    console.log("Initializing socket for user:", userId);

    socket = io("http://localhost:8001", {
      query: { userId },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
      autoConnect: true,
      forceNew: true,
    });

    // Update Redux store
    if (store) {
      store.dispatch(setSocket(socket));
    }

    // Set up all event listeners
    setupSocketListeners();
  }
  return socket;
};

export const setupSocketListeners = () => {
  if (!socket || !store) return;

  // Connection events
  socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
    store.dispatch(setConnectedStatus(true));
    store.dispatch(setConnectionError(null));
    store.dispatch(setReconnecting(false));
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected from server:", reason);
    store.dispatch(setConnectedStatus(false));
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
    store.dispatch(setConnectionError(error.message));
    store.dispatch(setConnectedStatus(false));
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log("Reconnect attempt:", attemptNumber);
    store.dispatch(setReconnecting(true));
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("Reconnected after", attemptNumber, "attempts");
    store.dispatch(setReconnecting(false));
  });

  // Existing functionality
  socket.on("getOnlineUsers", (onlineUsers) => {
    const payload = Array.isArray(onlineUsers) ? onlineUsers : [];
    store.dispatch({
      type: "socketio/setOnlineUsers",
      payload: payload,
    });
  });

  socket.on("notification", (notification) => {
    console.log("Notification received:", notification);
    store.dispatch(setNotification(notification));
  });

  // Community-specific events

  socket.on("communityMessageUpdated", (updatedMessage) => {
    console.log("Community message updated:", updatedMessage);
    const state = store.getState();
    const currentMessages = state.community.communityMessages;
    const updatedMessages = currentMessages.map((msg) =>
      msg._id === updatedMessage._id ? updatedMessage : msg
    );
    store.dispatch(setCommunityMessages(updatedMessages));
  });

  socket.on("roomJoined", (data) => {
    console.log("Successfully joined community room:", data);
  });

  socket.on("communityOnlineCount", ({ communityId, count }) => {
    console.log(`Community ${communityId} online count:`, count);
    store.dispatch(setCommunityOnlineCount(count));
    // You can dispatch this to a specific slice if needed
  });

  socket.on(
    "communityUserTyping",
    ({ userId, displayName, isTyping, communityId }) => {
      console.log(
        `${displayName} is ${
          isTyping ? "typing" : "stopped typing"
        } in ${communityId}`
      );
      // Handle typing indicators if needed
    }
  );
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log("Disconnecting socket");

    // Remove all event listeners
    socket.removeAllListeners();

    // Close connection
    socket.disconnect();
    socket = null;

    // Clear Redux state
    if (store) {
      store.dispatch(clearSocket());
    }
  }
};

// Community-specific helper functions
export const joinCommunityRoom = (communityId) => {
  if (socket && communityId) {
    console.log("Joining community room:", communityId);
    socket.emit("joinCommunityRoom", communityId);
  }
};

export const leaveCommunityRoom = (communityId) => {
  if (socket && communityId) {
    console.log("Leaving community room:", communityId);
    socket.emit("leaveCommunityRoom", communityId);
  }
};

export const sendTypingIndicator = (communityId, isTyping, displayName) => {
  if (socket && communityId) {
    socket.emit("communityTyping", {
      communityId,
      isTyping,
      displayName,
    });
  }
};

// Check connection status
export const isSocketConnected = () => {
  return socket && socket.connected;
};

// Manually reconnect
export const reconnectSocket = () => {
  if (socket && !socket.connected) {
    console.log("Manually reconnecting socket");
    socket.connect();
  }
};
