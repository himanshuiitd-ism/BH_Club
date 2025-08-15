import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "notification",
  initialState: {
    likenotification: [], // Real-time notifications
    unreadCount: 0, // Count from server
    allNotification: [],
  },
  reducers: {
    setAllNotification: (state, action) => {
      state.allNotification = action.payload;
    },
    setNotification: (state, action) => {
      const { type, userId, postId } = action.payload;

      if (type === "like") {
        // Add like notification
        state.likenotification.unshift(action.payload);
        // Increment unread count for real-time notifications
        state.unreadCount += 1;
      } else if (type === "dislike") {
        // Remove like notification
        state.likenotification = state.likenotification.filter(
          (item) => !(item.userId === userId && item.postId === postId)
        );
        // Decrement unread count
        state.unreadCount = state.unreadCount > 0 ? state.unreadCount - 1 : 0;
      }
    },

    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    clearRealTimeNotifications: (state) => {
      state.likenotification = [];
    },

    clearAllNotifications: (state) => {
      state.likenotification = [];
      state.unreadCount = 0;
    },

    markNotificationAsSeen: (state) => {
      // Clear real-time notifications when notification box is opened
      state.likenotification = [];
      // Don't reset unreadCount here as it should be managed by server
    },
  },
});

export const {
  setAllNotification,
  setNotification,
  setUnreadCount,
  clearRealTimeNotifications,
  clearAllNotifications,
  markNotificationAsSeen,
} = rtnSlice.actions;

export default rtnSlice.reducer;
