import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice.js";
import postSlice from "./postSlice.js";
import rtnSlice from "./rtnSlice.js";
import communitySlice from "./communityslice.js";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import socketSlice from "./socketSlice.js";
import chatSlice from "./chatSlice.js";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  // Exclude socketio and rtNotification from persistence
  blacklist: ["socketio", "rtNotification"],
};

const rootReducer = combineReducers({
  auth: authSlice,
  post: postSlice,
  socketio: socketSlice,
  chat: chatSlice,
  rtNotification: rtnSlice,
  community: communitySlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore socket objects in state
        ignoredPaths: ["socketio.socket", "rtNotification"],
      },
    }),
});

export default store;
