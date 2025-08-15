// In your postSlice.js
import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    selectedPost: null,
  },
  reducers: {
    setPosts: (state, action) => {
      // Filter out posts with null or undefined authors
      state.posts = action.payload.filter(post => post?.author?._id);
    },
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
    // Add a reducer to clean up invalid posts
    cleanupInvalidPosts: (state) => {
      state.posts = state.posts.filter(post => post?.author?._id);
    }
  }
});

export const { setPosts, setSelectedPost, cleanupInvalidPosts } = postSlice.actions;
export default postSlice.reducer;