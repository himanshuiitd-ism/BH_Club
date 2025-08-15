import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    suggestedUser: [],
    userProfile: null, //ye bhi many places pe use hoga to get profile of any user
    selectedUser: null,
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
    },
    setSuggestedUser: (state, action) => {
      state.suggestedUser = action.payload;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    // resetSelectedUser: (state) => {
    //   state.selectedUser = null;
    // },this can be use but it works same as
    // dispatch(setSelectedUser(null));
  },
});

export const {
  setAuthUser,
  setSuggestedUser,
  setUserProfile,
  setSelectedUser,
  // resetSelectedUser,
} = authSlice.actions;
export default authSlice.reducer;

//I still need to add change in this from chatPage
