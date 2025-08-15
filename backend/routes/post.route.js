import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addComment,
  bookMarkPost,
  deleteComment,
  deletePost,
  getCommentsAccordingToPost,
  getPost,
  getUserPost,
  likeDislike,
  post,
} from "../controllers/post.controller.js";
import { postCreationLimiter } from "../middlewares/rateLimit.middleware.js";

export const router = express.Router();

// Basic routes (without rate limiting)
router.route("/userpost").post(
  verifyJWT, // Verify user authentication
  upload.single("image"), // Handle single image upload (field name must be 'image')
  postCreationLimiter, // Apply rate limiting
  post
);
router.route("/posts").get(verifyJWT, getPost);
router.route("/posts/user").get(verifyJWT, getUserPost);
router.route("/posts/:postId/like").post(verifyJWT, likeDislike); // Clear action
router.route("/posts/:postId/comments").post(verifyJWT, addComment); // Nested resources
router
  .route("/posts/:postId/allcomments")
  .get(verifyJWT, getCommentsAccordingToPost);
router.route("/posts/:postId/deletecomments").post(verifyJWT, deleteComment);
router.route("/posts/:postId/deletepost").delete(verifyJWT, deletePost);
router.route("/posts/:postId/bookmarkpost").get(verifyJWT, bookMarkPost);

//here _id is id of specific post
export default router;
