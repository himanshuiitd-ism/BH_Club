import { Notification } from "../models/notification.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const getNotification = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const notification = await Notification.find({ recipient: userId })
      .populate("sender", "username profilePicture")
      .populate("post", "image")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          notifications: notification,
          unreadCount,
          currentPage: page,
          totalPage: Math.ceil(
            (await Notification.countDocuments({ recipient: userId })) / limit
          ),
        },
        "Notification fetched Successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "something is wrong with getNotification in notification.controller"
    );
  }
});

export const markNotificationAsSeen = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isSeen: false },
      { isSeen: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Notification marked as Seen"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "something is wrong with markNotificationAsSeen in notification.controller"
    );
  }
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findByIdAndUpdate(
      {
        _id: notificationId,
        recipient: userId,
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, notification, "Notification marked as Read"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "something is wrong with markNotificationAsRead in notification.controller"
    );
  }
});

export const markAllNotificationAsRead = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const notification = await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      { isRead: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "All Notification marked as Read"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "something is wrong with markAllNotificationAsRead in notification.controller"
    );
  }
});

export const deleteNotification = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          /*Ek hi mila hoga aur usko bhi delete kr dea iseleye no data */
        },
        "Notification deleted successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "something is wrong with markAllNotificationAsRead in notification.controller"
    );
  }
});

//Helper fxn to create notifications (use by other controllers)
//yaha asyncHansdler use nahi hoga bcoz isko kisi route me nahi use krna hai blki baki fxn ke ander use krna hai
export const createNotification = async ({
  recipient,
  sender,
  type,
  post = null,
  message,
}) => {
  //in case apna hi post like kre
  if (recipient.toString() === sender.toString()) {
    return null;
  }

  //for similar notification (to prevent from spam)
  const existingNotification = await Notification.findOne({
    recipient,
    sender,
    type,
    post,
    message,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, //The $gte operator in MongoDB (and Mongoose) stands for "greater than or equal to".
  });

  //update existingNotification insteed of creating a new one for same notification
  if (existingNotification) {
    existingNotification.createdAt = new Date();
    existingNotification.isRead = false;
    existingNotification.isSeen = false;
    await existingNotification.save();
    return existingNotification;
  }

  //for new Notification (jaise hi hm like click kea waise hi is fxn ke paas data aaega aur ye usko notification create kr ke dega)
  const notification = await Notification.create({
    recipient,
    sender,
    type,
    post,
    message,
  });

  return await Notification.findById(notification._id)
    .populate("sender", "username profilePicture")
    .populate("post", "image");
};
