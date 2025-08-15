import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteNotification,
  getNotification,
  markAllNotificationAsRead,
  markNotificationAsRead,
  markNotificationAsSeen,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.route("/").get(verifyJWT, getNotification);
router.route("/mark-seen").patch(verifyJWT, markNotificationAsSeen);
router
  .route("/:notificationId/mark-read")
  .patch(verifyJWT, markNotificationAsRead);

router.route("/mark-all-read").patch(verifyJWT, markAllNotificationAsRead);

router.route("/:notificationId").delete(verifyJWT, deleteNotification);

export default router;
