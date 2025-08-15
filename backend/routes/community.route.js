import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addMembers,
  deleteMessage,
  getCommunityMessage,
  joinGroup,
  likeMsg,
  makeCommunity,
  sendMsgInCommunity,
  suggestedCommunuity,
  toggleLockCommunity,
  reportMessage,
  leaveCommunuity,
  deleteCommunityStart,
  voteDeleteCommunity,
  togglePinMsg,
  unpinMsg,
  deleteCommunityByOwner,
  getCommunityProfile,
  editProfile,
  markMessagesAsSeen,
  getUnseenCount,
} from "../controllers/community.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { profileEditLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Create a community
router.post("/makeCommunity", verifyJWT, makeCommunity);

// Suggest community (not joined)
router.get("/communitySuggestions", verifyJWT, suggestedCommunuity);

// Add members
router.patch("/:communityId/addMembers", verifyJWT, addMembers);

// Join a community
router.patch("/:communityId/joinGroup", verifyJWT, joinGroup);

// Send a message in community
router.post("/:communityId/sendMessage", verifyJWT, sendMsgInCommunity);

// Like or unlike a message
router.put("/:messageId/like", verifyJWT, likeMsg);

// Delete a message
router.delete("/:messageId/delete", verifyJWT, deleteMessage);

// Report a message
router.post("/:messageId/report", verifyJWT, reportMessage);

// Lock or rename a community (admin only)
router.patch("/:communityId/settings", verifyJWT, toggleLockCommunity);

// Get messages of a community
router.get("/:communityId/messages", verifyJWT, getCommunityMessage);

// Leave community
router.patch("/:communityId/leave", verifyJWT, leaveCommunuity);

// Initiate or cancel community deletion vote (admin only)
router.patch("/:communityId/delete/start", verifyJWT, deleteCommunityStart);

// Vote for community deletion (members)
router.patch("/:communityId/delete/vote", verifyJWT, voteDeleteCommunity);

router.post("/:communityId/messages/:messageId/pin", verifyJWT, togglePinMsg);
router.patch("/:communityId/messages/unpin", verifyJWT, unpinMsg);

router.patch(
  "/:communityId/deleteCommunity",
  verifyJWT,
  deleteCommunityByOwner
);

router.post(
  "/:communityId/editCommunity",
  verifyJWT,
  upload.single("newPhoto"),
  profileEditLimiter,
  editProfile
);

router.get("/:communityId/community", verifyJWT, getCommunityProfile);

router.patch("/:communityId/markAsSeen", verifyJWT, markMessagesAsSeen);

router.get("/:communityId/unseenCount", verifyJWT, getUnseenCount);

router.get("/test", (req, res) => {
  res.json({ message: "Community routes working!" });
});

export default router;
