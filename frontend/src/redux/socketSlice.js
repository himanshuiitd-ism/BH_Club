import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socketio",
  initialState: {
    socket: null,
    onlineUsers: [],
    communityOnlineCount: null,
    isConnected: false,
    connectionError: null,
    reconnecting: false,
  },
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
      state.isConnected = !!action.payload;
      if (action.payload) {
        state.connectionError = null;
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = [...action.payload];
    },
    setCommunityOnlineCount: (state, action) => {
      state.communityOnlineCount = action.payload;
    },
    setConnectedStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    setReconnecting: (state, action) => {
      state.reconnecting = action.payload;
    },
    setConnectionError: (state, action) => {
      state.connectionError = action.payload;
      state.isConnected = false;
    },
    clearSocket: (state) => {
      state.socket = null;
      state.isConnected = false;
      state.connectionError = null;
      state.reconnecting = false;
    },
  },
});

export const {
  setSocket,
  setOnlineUsers,
  setCommunityOnlineCount,
  setConnectedStatus,
  setConnectionError,
  setReconnecting,
  clearSocket,
} = socketSlice.actions;
export default socketSlice.reducer;

// communityOnlineCount: {}, in this object values are like :
//community 1:30,community 2: 40,......
