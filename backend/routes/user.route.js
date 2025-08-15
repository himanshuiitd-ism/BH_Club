import express from "express";
import {
  deleteUserAccount,
  editProfile,
  followOrUnfollow,
  getProfile,
  getSuggestedUser,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  profileEditLimiter,
  userApiLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Basic routes (without rate limiting)
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/:_id/profile").get(verifyJWT, getProfile);
router
  .route("/profile/edit")
  .post(
    verifyJWT,
    upload.single("profilePicture"),
    profileEditLimiter,
    editProfile
  );
router.route("/suggested").get(verifyJWT, getSuggestedUser);
router.route("/followOrUnfollow/:_id").post(verifyJWT, followOrUnfollow);
router.route("/deleteAccount").post(verifyJWT, deleteUserAccount);

export default router;
