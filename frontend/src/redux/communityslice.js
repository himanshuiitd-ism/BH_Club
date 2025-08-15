import { createSlice } from "@reduxjs/toolkit";

const communitySlice = createSlice({
  name: "community",
  initialState: {
    selectedCommunity: null,
    communityProfile: null,
    communityMessages: [],
    suggestedCommunity: [],
    followedCommunity: [],
  },
  reducers: {
    setSelectedCommunity: (state, action) => {
      state.selectedCommunity = action.payload;
    },
    setCommunityProfile: (state, action) => {
      state.communityProfile = action.payload;
    },
    setCommunityMessages: (state, action) => {
      state.communityMessages = action.payload;
    },
    setSuggestedCommunity: (state, action) => {
      state.suggestedCommunity = action.payload;
    },
    setFollowedCommunity: (state, action) => {
      state.followedCommunity = action.payload;
    },
  },
});

export const {
  setCommunityMessages,
  setCommunityProfile,
  setSelectedCommunity,
  setSuggestedCommunity,
  setFollowedCommunity,
} = communitySlice.actions;

export default communitySlice.reducer;
